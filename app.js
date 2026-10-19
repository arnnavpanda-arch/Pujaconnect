require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectDB } = require('./lib/db');
const { User, Pandit, Booking, LongPujaRequest, Puja, AppSetting } = require('./lib/models');
const { sendTemplate, sendSafe } = require('./lib/mailer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const JWT_SECRET = () => process.env.JWT_SECRET || 'pujaconnect_dev_secret';
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const lc = (s) => String(s || '').trim().toLowerCase();

// ---- No-cache on all API responses ----
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// ---- Diagnostics (no DB needed) ----
app.get('/api/ping', (req, res) => res.json({ status: 'ok', time: Date.now() }));
app.get('/api/health', wrap(async (req, res) => {
  let s = mongoose.connection.readyState;
  if (s !== 1 && process.env.MONGO_URI) {
    try {
      await connectDB();
      s = mongoose.connection.readyState;
    } catch {}
  }
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.status(s === 1 ? 200 : 503).json({
    status: s === 1 ? 'ok' : 'degraded',
    database: states[s] || 'unknown',
    readyState: s,
    hasMongoUri: Boolean(process.env.MONGO_URI),
    time: Date.now()
  });
}));

// ---- Ensure DB connection for everything else ----
app.use('/api', wrap(async (req, res, next) => {
  if (req.path === '/health' || req.path === '/ping' || req.path === '/db-status') {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[API Database Connection Error]:', err.message);
    res.status(503).json({
      error: 'Database connection failed. Please check MONGO_URI and MongoDB Atlas IP access (0.0.0.0/0).',
      details: err.message
    });
  }
}));

// ---- Auth helpers ----
const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, phone: u.phone, state: u.state, district: u.district, city: u.city, role: u.role, status: u.status || 'Active', createdAt: u.createdAt });
const sign = (payload) => jwt.sign(payload, JWT_SECRET(), { expiresIn: '7d' });
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  try { req.auth = jwt.verify(token, JWT_SECRET()); next(); } catch { res.status(401).json({ error: 'Authentication required' }); }
}
function adminOnly(req, res, next) {
  auth(req, res, () => (req.auth.role === 'admin' ? next() : res.status(403).json({ error: 'Admin access required' })));
}

// ---- Authentication & Users ----
const PANDIT_OTPS = new Map();

// Check whether verified pandits with admin-fixed Dakshina rates exist for district/state
async function hasPricedPanditsInDistrict(district = '', state = '') {
  const dRegex = district ? new RegExp('^' + district.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') : null;
  const sRegex = state ? new RegExp('^' + state.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') : null;
  const distKey = district ? district.trim().toLowerCase() : '';

  const pandits = await Pandit.find({
    $and: [
      {
        $or: [
          { status: 'Verified' },
          { status: new RegExp('^verified$', 'i') },
          { verified: true }
        ]
      },
      {
        $or: [
          ...(dRegex ? [{ district: dRegex }, { workingDistricts: dRegex }] : []),
          ...(sRegex ? [{ state: sRegex }, { workingState: sRegex }] : [])
        ]
      }
    ]
  }).lean();

  return pandits.some(p => {
    if (!p.districtPrices || typeof p.districtPrices !== 'object') return false;
    if (distKey) {
      const pk = Object.keys(p.districtPrices).find(k => k.trim().toLowerCase() === distKey);
      return Boolean(pk && Number(p.districtPrices[pk]) > 0);
    }
    return Object.values(p.districtPrices).some(v => Number(v) > 0);
  });
}

function bookingFindQuery(param) {
  return {
    $or: [
      { bookingId: param },
      { _id: String(param).match(/^[0-9a-fA-F]{24}$/) ? param : null }
    ]
  };
}

app.post('/api/auth/register', wrap(async (req, res) => {
  const { name, email, phone, state, district, city } = req.body;
  if (!email || !name || !phone) return res.status(400).json({ error: 'Name, email and phone are required' });
  const e = lc(email);
  let user = await User.findOne({ email: e });
  let existing = true;
  if (!user) {
    existing = false;
    user = await User.create({
      name, email: e, phone, state, district, city,
      password: '', role: 'user'
    });
  } else {
    user.name = name || user.name;
    user.phone = phone || user.phone;
    // Lock state and district: once set, cannot be changed
    if (!user.state && state) user.state = state;
    if (!user.district && district) user.district = district;
    if (city) user.city = city;
    await user.save();
  }

  // If the devotee's district currently has no priced pandits, tag them for 404 waiting
  const targetDist = (user.district || user.city || user.state || '').trim();
  if (targetDist) {
    const isPriced = await hasPricedPanditsInDistrict(user.district || user.city, user.state);
    if (!isPriced) {
      const dKey = targetDist.toLowerCase();
      user.is404Waiting = true;
      if (!Array.isArray(user.waiting404Districts)) user.waiting404Districts = [];
      if (!user.waiting404Districts.includes(dKey)) user.waiting404Districts.push(dKey);
      await user.save();
    }
  }

  res.json({ user: publicUser(user), token: sign({ email: user.email, role: user.role }), existing });
}));

// Devotee Login (Email only - no password, no OTP)
app.post('/api/auth/devotee-login', wrap(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Please enter your registered email' });
  const e = lc(email);
  const user = await User.findOne({ email: e });
  if (!user) {
    return res.status(404).json({ error: 'No devotee account found with this email. Please click "Create Devotee Account" first.' });
  }
  res.json({ user: publicUser(user), token: sign({ email: user.email, role: user.role }) });
}));

// Magic Rebook Login: auto authenticates devotee directly when clicking "Click Here to Rebook" in email
app.post('/api/auth/magic-rebook', wrap(async (req, res) => {
  const { bookingId, email, token } = req.body || {};
  let userEmail = email ? lc(email) : '';
  let valid = false;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET());
      if (decoded && decoded.email) {
        userEmail = lc(decoded.email);
        valid = true;
      }
    } catch (e) {
      // Token verify failed or expired, will attempt fallback verification below
    }
  }

  let booking = null;
  if (bookingId) {
    booking = await Booking.findOne(bookingFindQuery(bookingId));
    if (booking) {
      if (!userEmail) userEmail = lc(booking.userEmail);
      if (lc(booking.userEmail) === userEmail) {
        valid = true;
      }
    }
  }

  if (!valid || !userEmail) {
    return res.status(401).json({ error: 'Invalid or expired rebooking authorization link' });
  }

  let user = await User.findOne({ email: userEmail });
  if (!user) {
    user = await User.create({
      name: (booking && booking.userName) || 'Devotee',
      email: userEmail,
      phone: (booking && booking.phone) || '',
      district: (booking && booking.district) || 'Khordha',
      role: 'user'
    });
  }

  res.json({
    ok: true,
    user: publicUser(user),
    token: sign({ email: user.email, role: user.role }),
    booking
  });
}));

// Magic login and decision verification for Pandits responding via email
app.post('/api/auth/magic-pandit-decision', wrap(async (req, res) => {
  const { bookingId, email, token } = req.body || {};
  let panditEmail = email ? lc(email) : '';
  let valid = false;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET());
      if (decoded && decoded.email) {
        panditEmail = lc(decoded.email);
        valid = true;
      }
    } catch (e) {
      // Fallback to booking validation below
    }
  }

  let booking = null;
  if (bookingId) {
    booking = await Booking.findOne(bookingFindQuery(bookingId));
    if (booking) {
      if (!panditEmail) panditEmail = lc(booking.panditEmail);
      if (lc(booking.panditEmail) === panditEmail || (booking.rejectedPandits || []).includes(panditEmail)) {
        valid = true;
      }
    }
  }

  if (!valid || !panditEmail) {
    return res.status(401).json({ error: 'Invalid or expired Pandit assignment authorization link' });
  }

  let pandit = await Pandit.findOne({ email: panditEmail });
  if (!pandit) {
    return res.status(404).json({ error: 'Pandit profile not found' });
  }

  const userSession = {
    name: pandit.name,
    email: pandit.email,
    phone: pandit.phone,
    role: 'pandit',
    verified: pandit.verified,
    district: pandit.district
  };
  const authToken = sign({ email: pandit.email, role: 'pandit' });

  res.json({
    ok: true,
    user: userSession,
    token: authToken,
    booking
  });
}));

// Pandit Login Step 1: Send Email OTP
app.post('/api/auth/pandit/send-otp', wrap(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Please enter your registered Pandit email' });
  const e = lc(email);
  const p = await Pandit.findOne({ email: e });
  if (!p) {
    return res.status(404).json({ error: 'No Pandit registered with this email. Please click "Pandit Registration" first.' });
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  PANDIT_OTPS.set(e, { code, expires: Date.now() + 10 * 60 * 1000 });
  try {
    await sendSafe('PANDIT_OTP', p.email, { name: p.name, otp: code });
  } catch (err) {
    console.warn('Pandit OTP email notification:', err.message);
  }
  res.json({ ok: true, message: `Verification code sent to ${p.email}`, email: p.email });
}));

// Pandit Login Step 2: Verify OTP
app.post('/api/auth/pandit/verify-otp', wrap(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });
  const e = lc(email);
  const record = PANDIT_OTPS.get(e);
  if (!record || record.expires < Date.now()) {
    return res.status(400).json({ error: 'OTP expired or not found. Please click "Send OTP" again.' });
  }
  if (String(record.code).trim() !== String(otp).trim()) {
    return res.status(401).json({ error: 'Invalid OTP code. Please check your email and try again.' });
  }
  PANDIT_OTPS.delete(e);
  const p = await Pandit.findOne({ email: e });
  if (!p) return res.status(404).json({ error: 'Pandit not found' });
  res.json({
    user: { name: p.name, email: p.email, phone: p.phone, role: 'pandit', panditId: String(p._id), status: p.status },
    token: sign({ email: p.email, role: 'pandit' })
  });
}));

// Legacy / Direct Login Fallback
app.post('/api/auth/login', wrap(async (req, res) => {
  const { email, role } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const e = lc(email);
  if (role === 'pandit') {
    const p = await Pandit.findOne({ email: e });
    if (!p) return res.status(404).json({ error: 'Pandit account not found' });
    return res.json({
      user: { name: p.name, email: p.email, phone: p.phone, role: 'pandit', panditId: String(p._id), status: p.status },
      token: sign({ email: p.email, role: 'pandit' })
    });
  }
  const user = await User.findOne({ email: e });
  if (!user) return res.status(404).json({ error: 'No account found. Please register first.' });
  res.json({ user: publicUser(user), token: sign({ email: user.email, role: user.role }) });
}));

// ---- Direct Passwordless Admin Entry ----
app.post('/api/auth/admin-direct', wrap(async (req, res) => {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@pujaconnect.com').toLowerCase();
  let user = await User.findOne({ email: adminEmail });
  if (!user) {
    user = await User.create({ name: 'Super Admin', email: adminEmail, phone: '0000000000', password: '', role: 'admin' });
  }
  res.json({
    user: { name: user.name, email: user.email, phone: user.phone, role: 'admin' },
    token: sign({ email: user.email, role: 'admin' })
  });
}));

// ---- Database connection health check ----
app.get('/api/db-status', wrap(async (req, res) => {
  let s = mongoose.connection.readyState;
  if (s !== 1) {
    try {
      await connectDB();
      s = mongoose.connection.readyState;
    } catch (e) {
      // s remains current readyState
    }
  }
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  res.json({
    connected: s === 1,
    status: s === 1 ? 'Connected' : 'Disconnected',
    readyState: s,
    stateText: states[s] || 'Unknown',
    dbName: mongoose.connection.name || 'pujaconnect',
    host: (mongoose.connection.host || 'MongoDB Atlas Cluster')
  });
}));

app.get('/api/users', adminOnly, wrap(async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 }).lean();
  res.json(users);
}));

app.get('/api/users/profile', auth, wrap(async (req, res) => {
  const user = await User.findOne({ email: lc(req.auth.email) }).lean();
  if (!user) return res.status(404).json({ error: 'Devotee profile not found' });
  res.json(publicUser(user));
}));

app.put('/api/users/profile', auth, wrap(async (req, res) => {
  const { name, phone, state, district, city } = req.body;
  const user = await User.findOne({ email: lc(req.auth.email) });
  if (!user) return res.status(404).json({ error: 'Devotee profile not found' });
  if (name) user.name = name;
  if (phone) user.phone = phone;
  // If user is a devotee ('user'), state and district are locked once set
  if (user.role === 'user') {
    if (!user.state && state) user.state = state;
    if (!user.district && district) user.district = district;
  } else {
    if (state !== undefined) user.state = state;
    if (district !== undefined) user.district = district;
  }
  if (city !== undefined) user.city = city;

  const targetDist = (user.district || user.city || user.state || '').trim();
  if (targetDist) {
    const isPriced = await hasPricedPanditsInDistrict(user.district || user.city, user.state);
    if (!isPriced) {
      const dKey = targetDist.toLowerCase();
      user.is404Waiting = true;
      if (!Array.isArray(user.waiting404Districts)) user.waiting404Districts = [];
      if (!user.waiting404Districts.includes(dKey)) user.waiting404Districts.push(dKey);
    }
  }

  await user.save();
  res.json(publicUser(user));
}));

app.delete('/api/users/:id', adminOnly, wrap(async (req, res) => {
  const raw = req.params.id ? decodeURIComponent(req.params.id).trim() : '';
  const query = /^[0-9a-fA-F]{24}$/.test(raw) ? { _id: raw } : { email: lc(raw) };
  const user = await User.findOneAndDelete(query);
  if (!user) return res.status(404).json({ error: 'Devotee not found' });
  res.json({ ok: true, deletedId: user._id });
}));

app.post('/api/users/bulk-delete', adminOnly, wrap(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'IDs array required' });
  const objectIds = ids.filter(i => /^[0-9a-fA-F]{24}$/.test(i));
  const emails = ids.map(lc);
  const result = await User.deleteMany({
    $or: [
      { _id: { $in: objectIds } },
      { email: { $in: emails } }
    ],
    role: { $ne: 'admin' }
  });
  res.json({ ok: true, count: result.deletedCount });
}));

app.put('/api/users/:id/status', adminOnly, wrap(async (req, res) => {
  const raw = req.params.id ? decodeURIComponent(req.params.id).trim() : '';
  const query = /^[0-9a-fA-F]{24}$/.test(raw) ? { _id: raw } : { email: lc(raw) };
  const { status } = req.body;
  const user = await User.findOneAndUpdate(query, { status: status || 'Active' }, { new: true });
  if (!user) return res.status(404).json({ error: 'Devotee not found' });
  res.json({ ok: true, user: publicUser(user) });
}));

// ---- Pujas catalog ----
app.get('/api/pujas', wrap(async (req, res) => {
  const q = req.query.type ? { type: req.query.type } : {};
  res.json(await Puja.find(q).sort({ type: 1, name: 1 }));
}));
app.post('/api/pujas', adminOnly, wrap(async (req, res) => {
  const p = await Puja.findOneAndUpdate({ name: req.body.name }, req.body, { upsert: true, new: true, setDefaultsOnInsert: true });
  res.json(p);
}));
app.delete('/api/pujas/:id', adminOnly, wrap(async (req, res) => {
  await Puja.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

// ---- Pandits ----
app.get('/api/pandits', wrap(async (req, res) => {
  const q = {};
  if (req.query.verified === 'true') q.verified = true;
  if (req.query.status) q.status = req.query.status;
  if (req.query.email) q.email = new RegExp('^' + req.query.email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
  if (req.query.district) q.$or = [{ district: req.query.district }, { workingDistricts: req.query.district }];
  if (req.query.state) q.$and = [{ $or: [{ state: req.query.state }, { workingState: req.query.state }] }];
  // All registered pandits can perform all pujas; pandits are not excluded by service
  res.json(await Pandit.find(q).sort({ experience: -1 }).lean());
}));

// Public endpoint for Puja Price Configuration (State-wise & District-wise pricing chart)
app.get('/api/pricing-configuration', wrap(async (req, res) => {
  const pandits = await Pandit.find({ status: 'Verified' }).sort({ experience: -1 }).lean();
  const pujas = await Puja.find({}).lean();

  const stateMap = {};

  pandits.forEach(p => {
    const stateName = (p.workingState || p.state || 'Odisha').trim();
    if (!stateMap[stateName]) {
      stateMap[stateName] = {
        state: stateName,
        pandits: [],
        districtSet: new Set(),
        districtPriceMatrix: {}
      };
    }
    const stateObj = stateMap[stateName];
    const workingDists = (Array.isArray(p.workingDistricts) && p.workingDistricts.length)
      ? p.workingDistricts
      : [p.district || 'Khordha'];

    const distPrices = p.districtPrices || {};

    stateObj.pandits.push({
      _id: p._id,
      name: p.name,
      experience: p.experience,
      exp: p.exp || `${p.experience || 5}+ Years`,
      specialty: p.specialty || 'Vedic Rituals',
      fee: p.fee || 1500,
      state: stateName,
      location: p.location || `${p.city || p.district || ''}, ${stateName}`,
      workingDistricts: workingDists,
      districtPrices: distPrices,
      services: p.services || [],
      photo: p.photo,
      status: p.status,
      verified: p.verified
    });

    workingDists.forEach(d => {
      const cleanDist = d.trim();
      stateObj.districtSet.add(cleanDist);
      if (!stateObj.districtPriceMatrix[cleanDist]) {
        stateObj.districtPriceMatrix[cleanDist] = [];
      }
      const price = (distPrices[cleanDist] && Number(distPrices[cleanDist]) > 0)
        ? Number(distPrices[cleanDist])
        : (p.fee || 1500);

      stateObj.districtPriceMatrix[cleanDist].push({
        panditId: p._id,
        panditName: p.name,
        price
      });
    });
  });

  const states = Object.keys(stateMap).sort().map(sName => {
    const s = stateMap[sName];
    const districtSummary = Object.keys(s.districtPriceMatrix).sort().map(dName => {
      const pList = s.districtPriceMatrix[dName];
      const prices = pList.map(item => item.price);
      return {
        district: dName,
        availablePanditsCount: pList.length,
        panditNames: pList.map(item => item.panditName),
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        typicalFee: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      };
    });

    return {
      state: sName,
      totalVerifiedPandits: s.pandits.length,
      districtsCoveredCount: s.districtSet.size,
      districts: Array.from(s.districtSet).sort(),
      districtSummary,
      pandits: s.pandits
    };
  });

  res.json({
    ok: true,
    states,
    pujas,
    totalStates: states.length,
    totalVerifiedPandits: pandits.length,
    lastSynchronized: new Date().toISOString()
  });
}));

app.get('/api/pandits/:id', wrap(async (req, res) => {
  const raw = req.params.id ? decodeURIComponent(req.params.id).trim() : '';
  let p = null;
  if (/^[0-9a-fA-F]{24}$/.test(raw)) {
    try { p = await Pandit.findById(raw).lean(); } catch {}
  }
  if (!p && raw.includes('@')) {
    p = await Pandit.findOne({ email: new RegExp('^' + raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }).lean();
  }
  if (!p && raw) {
    p = await Pandit.findOne({ phone: raw }).lean();
  }
  if (!p) return res.status(404).json({ error: 'Pandit not found' });
  res.json(p);
}));

app.post('/api/pandits/register', wrap(async (req, res) => {
  const b = req.body;
  if (!b.name || !b.email || !b.phone) return res.status(400).json({ error: 'Name, email and phone are required' });
  if (await Pandit.findOne({ email: lc(b.email) })) return res.status(409).json({ error: 'A Pandit with this email already exists' });
  const experience = Number(b.experience) || 5;
  const districts = Array.isArray(b.workingDistricts) && b.workingDistricts.length ? b.workingDistricts : [b.district || 'Khordha'];
  const pandit = await Pandit.create({
    ...b,
    email: lc(b.email),
    experience,
    exp: `${experience}+ Years`,
    fee: Number(b.fee) || 1500,
    workingDistricts: districts,
    location: b.location || `${b.city || b.district || ''}, ${b.state || 'Odisha'}`,
    idDoc: b.idDoc || b.documentUrl || '',
    status: 'Pending Review',
    verified: false
  });
  res.status(201).json(pandit);
}));

// Devotee dashboard records that this user is currently viewing the 404 error page and subscribed for updates
app.post('/api/region-notifications/subscribe-404', wrap(async (req, res) => {
  const { email, district, state } = req.body || {};
  const target = district || state;
  if (!email || !target) return res.status(400).json({ error: 'Email and district/location required' });
  const e = lc(email);
  const distKey = String(target).trim().toLowerCase();
  const stateKey = state ? String(state).trim().toLowerCase() : '';

  const distsToAdd = [distKey, String(target).trim()];
  if (stateKey) distsToAdd.push(stateKey);

  const updated = await User.findOneAndUpdate(
    { email: new RegExp('^' + e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') },
    {
      $addToSet: { waiting404Districts: { $each: distsToAdd } },
      $set: { is404Waiting: true }
    },
    { new: true }
  );

  console.log(`[subscribe-404] Subscribed user ${e} for 404 alerts in ${distKey}:`, updated ? 'Success' : 'User not found in DB');
  res.json({ ok: true, subscribed: true, district: distKey, email: e });
}));

// Automatically notify ONLY devotees who hit the 404 error page when admin sets the district-wise amount
async function notify404DevoteesForDistricts(districts = [], state = '', specificPandit = null) {
  if (!Array.isArray(districts) || !districts.length) return;
  const uniqueDistricts = [...new Set(districts.map(d => String(d).trim()).filter(Boolean))];
  // Track notified devotees in this pricing save so that each 404 user receives ONLY ONE email for their district
  const alreadyNotifiedInBatch = new Set();

  for (const dist of uniqueDistricts) {
    const distKey = dist.toLowerCase().trim();

    // First check specificPandit if passed
    let panditWithPrice = null;
    if (specificPandit) {
      const prices = specificPandit.districtPrices;
      if (prices && typeof prices === 'object') {
        const priceKey = Object.keys(prices).find(k => k.trim().toLowerCase() === distKey);
        if (priceKey && Number(prices[priceKey]) > 0) {
          panditWithPrice = specificPandit;
        }
      }
    }

    // Check if there is at least one active, verified pandit for this district who has admin-set district dakshina rates
    if (!panditWithPrice) {
      const distRegex = new RegExp('^' + distKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
      const verifiedPanditsInDist = await Pandit.find({
        $and: [
          {
            $or: [
              { status: 'Verified' },
              { status: new RegExp('^verified$', 'i') },
              { verified: true }
            ]
          },
          {
            $or: [
              { district: distRegex },
              { workingDistricts: distRegex }
            ]
          }
        ]
      }).lean();

      panditWithPrice = verifiedPanditsInDist.find(p => {
        if (p.districtPrices && typeof p.districtPrices === 'object') {
          const priceKey = Object.keys(p.districtPrices).find(k => k.trim().toLowerCase() === distKey);
          if (priceKey && Number(p.districtPrices[priceKey]) > 0) return true;
        }
        return false;
      });
    }

    // Send email ONLY after the admin has set the district-wise amount!
    if (panditWithPrice) {
      const priceKey = Object.keys(panditWithPrice.districtPrices || {}).find(k => k.trim().toLowerCase() === distKey);
      const districtFee = priceKey ? Number(panditWithPrice.districtPrices[priceKey]) : (panditWithPrice.fee || 1500);

      // Query ONLY devotees who encountered the 404 error page specifically for THIS district!
      // No other district is matched or shown!
      const distRegex = new RegExp('^' + distKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
      const waitingDevotees = await User.find({
        role: { $ne: 'pandit' },
        serviceNotifiedDistricts: { $ne: distKey }, // Devotee has not already been notified for this district
        $or: [
          { waiting404Districts: distKey },
          { waiting404Districts: dist.trim() },
          { waiting404Districts: distRegex },
          { is404Waiting: true, district: distRegex },
          { is404Waiting: true, city: distRegex }
        ]
      });

      console.log(`[notify404] Found ${waitingDevotees.length} 404-waiting devotee(s) strictly for district "${dist}" (Dakshina: ₹${districtFee})`);

      for (const devotee of waitingDevotees) {
        if (!devotee.email) continue;
        const devoteeEmail = devotee.email.trim().toLowerCase();

        // Enforce: ONLY ONE single email per devotee for their specific district
        if (alreadyNotifiedInBatch.has(devoteeEmail)) {
          continue;
        }
        alreadyNotifiedInBatch.add(devoteeEmail);

        console.log(`[notify404] Sending strictly one notification email to 404 user: ${devotee.email} for district ${dist}`);
        const mailRes = await sendSafe('REGION_SERVICE_AVAILABLE', devotee.email, {
          userName: devotee.name,
          email: devotee.email,
          district: dist,
          state: devotee.state || state || 'India',
          panditName: panditWithPrice.name ? `Pandit ${panditWithPrice.name}` : 'Verified Vedic Purohits',
          fee: districtFee
        });
        console.log(`[notify404] Email result for ${devotee.email}:`, mailRes);

        // Mark user as notified for this district so they never receive duplicate emails
        await User.updateOne(
          { _id: devotee._id },
          {
            $addToSet: { serviceNotifiedDistricts: distKey },
            $pull: {
              waiting404Districts: {
                $in: [distKey, dist, dist.toLowerCase(), dist.trim()]
              }
            },
            $set: { is404Waiting: false }
          }
        );
      }
    }
  }
}

// Reset notification status for districts that no longer have verified pandits
async function cleanupDistrictsWithoutPandits(districts = []) {
  if (!Array.isArray(districts) || !districts.length) return;
  const uniqueDistricts = [...new Set(districts.map(d => String(d).trim()).filter(Boolean))];

  for (const dist of uniqueDistricts) {
    const distKey = dist.toLowerCase();
    const count = await Pandit.countDocuments({
      status: 'Verified',
      $or: [
        { district: new RegExp('^' + dist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') },
        { workingDistricts: new RegExp('^' + dist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
      ]
    });

    if (count === 0) {
      // Clear notification flag for users who had been notified for this district
      await User.updateMany(
        { serviceNotifiedDistricts: distKey },
        { $pull: { serviceNotifiedDistricts: distKey } }
      );
    }
  }
}

app.put('/api/pandits/:id/status', adminOnly, wrap(async (req, res) => {
  const { status } = req.body;
  if (!['Verified', 'Rejected', 'Pending Review'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const raw = req.params.id ? decodeURIComponent(req.params.id).trim() : '';
  const query = /^[0-9a-fA-F]{24}$/.test(raw) ? { _id: raw } : { email: new RegExp('^' + raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') };
  const p = await Pandit.findOneAndUpdate(query, { status, verified: status === 'Verified' }, { new: true });
  if (!p) return res.status(404).json({ error: 'Pandit not found' });
  if (status !== 'Pending Review') await sendSafe('PANDIT_VERIFIED', p.email, { panditName: p.name, status });

  const covered = [p.district, ...(p.workingDistricts || [])].filter(Boolean);
  if (status !== 'Verified') {
    await cleanupDistrictsWithoutPandits(covered);
  }

  res.json(p);
}));

app.put('/api/pandits/:id', wrap(async (req, res) => {
  const allowed = [
    'name', 'phone', 'state', 'district', 'city', 'location',
    'workingState', 'workingDistricts', 'experience', 'exp', 'specialty',
    'bio', 'services', 'availableDays', 'daySlots', 'timeSlots',
    'photo', 'documentUrl', 'idDoc', 'fee', 'bankAccount', 'ifscCode',
    'upiId', 'bankName', 'accountHolder', 'qrCode', 'districtPrices'
  ];
  const update = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
  const rawId = req.params.id ? decodeURIComponent(req.params.id).trim() : '';
  const query = /^[0-9a-fA-F]{24}$/.test(rawId) ? { _id: rawId } : { email: new RegExp('^' + rawId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') };
  const oldPandit = await Pandit.findOne(query).lean();
  const p = await Pandit.findOneAndUpdate(query, { $set: update }, { new: true, strict: false, runValidators: false }).lean();
  if (!p) return res.status(404).json({ error: 'Pandit not found' });

  // If districts were modified (e.g. pandit removed districts)
  if (req.body.workingDistricts !== undefined || req.body.district !== undefined) {
    const oldDistricts = oldPandit ? [oldPandit.district, ...(oldPandit.workingDistricts || [])].filter(Boolean) : [];
    const newDistricts = [p.district, ...(p.workingDistricts || [])].filter(Boolean);
    const removedDistricts = oldDistricts.filter(d => !newDistricts.includes(d));

    // Do NOT send notification emails when the pandit saves!
    // Notification emails must strictly send ONLY when the ADMIN fixes the district rate and saves.
    if (removedDistricts.length) {
      await cleanupDistrictsWithoutPandits(removedDistricts);
    }
  }

  res.json(p);
}));

app.delete('/api/pandits/:id', adminOnly, wrap(async (req, res) => {
  const rawId = req.params.id ? decodeURIComponent(req.params.id).trim() : '';
  const query = /^[0-9a-fA-F]{24}$/.test(rawId) ? { _id: rawId } : { email: new RegExp('^' + rawId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') };
  const p = await Pandit.findOneAndDelete(query);
  if (!p) return res.status(404).json({ error: 'Pandit not found' });
  const covered = [p.district, ...(p.workingDistricts || [])].filter(Boolean);
  await cleanupDistrictsWithoutPandits(covered);
  res.json({ ok: true, deletedId: p._id });
}));

app.post('/api/pandits/bulk-delete', adminOnly, wrap(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'IDs array required' });
  const objectIds = ids.filter(i => /^[0-9a-fA-F]{24}$/.test(i));
  const emails = ids.map(lc);
  const targets = await Pandit.find({
    $or: [
      { _id: { $in: objectIds } },
      { email: { $in: emails } }
    ]
  }).lean();
  const allDistricts = [];
  targets.forEach(p => {
    allDistricts.push(p.district, ...(p.workingDistricts || []));
  });

  const result = await Pandit.deleteMany({
    $or: [
      { _id: { $in: objectIds } },
      { email: { $in: emails } }
    ]
  });
  await cleanupDistrictsWithoutPandits(allDistricts);
  res.json({ ok: true, count: result.deletedCount });
}));

// Pandit or Admin submits/updates bank details
app.put(['/api/pandits/:id/bank-details', '/api/pandits/bank-details', '/api/pandit/bank-details'], wrap(async (req, res) => {
  const rawId = req.params.id ? decodeURIComponent(req.params.id).trim() : '';

  // Extract auth token payload if present
  let authUser = null;
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) {
    try { authUser = jwt.verify(h.slice(7), JWT_SECRET()); req.auth = authUser; } catch {}
  }

  const bodyId = req.body && (req.body.panditId || req.body.id || req.body._id) ? String(req.body.panditId || req.body.id || req.body._id).trim() : '';
  const bodyEmail = req.body && req.body.email ? String(req.body.email).trim() : '';
  const bodyPhone = req.body && req.body.phone ? String(req.body.phone).trim() : '';
  const authEmail = authUser && authUser.email ? String(authUser.email).trim() : '';

  let p = null;
  // 1. Try finding by MongoDB _id if rawId is 24 hex characters
  if (/^[0-9a-fA-F]{24}$/.test(rawId)) {
    try { p = await Pandit.findById(rawId); } catch {}
  }
  // 2. Try finding by bodyId if 24 hex characters
  if (!p && /^[0-9a-fA-F]{24}$/.test(bodyId)) {
    try { p = await Pandit.findById(bodyId); } catch {}
  }
  // 3. Try finding by rawId as email
  if (!p && rawId && rawId.includes('@')) {
    p = await Pandit.findOne({ email: new RegExp('^' + rawId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') });
  }
  // 4. Try finding by body email
  if (!p && bodyEmail) {
    p = await Pandit.findOne({ email: new RegExp('^' + bodyEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') });
  }
  // 5. Try finding by auth user email
  if (!p && authEmail) {
    p = await Pandit.findOne({ email: new RegExp('^' + authEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') });
  }
  // 6. Try finding by phone
  if (!p && rawId && !rawId.includes('@') && /^[0-9+]+$/.test(rawId)) {
    p = await Pandit.findOne({ phone: rawId });
  }
  if (!p && bodyPhone) {
    p = await Pandit.findOne({ phone: bodyPhone });
  }
  // 7. If rawId is 24 hex characters, check if it was a User id
  if (!p && /^[0-9a-fA-F]{24}$/.test(rawId)) {
    try {
      const u = await User.findById(rawId);
      if (u && u.email) {
        p = await Pandit.findOne({ email: new RegExp('^' + u.email + '$', 'i') });
      }
    } catch {}
  }

  const { bankAccount, bankName, ifscCode, accountHolder, upiId, qrCode } = req.body || {};
  const cleanAcc = String(bankAccount || '').replace(/[\s-]/g, '').trim();
  const cleanIfsc = String(ifscCode || '').replace(/[\s-]/g, '').trim().toUpperCase();

  if (!cleanAcc) {
    return res.status(400).json({ error: 'Bank Account Number is required' });
  }
  if (!cleanIfsc) {
    return res.status(400).json({ error: 'Bank IFSC Code is required' });
  }

  // If pandit record not found yet, create or link it
  if (!p) {
    const targetEmail = lc(bodyEmail || (rawId.includes('@') ? rawId : '') || authEmail);
    const targetPhone = String(bodyPhone || (rawId && !rawId.includes('@') && /^[0-9+]+$/.test(rawId) ? rawId : '') || (authUser && authUser.phone) || '').trim();

    let u = null;
    if (targetEmail) {
      try { u = await User.findOne({ email: targetEmail }); } catch {}
    }
    if (!u && targetPhone) {
      try { u = await User.findOne({ phone: targetPhone }); } catch {}
    }

    const fallbackEmail = targetEmail || (u && u.email) || (rawId && rawId.includes('@') ? lc(rawId) : '') || (req.auth && req.auth.email) || `pandit_${Date.now()}@pujaconnect.com`;
    const fallbackName = String(accountHolder || (u && u.name) || (req.body && req.body.name) || 'Vedic Pandit').trim();
    const fallbackPhone = String(targetPhone || (u && u.phone) || '9999999999').trim();

    p = await Pandit.findOne({ email: new RegExp('^' + fallbackEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') });

    if (!p) {
      p = await Pandit.create({
        name: fallbackName,
        email: fallbackEmail,
        phone: fallbackPhone,
        state: (u && u.state) || 'Odisha',
        district: (u && u.district) || 'Khordha',
        city: (u && u.city) || 'Bhubaneswar',
        status: (u && u.role === 'admin') ? 'Verified' : 'Pending Review',
        verified: (u && u.role === 'admin'),
        bankAccount: cleanAcc,
        bankName: String(bankName || '').trim(),
        ifscCode: cleanIfsc,
        accountHolder: String(accountHolder || fallbackName).trim(),
        upiId: String(upiId || '').trim(),
        qrCode: String(qrCode || '').trim()
      });
      return res.json({ ok: true, pandit: p });
    }
  }

  const update = {
    bankAccount: cleanAcc,
    bankName: String(bankName || '').trim(),
    ifscCode: cleanIfsc,
    accountHolder: String(accountHolder || p.accountHolder || p.name).trim(),
    upiId: String(upiId || '').trim()
  };
  if (qrCode !== undefined) {
    update.qrCode = String(qrCode || '').trim();
  }

  const updated = await Pandit.findByIdAndUpdate(
    p._id,
    { $set: update },
    { new: true, strict: false, runValidators: false }
  ).lean();

  res.json({ ok: true, pandit: updated || { ...(p.toObject ? p.toObject() : p), ...update } });
}));

const DEFAULT_PLATFORM_COMMISSION = 10; // Default 10% platform fee

app.get('/api/platform-commission', wrap(async (req, res) => {
  const s = await AppSetting.findOne({ key: 'admin_commission_percent' });
  const percent = s && typeof s.value === 'number' ? s.value : (s && s.value && typeof s.value.percent === 'number' ? s.value.percent : DEFAULT_PLATFORM_COMMISSION);
  res.json({ ok: true, percent, commissionPercent: percent });
}));

app.put('/api/platform-commission', adminOnly, wrap(async (req, res) => {
  const inputVal = req.body.percent !== undefined ? req.body.percent : req.body.commissionPercent;
  const percent = Math.max(0, Math.min(100, Number(inputVal !== undefined && inputVal !== '' ? inputVal : DEFAULT_PLATFORM_COMMISSION)));
  const s = await AppSetting.findOneAndUpdate(
    { key: 'admin_commission_percent' },
    { value: percent },
    { upsert: true, new: true }
  );

  // Apply the updated percentage to all pending / unsettled bookings so it updates all payments
  let updatedBookingsCount = 0;
  const pendingBookings = await Booking.find({ panditPayoutStatus: { $ne: 'Paid' } });
  for (const b of pendingBookings) {
    const mainFee = Number(b.fee) || 1500;
    const adminCut = Math.round((mainFee * percent) / 100);
    const netPayout = Math.max(0, mainFee - adminCut);
    b.adminFeePercent = percent;
    b.adminFeeAmount = adminCut;
    b.panditNetPayout = netPayout;
    b.panditPayoutAmount = netPayout;
    await b.save();
    updatedBookingsCount++;
  }

  res.json({
    ok: true,
    percent: s.value,
    commissionPercent: s.value,
    updatedBookingsCount,
    message: `Platform commission updated to ${percent}% and applied to ${updatedBookingsCount} pending payments.`
  });
}));

// Admin fixes district-wise amounts for a Pandit
app.put('/api/pandits/:id/district-prices', adminOnly, wrap(async (req, res) => {
  const { fee, districtPrices } = req.body;
  const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) ? { _id: req.params.id } : { email: lc(req.params.id) };
  const update = {};
  if (fee !== undefined) update.fee = Number(fee) || 1500;
  if (districtPrices !== undefined) update.districtPrices = districtPrices;
  // Ensure the pandit is verified and active when admin sets official district rates
  update.status = 'Verified';
  update.verified = true;
  const p = await Pandit.findOneAndUpdate(query, { $set: update }, { new: true, strict: false, runValidators: false }).lean();
  if (!p) return res.status(404).json({ error: 'Pandit not found' });

  // When admin sets district prices, notify ONLY 404-error devotees waiting for those districts
  const pricedDistricts = Object.keys(districtPrices || {}).filter(d => Number(districtPrices[d]) > 0);

  // Await notification dispatch so serverless environments (e.g. Vercel) never terminate before emails are sent
  if (pricedDistricts.length > 0) {
    try {
      await notify404DevoteesForDistricts(pricedDistricts, p.workingState || p.state, p);
    } catch (err) {
      console.error('[notify404 error in district-prices]:', err.message);
    }
  }

  res.json(p);
}));

// Centralized Platform Bank Details (Managed exclusively by Admin)
const DEFAULT_PLATFORM_BANK = {
  accountHolder: 'PujaConnect Official Platform Account',
  bankName: 'State Bank of India',
  accountNumber: '40918237465',
  ifscCode: 'SBIN0001234',
  upiId: 'pujaconnect@upi',
  qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=pujaconnect@upi&pn=PujaConnect%20Vedic%20Services&cu=INR'
};

app.get('/api/platform-bank-details', wrap(async (req, res) => {
  const s = await AppSetting.findOne({ key: 'platform_bank_details' });
  res.json(s && s.value ? { ...DEFAULT_PLATFORM_BANK, ...s.value } : DEFAULT_PLATFORM_BANK);
}));

app.put('/api/platform-bank-details', adminOnly, wrap(async (req, res) => {
  const { accountHolder, bankName, accountNumber, ifscCode, upiId, qrCode } = req.body;
  const currentDoc = await AppSetting.findOne({ key: 'platform_bank_details' });
  const current = currentDoc && currentDoc.value ? currentDoc.value : DEFAULT_PLATFORM_BANK;
  const updated = {
    ...current,
    accountHolder: accountHolder !== undefined ? String(accountHolder).trim() : current.accountHolder,
    bankName: bankName !== undefined ? String(bankName).trim() : current.bankName,
    accountNumber: accountNumber !== undefined ? String(accountNumber).trim() : current.accountNumber,
    ifscCode: ifscCode !== undefined ? String(ifscCode).trim().toUpperCase() : current.ifscCode,
    upiId: upiId !== undefined ? String(upiId).trim() : current.upiId,
    qrCode: qrCode !== undefined ? String(qrCode).trim() : current.qrCode
  };
  const s = await AppSetting.findOneAndUpdate(
    { key: 'platform_bank_details' },
    { value: updated },
    { upsert: true, new: true }
  );
  res.json(s.value);
}));

// ---- Bookings ----
async function uniqueId(Model, field, prefix) {
  for (let i = 0; i < 10; i++) {
    const id = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    if (!(await Model.findOne({ [field]: id }))) return id;
  }
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

// bookingFindQuery(param) is defined at top of file

app.get('/api/bookings', wrap(async (req, res) => {
  const q = {};
  if (req.query.userEmail) q.userEmail = lc(req.query.userEmail);
  if (req.query.panditEmail) q.panditEmail = lc(req.query.panditEmail);
  if (req.query.status) q.status = req.query.status;
  if (req.query.paymentStatus) q.paymentStatus = req.query.paymentStatus;
  if (req.query.bookingId) q.bookingId = req.query.bookingId;
  res.json(await Booking.find(q).sort({ transactionDate: -1 }).lean());
}));

app.get('/api/bookings/:id', wrap(async (req, res) => {
  const b = await Booking.findOne(bookingFindQuery(req.params.id)).lean();
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  res.json(b);
}));

app.delete('/api/bookings/:id', adminOnly, wrap(async (req, res) => {
  const b = await Booking.findOneAndDelete(bookingFindQuery(req.params.id));
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  res.json({ ok: true, deletedId: b.bookingId || b._id });
}));

app.post('/api/bookings/bulk-delete', adminOnly, wrap(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'IDs array required' });
  const objectIds = ids.filter(i => /^[0-9a-fA-F]{24}$/.test(i));
  const result = await Booking.deleteMany({
    $or: [
      { bookingId: { $in: ids } },
      { _id: { $in: objectIds } }
    ]
  });
  res.json({ ok: true, count: result.deletedCount });
}));

// Build a comprehensive, uncompacted report of verified scholars & rates in a devotee's location
async function prepareDevoteeLocationReport(district = '', state = '') {
  const cleanDist = (district || '').trim();
  const cleanState = (state || 'Odisha').trim();
  if (!cleanDist) {
    return { district: '', state: cleanState, totalPandits: 0, pandits: [], minPrice: 1199, maxPrice: 1500 };
  }

  const dRegex = new RegExp('^' + cleanDist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
  const panditsInArea = await Pandit.find({
    $and: [
      {
        $or: [
          { status: 'Verified' },
          { status: new RegExp('^verified$', 'i') },
          { verified: true }
        ]
      },
      {
        $or: [
          { district: dRegex },
          { workingDistricts: dRegex }
        ]
      }
    ]
  }).lean();

  const panditList = panditsInArea.map((p) => {
    let rate = 0;
    if (p.districtPrices && typeof p.districtPrices === 'object') {
      const matchKey = Object.keys(p.districtPrices).find(
        (k) => k.trim().toLowerCase() === cleanDist.toLowerCase()
      );
      if (matchKey && Number(p.districtPrices[matchKey]) > 0) {
        rate = Number(p.districtPrices[matchKey]);
      }
    }
    if (!rate || isNaN(rate) || rate <= 0) {
      rate = Number(p.fee) || 1500;
    }
    return {
      name: p.name,
      photo: p.photo,
      specialty: p.specialty || 'Vedic Rituals & Katha',
      experience: p.exp || `${p.experience || 5}+ Years Vedic Rigor`,
      districtRate: rate
    };
  });

  const prices = panditList.map((x) => x.districtRate);
  return {
    district: cleanDist,
    state: cleanState,
    totalPandits: panditList.length,
    pandits: panditList,
    minPrice: prices.length ? Math.min(...prices) : 1199,
    maxPrice: prices.length ? Math.max(...prices) : 1500
  };
}

// Devotee books a puja: selecting a specific pandit is OPTIONAL.
// Sends booking request confirmation email with filtered local scholars & rates report.
app.post('/api/bookings', wrap(async (req, res) => {
  const b = req.body;
  if (!b.userEmail || !b.service || !b.date || !b.district) {
    return res.status(400).json({ error: 'Missing required booking fields (userEmail, service, date, district)' });
  }

  // Enforce devotee locked district: devotee cannot change district
  const devoteeUser = await User.findOne({ email: lc(b.userEmail) });
  if (devoteeUser && devoteeUser.district) {
    b.district = devoteeUser.district;
  }

  let preferredPandit = null;
  if (b.panditEmail && lc(b.panditEmail) !== 'any' && lc(b.panditEmail) !== '') {
    preferredPandit = await Pandit.findOne({ email: lc(b.panditEmail), verified: true });
  }

  let fee = Number(b.fee) || 0;
  if (!fee && preferredPandit) {
    fee = (preferredPandit.districtPrices && preferredPandit.districtPrices[b.district]) || preferredPandit.fee || 1500;
  }
  // When Any Available Verified Pandit is chosen, Standard Base Dakshina is removed and fee remains 0 until Admin assigns a Pandit

  const advanceAmount = Number(b.advanceAmount) || 0;
  const bookingId = await uniqueId(Booking, 'bookingId', 'PUJA');

  const commSetting = await AppSetting.findOne({ key: 'admin_commission_percent' });
  const commPct = commSetting && typeof commSetting.value === 'number' ? commSetting.value : DEFAULT_PLATFORM_COMMISSION;
  const adminFeeAmount = Math.round((fee * commPct) / 100);
  const panditNetPayout = Math.max(0, fee - adminFeeAmount);

  const booking = await Booking.create({
    bookingId,
    userEmail: lc(b.userEmail),
    userName: b.userName || 'Devotee',
    phone: b.phone || '',
    service: b.service,
    date: b.date,
    time: b.time || '08:00 AM - 11:00 AM',
    district: b.district,
    address: b.address || '',
    preferredPanditEmail: preferredPandit ? preferredPandit.email : '',
    preferredPanditName: preferredPandit ? preferredPandit.name : 'Any Available Verified Pandit',
    panditEmail: '',
    panditName: 'To Be Assigned by Admin',
    status: 'Pending Assignment',
    panditApproval: 'Pending',
    adminApproval: 'Pending',
    rejectedPandits: [],
    rejectionReason: '',
    fee,
    adminFeePercent: commPct,
    adminFeeAmount,
    panditNetPayout,
    advanceAmount,
    advancePaid: advanceAmount > 0,
    paymentStatus: advanceAmount <= 0 ? 'Pending' : advanceAmount >= fee ? 'Paid' : 'Partial',
    bookingType: b.bookingType || 'Standard'
  });

  // Prepare uncompacted location report for the devotee's registered account district
  const devoteeLocDistrict = (devoteeUser && devoteeUser.district) ? devoteeUser.district.trim() : booking.district;
  const devoteeLocState = (devoteeUser && devoteeUser.state) ? devoteeUser.state.trim() : 'Odisha';
  const locationReport = await prepareDevoteeLocationReport(devoteeLocDistrict, devoteeLocState);

  // Send acknowledgement email to devotee with local area report
  const mailPayload = {
    ...booking.toObject(),
    preferredPanditName: preferredPandit ? preferredPandit.name : 'Any Available Verified Pandit',
    district: booking.district,
    address: booking.address || booking.district,
    locationReport
  };
  const mailResult = await sendSafe('BOOKING_REQUEST_RECEIVED', booking.userEmail, mailPayload);

  res.status(201).json({
    ok: true,
    booking,
    emailSent: Boolean(mailResult && mailResult.ok),
    emailError: mailResult && !mailResult.ok ? mailResult.error : null,
    message: 'Booking request submitted! Our team will assign a verified Pandit as soon as possible.'
  });
}));

// Admin assigns an available Pandit to a booking
app.put('/api/bookings/:id/assign-pandit', adminOnly, wrap(async (req, res) => {
  const { panditEmail } = req.body;
  if (!panditEmail) return res.status(400).json({ error: 'Please select a Pandit to assign' });

  const b = await Booking.findOne(bookingFindQuery(req.params.id));
  if (!b) return res.status(404).json({ error: 'Booking not found' });

  const pRegex = new RegExp('^' + lc(panditEmail).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
  const pandit = (await Pandit.findOne({ email: pRegex, $or: [{ verified: true }, { status: 'Verified' }] })) || (await Pandit.findOne({ email: pRegex }));
  if (!pandit) return res.status(404).json({ error: 'Selected Pandit does not exist' });

  // Slot clash check
  const clash = await Booking.findOne({
    bookingId: { $ne: b.bookingId },
    panditEmail: pandit.email,
    date: b.date,
    time: b.time,
    status: { $in: ['Confirmed', 'In Progress'] }
  });
  if (clash) {
    return res.status(409).json({ error: `Pandit ${pandit.name} is already booked on ${b.date} at ${b.time}. Please select another Pandit.` });
  }

  const fee = (pandit.districtPrices && pandit.districtPrices[b.district]) || pandit.fee || (b.fee > 0 ? b.fee : 1500);
  const commSetting = await AppSetting.findOne({ key: 'admin_commission_percent' });
  const commPct = commSetting && typeof commSetting.value === 'number' ? commSetting.value : (b.adminFeePercent || DEFAULT_PLATFORM_COMMISSION);
  const adminFeeAmount = Math.round((fee * commPct) / 100);
  const panditNetPayout = Math.max(0, fee - adminFeeAmount);

  b.panditEmail = pandit.email;
  b.panditName = pandit.name;
  b.fee = fee;
  b.adminFeePercent = commPct;
  b.adminFeeAmount = adminFeeAmount;
  b.panditNetPayout = panditNetPayout;
  b.status = 'Pending Pandit Confirmation';
  b.panditApproval = 'Pending';
  b.adminApproval = 'Approved';
  await b.save();

  // Sign authorization token and build one-click decision URLs for Pandit email
  const panditToken = sign({ email: pandit.email, role: 'pandit', bookingId: b.bookingId, purpose: 'pandit_offer_response' });
  const reqHost = req.get('host') || '';
  const reqProto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  const origin = req.headers.origin || (reqHost ? `${reqProto}://${reqHost}` : 'https://pujaconnect-one.vercel.app');
  const baseUrl = process.env.APP_URL || origin;
  const acceptUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(pandit.email)}&decision=Accept&token=${encodeURIComponent(panditToken)}`;
  const rejectUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(pandit.email)}&decision=Reject&token=${encodeURIComponent(panditToken)}`;
  const reviewUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(pandit.email)}&token=${encodeURIComponent(panditToken)}`;

  // Send assignment offer alert to Pandit with uncompacted fee, breakdown, and direct Accept/Reject action links
  const targetEmail = lc(pandit.email);
  const emailRes = await sendSafe('PANDIT_NEW_BOOKING', targetEmail, {
    ...b.toObject(),
    userName: b.userName,
    userEmail: b.userEmail,
    phone: b.phone || b.userPhone,
    panditName: pandit.name,
    panditEmail: targetEmail,
    district: b.district,
    address: b.address || b.district,
    date: b.date,
    time: b.time,
    fee,
    totalPujaCost: fee,
    adminFeePercent: commPct,
    adminFeeAmount,
    adminFee: adminFeeAmount,
    netDakshina: panditNetPayout,
    panditFee: panditNetPayout,
    panditToken,
    acceptUrl,
    rejectUrl,
    reviewUrl,
    baseUrl
  });

  res.json({
    ok: true,
    booking: b,
    emailSent: emailRes.ok,
    emailError: emailRes.ok ? null : emailRes.error,
    panditEmail: targetEmail,
    acceptUrl,
    reviewUrl,
    message: emailRes.ok
      ? `Ceremony offered and notification email successfully sent to ${pandit.name} (${targetEmail})`
      : `Pandit assigned, but email notification failed: ${emailRes.error}`
  });
}));

// Admin can fetch the one-click Pandit offer link to share via WhatsApp / SMS
app.get('/api/bookings/:id/pandit-offer-link', adminOnly, wrap(async (req, res) => {
  const b = await Booking.findOne(bookingFindQuery(req.params.id));
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  if (!b.panditEmail) return res.status(400).json({ error: 'No Pandit assigned to this ceremony yet' });

  const panditToken = sign({ email: b.panditEmail, role: 'pandit', bookingId: b.bookingId, purpose: 'pandit_offer_response' });
  const reqHost = req.get('host') || '';
  const reqProto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  const origin = req.headers.origin || (reqHost ? `${reqProto}://${reqHost}` : 'https://pujaconnect-one.vercel.app');
  const baseUrl = process.env.APP_URL || origin;
  const acceptUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(b.panditEmail)}&decision=Accept&token=${encodeURIComponent(panditToken)}`;
  const rejectUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(b.panditEmail)}&decision=Reject&token=${encodeURIComponent(panditToken)}`;
  const reviewUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(b.panditEmail)}&token=${encodeURIComponent(panditToken)}`;

  res.json({
    ok: true,
    bookingId: b.bookingId,
    service: b.service,
    date: b.date,
    time: b.time,
    district: b.district,
    panditName: b.panditName,
    panditEmail: b.panditEmail,
    netDakshina: b.panditNetPayout || b.fee,
    acceptUrl,
    rejectUrl,
    reviewUrl
  });
}));

// Admin can resend offer email to the assigned Pandit at any time (or to an alternate email if primary bounced)
app.post('/api/bookings/:id/resend-pandit-offer', adminOnly, wrap(async (req, res) => {
  const b = await Booking.findOne(bookingFindQuery(req.params.id));
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  if (!b.panditEmail) return res.status(400).json({ error: 'No Pandit assigned to this ceremony yet' });

  const pRegex = new RegExp('^' + lc(b.panditEmail).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
  const pandit = (await Pandit.findOne({ email: pRegex })) || { name: b.panditName || 'Pandit ji', email: b.panditEmail };

  const fee = b.fee || (pandit.districtPrices && pandit.districtPrices[b.district]) || pandit.fee || 1500;
  const commPct = b.adminFeePercent || DEFAULT_PLATFORM_COMMISSION;
  const adminFeeAmount = b.adminFeeAmount || Math.round((fee * commPct) / 100);
  const panditNetPayout = b.panditNetPayout || Math.max(0, fee - adminFeeAmount);

  const panditToken = sign({ email: pandit.email, role: 'pandit', bookingId: b.bookingId, purpose: 'pandit_offer_response' });
  const reqHost = req.get('host') || '';
  const reqProto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  const origin = req.headers.origin || (reqHost ? `${reqProto}://${reqHost}` : 'https://pujaconnect-one.vercel.app');
  const baseUrl = process.env.APP_URL || origin;
  const acceptUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(pandit.email)}&decision=Accept&token=${encodeURIComponent(panditToken)}`;
  const rejectUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(pandit.email)}&decision=Reject&token=${encodeURIComponent(panditToken)}`;
  const reviewUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(pandit.email)}&token=${encodeURIComponent(panditToken)}`;

  const targetEmail = lc(req.body && req.body.alternateEmail ? req.body.alternateEmail : pandit.email);
  const emailRes = await sendSafe('PANDIT_NEW_BOOKING', targetEmail, {
    ...b.toObject(),
    userName: b.userName,
    userEmail: b.userEmail,
    phone: b.phone || b.userPhone,
    panditName: pandit.name,
    panditEmail: targetEmail,
    district: b.district,
    address: b.address || b.district,
    date: b.date,
    time: b.time,
    fee,
    totalPujaCost: fee,
    adminFeePercent: commPct,
    adminFeeAmount,
    adminFee: adminFeeAmount,
    netDakshina: panditNetPayout,
    panditFee: panditNetPayout,
    panditToken,
    acceptUrl,
    rejectUrl,
    reviewUrl,
    baseUrl
  });

  if (!emailRes.ok) {
    return res.status(500).json({ error: `Failed to deliver email to ${targetEmail}: ${emailRes.error}` });
  }

  res.json({
    ok: true,
    acceptUrl,
    reviewUrl,
    targetEmail,
    message: `Ceremony offer email successfully sent to ${pandit.name} (${targetEmail})! 🙏`
  });
}));

// Pandit accepts or rejects the ceremony assignment
app.put('/api/bookings/:id/pandit-response', wrap(async (req, res) => {
  const { response, rejectionReason, panditEmail, token } = req.body; // 'Accept' | 'Reject'
  if (!['Accept', 'Reject'].includes(response)) {
    return res.status(400).json({ error: 'Invalid response. Must be Accept or Reject.' });
  }

  const b = await Booking.findOne(bookingFindQuery(req.params.id));
  if (!b) return res.status(404).json({ error: 'Booking not found' });

  // Optional token verification if called directly from email link
  let verifiedPanditEmail = panditEmail ? lc(panditEmail) : (b.panditEmail ? lc(b.panditEmail) : '');
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET());
      if (decoded && decoded.email) verifiedPanditEmail = lc(decoded.email);
    } catch (e) {}
  }

  if (response === 'Accept') {
    b.status = 'Confirmed';
    b.panditApproval = 'Approved';
    if (verifiedPanditEmail && !b.panditEmail) {
      const p = await Pandit.findOne({ email: verifiedPanditEmail });
      if (p) {
        b.panditEmail = p.email;
        b.panditName = p.name;
      }
    }
    const pandit = await Pandit.findOne({ email: lc(b.panditEmail) });
    if (pandit && pandit.phone) {
      b.panditPhone = pandit.phone;
    }
    await b.save();

    // Now send the official confirmation email automatically to devotee's registered email with website link!
    const devoteeEmail = (b.userEmail || '').trim().toLowerCase();
    const locationReport = await prepareDevoteeLocationReport(b.district, b.state || 'Odisha');
    if (devoteeEmail) {
      await sendSafe('BOOKING_CONFIRMATION', devoteeEmail, {
        ...b.toObject(),
        userName: b.userName,
        userEmail: devoteeEmail,
        panditName: b.panditName || (pandit ? pandit.name : 'Vedic Pandit'),
        panditPhone: (pandit && pandit.phone) || b.panditPhone || 'Available in Devotee Dashboard',
        service: b.service,
        date: b.date,
        time: b.time,
        district: b.district,
        address: b.address || b.district,
        fee: b.fee,
        portalUrl: 'https://pujaconnect-one.vercel.app/#dashboard',
        appUrl: 'https://pujaconnect-one.vercel.app',
        locationReport
      });
    }
  } else {
    // Rejected by Pandit: DO NOT send email to devotee!
    // Admin will reassign another available pandit. Devotee is only contacted if Admin marks slot unavailable.
    const rejectedEmail = verifiedPanditEmail || b.panditEmail;
    const rejectedName = b.panditName;
    if (rejectedEmail && !b.rejectedPandits.includes(rejectedEmail)) {
      b.rejectedPandits.push(rejectedEmail);
    }
    b.status = 'Pending Assignment';
    b.panditApproval = 'Rejected';
    b.rejectionReason = rejectionReason || `Declined by ${rejectedName || 'Pandit'}`;
    b.panditEmail = '';
    b.panditName = 'To Be Assigned by Admin';
    await b.save();
  }

  res.json({ ok: true, booking: b });
}));

app.put('/api/bookings/:id/status', wrap(async (req, res) => {
  const { status, reason, havanConducted, havanNotes } = req.body;
  if (!['Pending Assignment', 'Pending Pandit Confirmation', 'Confirmed', 'Completed', 'Cancelled', 'Rejected', 'In Progress'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const isApproved = ['Confirmed', 'In Progress'].includes(status);
  const b = await Booking.findOne(bookingFindQuery(req.params.id));
  if (!b) return res.status(404).json({ error: 'Booking not found' });

  b.status = status;
  if (havanConducted !== undefined) b.havanConducted = Boolean(havanConducted);
  if (havanNotes) b.havanNotes = String(havanNotes).trim();
  b.panditApproval = isApproved ? 'Approved' : (status === 'Cancelled' || status === 'Rejected') ? 'Rejected' : 'Pending';

  if (status === 'Rejected') {
    b.slotUnavailable = true;
    b.adminApproval = 'Rejected';
    b.rejectionReason = reason ? String(reason).trim() : 'No verified Vedic Pandit available for this time slot. Please reschedule or rebook with a different date/time.';
    b.panditEmail = '';
    b.panditName = 'No Pandit Available for Slot';
  }
  await b.save();

  if (isApproved) {
    await sendSafe('PANDIT_CONFIRMED_BOOKING', b.userEmail, { bookingId: b.bookingId, userName: b.userName, panditName: b.panditName, service: b.service, date: b.date, time: b.time, district: b.district, address: b.address, fee: b.fee });
  } else if (status === 'Rejected') {
    const rebookToken = sign({ email: b.userEmail, role: 'user', bookingId: b.bookingId, purpose: 'rebook' });
    const appUrl = `https://pujaconnect-one.vercel.app/?action=rebook&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(b.userEmail)}&token=${encodeURIComponent(rebookToken)}`;
    await sendSafe('BOOKING_SLOT_UNAVAILABLE_REBOOK', b.userEmail, {
      ...b.toObject(),
      rejectionReason: b.rejectionReason,
      appUrl,
      rebookUrl: appUrl,
      rebookToken
    });
  } else if (status === 'Cancelled') {
    await sendSafe('PANDIT_REJECTED_BOOKING', b.userEmail, { bookingId: b.bookingId, userName: b.userName, panditName: b.panditName, service: b.service, date: b.date, district: b.district });
  }

  res.json(b);
}));

app.post('/api/bookings/:id/submit-payment', wrap(async (req, res) => {
  const { paymentProof, paymentMethod } = req.body;
  if (!paymentProof) return res.status(400).json({ error: 'Payment Transaction Ref / ID is required' });
  const b = await Booking.findOne(bookingFindQuery(req.params.id));
  if (!b) return res.status(404).json({ error: 'Booking not found' });

  // When devotee submits payment, status is 'Under Processing'.
  // Do NOT prematurely mark ceremony as 'Completed' or 'Paid' yet!
  b.paymentStatus = 'Under Processing';
  b.advanceAmount = b.fee;
  b.advancePaid = false;
  b.paymentProof = String(paymentProof).trim();
  b.paymentMethod = paymentMethod || 'UPI/Bank Transfer';
  b.paymentDate = new Date();
  b.paymentRejectionReason = '';
  await b.save();

  res.json({
    ok: true,
    booking: b,
    message: 'Payment submitted successfully! Your payment is under processing and awaiting Admin verification.'
  });
}));

app.post('/api/bookings/:id/verify-payment', wrap(async (req, res) => {
  const b = await Booking.findOne(bookingFindQuery(req.params.id));
  if (!b) return res.status(404).json({ error: 'Booking not found' });

  // When Admin verifies payment, devotee is marked 'Paid & Verified' and ceremony is marked Completed!
  b.paymentStatus = 'Paid & Verified';
  b.status = 'Completed';
  b.advanceAmount = b.fee;
  b.advancePaid = true;
  b.paymentRejectionReason = '';
  if (!b.invoiceId) {
    b.invoiceId = 'INV-' + b.bookingId.replace('PUJA-', '') + '-' + Date.now().toString().slice(-4);
    b.invoiceGeneratedAt = new Date();
  }
  await b.save();

  // Fetch assigned pandit to extract bank and contact details
  let pandit = null;
  if (b.panditEmail) {
    pandit = await Pandit.findOne({ email: lc(b.panditEmail) });
  }

  const vMainFee = Number(b.fee) || 1500;
  const vFeePct = Number(b.adminFeePercent !== undefined ? b.adminFeePercent : 10);
  const vFeeCut = Number(b.adminFeeAmount !== undefined ? b.adminFeeAmount : Math.round((vMainFee * vFeePct) / 100));
  const vNetDakshina = Number(b.panditNetPayout !== undefined && b.panditNetPayout > 0 ? b.panditNetPayout : Math.max(0, vMainFee - vFeeCut));

  // 1. Notify assigned pandit that devotee paid and money will be credited within 24 hours
  if (b.panditEmail) {
    await sendSafe('PANDIT_PAYMENT_VERIFIED_NOTICE', b.panditEmail, {
      bookingId: b.bookingId,
      service: b.service,
      panditName: (pandit && pandit.name) || b.panditName || 'Pandit ji',
      userName: b.userName,
      userPhone: b.phone || '',
      userEmail: b.userEmail,
      date: b.date,
      time: b.time,
      district: b.district,
      address: b.address,
      totalAmount: vMainFee,
      amount: vMainFee,
      adminFeePercent: vFeePct,
      adminFeeAmount: vFeeCut,
      netAmount: vNetDakshina,
      upiId: (pandit && pandit.upiId) || '',
      bankAccount: (pandit && pandit.bankAccount) || '',
      bankName: (pandit && pandit.bankName) || '',
      ifscCode: (pandit && pandit.ifscCode) || '',
      accountHolder: (pandit && pandit.accountHolder) || (pandit && pandit.name) || '',
      qrCode: (pandit && pandit.qrCode) || '',
      paymentProof: b.paymentProof,
      paymentMethod: b.paymentMethod
    });
  }

  // 2. Send complete payment receipt email to devotee
  await sendSafe('PAYMENT_RECEIPT', b.userEmail, {
    bookingId: b.bookingId,
    userName: b.userName,
    userPhone: b.phone || '',
    userEmail: b.userEmail,
    reference: b.invoiceId || b.bookingId,
    service: b.service,
    panditName: (pandit && pandit.name) || b.panditName || 'Assigned Pandit',
    date: b.date,
    time: b.time,
    district: b.district,
    address: b.address,
    total: b.fee,
    amount: b.fee,
    paymentProof: b.paymentProof,
    paymentMethod: b.paymentMethod
  });

  res.json({ ok: true, booking: b });
}));

// Admin pays Pandit: marks payout as Paid and emails Pandit with credited amount & account number
app.post('/api/bookings/:id/pay-pandit', adminOnly, wrap(async (req, res) => {
  const b = await Booking.findOne(bookingFindQuery(req.params.id));
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  if (!b.panditEmail) return res.status(400).json({ error: 'No pandit assigned to this booking' });

  const pandit = await Pandit.findOne({ email: lc(b.panditEmail) });
  const { amount, txnId, method, adminFeePercent, adminFeeAmount } = req.body || {};

  const mainFee = Number(b.fee) || (pandit && pandit.fee) || 1500;
  const percent = Number(adminFeePercent !== undefined ? adminFeePercent : (b.adminFeePercent !== undefined ? b.adminFeePercent : 10));
  const feeDeduction = Number(adminFeeAmount !== undefined ? adminFeeAmount : Math.round((mainFee * percent) / 100));
  const payoutAmount = Number(amount) || Math.max(0, mainFee - feeDeduction);
  const payoutTxn = txnId ? String(txnId).trim() : ('PAYOUT-' + b.bookingId.replace(/[^0-9]/g, '') + '-' + Date.now().toString().slice(-4));
  const payoutMethod = method || 'Direct Bank Transfer (IMPS/NEFT)';

  b.adminFeePercent = percent;
  b.adminFeeAmount = feeDeduction;
  b.panditNetPayout = payoutAmount;
  b.panditPayoutStatus = 'Paid';
  b.panditPayoutAmount = payoutAmount;
  b.panditPayoutDate = new Date();
  b.panditPayoutTxnId = payoutTxn;
  b.panditPayoutMethod = payoutMethod;
  await b.save();

  // Send email to Pandit notifying money amount credited to account number with full uncompacted details
  await sendSafe('PANDIT_PAYMENT_CREDITED', b.panditEmail, {
    bookingId: b.bookingId,
    service: b.service,
    panditName: (pandit && pandit.name) || b.panditName || 'Pandit ji',
    userName: b.userName,
    userPhone: b.phone || '',
    userEmail: b.userEmail,
    date: b.date,
    time: b.time,
    district: b.district,
    address: b.address,
    mainFee,
    adminFeePercent: percent,
    adminFeeAmount: feeDeduction,
    amount: payoutAmount,
    bankAccount: (pandit && pandit.bankAccount) || '',
    bankName: (pandit && pandit.bankName) || '',
    ifscCode: (pandit && pandit.ifscCode) || '',
    accountHolder: (pandit && pandit.accountHolder) || (pandit && pandit.name) || '',
    upiId: (pandit && pandit.upiId) || '',
    qrCode: (pandit && pandit.qrCode) || '',
    payoutTxnId: payoutTxn,
    payoutMethod,
    paymentProof: b.paymentProof
  });

  res.json({ ok: true, booking: b });
}));

app.post('/api/bookings/:id/reject-payment', wrap(async (req, res) => {
  const { reason } = req.body || {};
  const b = await Booking.findOne(bookingFindQuery(req.params.id));
  if (!b) return res.status(404).json({ error: 'Booking not found' });

  const rejectionReason = reason ? String(reason).trim() : 'Transaction reference could not be verified in bank records';
  b.paymentStatus = 'Rejected';
  b.paymentRejectionReason = rejectionReason;
  b.advancePaid = false;
  b.advanceAmount = 0;
  if (b.status === 'Completed') {
    b.status = 'Confirmed';
  }
  await b.save();

  // Send payment rejection notification email to devotee so they can repay
  await sendSafe('PAYMENT_REJECTED', b.userEmail, {
    bookingId: b.bookingId,
    userName: b.userName,
    service: b.service,
    fee: b.fee,
    amount: b.fee,
    paymentProof: b.paymentProof,
    reason: rejectionReason
  });

  res.json({ ok: true, booking: b });
}));

app.put('/api/bookings/:id/reschedule', wrap(async (req, res) => {
  const { date, time } = req.body;
  if (!date || !time) return res.status(400).json({ error: 'Date and time are required' });
  const b = await Booking.findOne(bookingFindQuery(req.params.id));
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  if (!['Confirmed', 'In Progress'].includes(b.status)) return res.status(400).json({ error: 'Only active bookings can be rescheduled' });
  const clash = await Booking.findOne({ bookingId: { $ne: b.bookingId }, panditEmail: b.panditEmail, date, time, status: { $in: ['Confirmed', 'In Progress'] } });
  if (clash) return res.status(409).json({ error: 'That slot is already booked.' });
  b.date = date; b.time = time; b.status = 'Confirmed';
  await b.save();
  res.json(b);
}));

// Admin rejects booking because no pandit is available for requested time slot
app.post('/api/bookings/:id/reject-slot', adminOnly, wrap(async (req, res) => {
  const b = await Booking.findOne(bookingFindQuery(req.params.id));
  if (!b) return res.status(404).json({ error: 'Booking not found' });

  const reason = req.body && req.body.reason ? String(req.body.reason).trim() : 'No verified Vedic Pandit available for this time slot. Please reschedule or rebook with a different date/time.';
  b.status = 'Rejected';
  b.adminApproval = 'Rejected';
  b.slotUnavailable = true;
  b.rejectionReason = reason;
  b.panditEmail = '';
  b.panditName = 'No Pandit Available for Slot';
  await b.save();

  // Generate secure rebooking URL for devotee targeting pujaconnect-one.vercel.app
  const rebookToken = sign({ email: b.userEmail, role: 'user', bookingId: b.bookingId, purpose: 'rebook' });
  const appUrl = `https://pujaconnect-one.vercel.app/?action=rebook&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(b.userEmail)}&token=${encodeURIComponent(rebookToken)}`;

  // Send Rebook Puja notification email to devotee
  await sendSafe('BOOKING_SLOT_UNAVAILABLE_REBOOK', b.userEmail, {
    ...b.toObject(),
    rejectionReason: reason,
    appUrl,
    rebookUrl: appUrl,
    rebookToken
  });

  res.json({ ok: true, booking: b, rebookUrl: appUrl, message: 'Booking marked as slot unavailable and rebook notice sent to devotee.' });
}));

// Devotee rebooks puja with updated details (date, time, venue, etc.)
app.put('/api/bookings/:id/rebook', wrap(async (req, res) => {
  const b = await Booking.findOne(bookingFindQuery(req.params.id));
  if (!b) return res.status(404).json({ error: 'Booking not found' });

  const { date, time, address, service, district, phone, panditEmail, fee } = req.body || {};
  if (!date || !time) return res.status(400).json({ error: 'Ceremony date and time slot are required' });

  if (service) b.service = service;
  if (district) b.district = district;
  if (address) b.address = address;
  if (phone) b.phone = phone;
  b.date = date;
  b.time = time;

  let preferredPandit = null;
  if (panditEmail && lc(panditEmail) !== 'any' && lc(panditEmail) !== '') {
    preferredPandit = await Pandit.findOne({ email: lc(panditEmail), verified: true });
    b.preferredPanditEmail = preferredPandit ? preferredPandit.email : '';
    b.preferredPanditName = preferredPandit ? preferredPandit.name : '';
  } else {
    b.preferredPanditEmail = '';
    b.preferredPanditName = 'Any Available Verified Pandit';
  }

  let newFee = Number(fee) || 0;
  if (!newFee && preferredPandit) {
    newFee = (preferredPandit.districtPrices && preferredPandit.districtPrices[b.district]) || preferredPandit.fee || 1500;
  }
  b.fee = newFee;

  const commSetting = await AppSetting.findOne({ key: 'admin_commission_percent' });
  const commPct = commSetting && typeof commSetting.value === 'number' ? commSetting.value : (b.adminFeePercent || DEFAULT_PLATFORM_COMMISSION);
  b.adminFeePercent = commPct;
  b.adminFeeAmount = newFee > 0 ? Math.round((newFee * commPct) / 100) : 0;
  b.panditNetPayout = Math.max(0, newFee - b.adminFeeAmount);

  b.status = 'Pending Assignment';
  b.adminApproval = 'Pending';
  b.panditApproval = 'Pending';
  b.slotUnavailable = false;
  b.rejectionReason = '';
  b.rejectedPandits = [];
  b.panditEmail = '';
  b.panditName = 'To Be Assigned by Admin';
  await b.save();

  // Send acknowledgement email to devotee
  const locationReport = await prepareDevoteeLocationReport(b.district, b.state || 'Odisha');
  await sendSafe('BOOKING_REQUEST_RECEIVED', b.userEmail, {
    ...b.toObject(),
    preferredPanditName: preferredPandit ? preferredPandit.name : 'Any Available Verified Pandit',
    district: b.district,
    address: b.address || b.district,
    locationReport
  });

  res.json({ ok: true, booking: b, message: 'Puja rebooked successfully! Our team will assign a verified Pandit for your new slot.' });
}));

// ---- Long (multi-day) pujas ----
app.get('/api/long-puja-requests', wrap(async (req, res) => {
  const q = {};
  if (req.query.userEmail) q.userEmail = lc(req.query.userEmail);
  if (req.query.panditEmail) q.assignedPandits = lc(req.query.panditEmail);
  res.json(await LongPujaRequest.find(q).sort({ submittedAt: -1 }).lean());
}));

app.post('/api/long-puja-requests', wrap(async (req, res) => {
  const b = req.body;
  if (!b.userEmail || !b.pujaName || !b.district || !b.fromDate || !b.toDate) return res.status(400).json({ error: 'Missing required fields' });

  // Enforce devotee locked district: devotee cannot change district
  const devoteeUser = await User.findOne({ email: lc(b.userEmail) });
  if (devoteeUser && devoteeUser.district) {
    b.district = devoteeUser.district;
  }
  const days = Math.max(1, Math.round((new Date(b.toDate) - new Date(b.fromDate)) / 86400000) + 1);
  const dailyHours = Math.max(1, Number(b.dailyHours) || 4);
  const requiredPandits = Math.max(1, Number(b.requiredPandits) || 1);
  const catalog = await Puja.findOne({ name: b.pujaName });
  const rate = Number(catalog && catalog.perHourFee) || 500;
  const totalHours = days * dailyHours;
  const estimatedCost = totalHours * rate * requiredPandits;
  const advanceAmount = Number(b.advanceAmount) || 0;
  const reqDoc = await LongPujaRequest.create({
    id: await uniqueId(LongPujaRequest, 'id', 'LP'),
    userEmail: lc(b.userEmail), userName: b.userName || 'Devotee', phone: b.phone || '',
    pujaName: b.pujaName, district: b.district, fromDate: b.fromDate, toDate: b.toDate,
    totalDays: days, dailyHours, totalHours, requiredPandits, estimatedCost,
    advancePaid: advanceAmount > 0, advanceAmount
  });
  await sendSafe('LONG_PUJA_SUBMITTED', reqDoc.userEmail, reqDoc.toObject());
  if (advanceAmount > 0) await sendSafe('PAYMENT_RECEIPT', reqDoc.userEmail, { userName: reqDoc.userName, reference: reqDoc.id, service: reqDoc.pujaName, total: estimatedCost, advanceAmount });
  res.status(201).json(reqDoc);
}));

app.put('/api/long-puja-requests/:id/assign', adminOnly, wrap(async (req, res) => {
  const emails = (req.body.panditEmails || req.body.assignedPandits || []).map(lc);
  if (!emails.length) return res.status(400).json({ error: 'Select at least one Pandit' });
  const found = await Pandit.find({ email: { $in: emails }, verified: true });
  if (found.length !== emails.length) return res.status(400).json({ error: 'All assigned Pandits must be verified' });
  const statuses = {};
  emails.forEach((e) => { statuses[e] = 'Assigned'; });
  const r = await LongPujaRequest.findOneAndUpdate({ id: req.params.id }, { assignedPandits: emails, panditStatuses: statuses, status: 'Assigned' }, { new: true });
  if (!r) return res.status(404).json({ error: 'Request not found' });

  // Send assignment offer notification email to each assigned Pandit
  for (const pandit of found) {
    await sendSafe('LONG_PUJA_ASSIGNED_PANDIT', lc(pandit.email), {
      ...r.toObject(),
      panditName: pandit.name,
      panditEmail: pandit.email
    });
  }

  res.json(r);
}));

app.put('/api/long-puja-requests/:id/pandit-response', wrap(async (req, res) => {
  const { panditEmail, response } = req.body; // 'Accepted' | 'Declined'
  const r = await LongPujaRequest.findOne({ id: req.params.id });
  if (!r) return res.status(404).json({ error: 'Request not found' });
  const statuses = { ...(r.panditStatuses || {}) };
  statuses[lc(panditEmail)] = response;
  r.panditStatuses = statuses;
  r.markModified('panditStatuses');
  const vals = r.assignedPandits.map((e) => statuses[e]);
  if (vals.length && vals.every((v) => v === 'Accepted')) r.status = 'Confirmed';
  await r.save();
  res.json(r);
}));

app.put('/api/long-puja-requests/:id/status', wrap(async (req, res) => {
  const r = await LongPujaRequest.findOneAndUpdate({ id: req.params.id }, { status: req.body.status }, { new: true });
  if (!r) return res.status(404).json({ error: 'Request not found' });
  res.json(r);
}));

// ---- Settings ----
app.get('/api/settings/:key', wrap(async (req, res) => {
  const s = await AppSetting.findOne({ key: req.params.key });
  res.json({ key: req.params.key, value: s ? s.value : null });
}));
app.put('/api/settings/:key', adminOnly, wrap(async (req, res) => {
  const s = await AppSetting.findOneAndUpdate({ key: req.params.key }, { value: req.body.value }, { upsert: true, new: true });
  res.json(s);
}));

// ---- Email engine ----
app.post('/api/send-email', wrap(async (req, res) => {
  const { type, to, data } = req.body;
  try {
    const info = await sendTemplate(type, to, data || {});
    res.json({ ok: true, messageId: info.messageId });
  } catch (e) {
    res.status(e.message.startsWith('Unknown') || e.message.includes('missing') ? 400 : 502).json({ ok: false, error: e.message });
  }
}));

// ---- Admin analytics ----
app.get('/api/admin/stats', adminOnly, wrap(async (req, res) => {
  const [users, pandits, verified, pending, bookings, longReqs, pendingLong] = await Promise.all([
    User.countDocuments({ role: 'user' }), Pandit.countDocuments(), Pandit.countDocuments({ verified: true }),
    Pandit.countDocuments({ status: 'Pending Review' }), Booking.find({}, { fee: 1, status: 1 }).lean(), LongPujaRequest.countDocuments(),
    LongPujaRequest.countDocuments({ status: 'Pending Admin' })
  ]);
  const active = bookings.filter((b) => b.status !== 'Cancelled');
  res.json({
    users, pandits, verifiedPandits: verified, pendingPandits: pending,
    bookings: bookings.length, completed: bookings.filter((b) => b.status === 'Completed').length,
    revenue: active.reduce((s, b) => s + (b.fee || 0), 0), longRequests: longReqs, pendingLong
  });
}));

// ---- API 404 + error handler ----
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  if (err && err.code === 11000) return res.status(409).json({ error: 'Duplicate record' });
  if (err && err.name === 'ValidationError') return res.status(400).json({ error: err.message });
  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message });
});

// ---- Static frontend (local mode; Vercel serves /public directly) ----
const pub = path.join(__dirname, 'public');
app.use(express.static(pub));
app.get('/admin', (req, res) => res.sendFile(path.join(pub, 'admin.html')));
app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(pub, 'index.html')));

module.exports = app;
