require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectDB } = require('./lib/db');
const { User, Pandit, Booking, LongPujaRequest, Puja, AppSetting, MediaOffer, MediaAnnouncement } = require('./lib/models');
const { sendTemplate, sendSafe } = require('./lib/mailer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const JWT_SECRET = () => process.env.JWT_SECRET || 'pujaconnect_dev_secret';
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const lc = (s) => String(s || '').trim().toLowerCase();
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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

// ============================================================================
// REAL-TIME MULTI-DEVICE DATA SYNCHRONIZATION (SSE + BROADCAST HUB)
// Enables instant multi-device live data updates without page refresh
// ============================================================================
let globalDataVersion = Date.now();
const sseClients = new Set();

function broadcastChange(event = {}) {
  globalDataVersion = Date.now();
  const payload = JSON.stringify({
    version: globalDataVersion,
    timestamp: Date.now(),
    entity: event.entity || 'general',
    action: event.action || 'update',
    path: event.path || '',
    id: event.id || null
  });

  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

// SSE live sync stream for all open devices
app.get('/api/live-sync', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  res.write(`data: ${JSON.stringify({ version: globalDataVersion, type: 'connected', timestamp: Date.now() })}\n\n`);

  sseClients.add(res);

  const keepAlive = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch (e) {
      clearInterval(keepAlive);
      sseClients.delete(res);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    sseClients.delete(res);
  });
});

// Real-time status / heartbeat polling endpoint
app.get('/api/live-sync/status', (req, res) => {
  res.json({
    version: globalDataVersion,
    timestamp: Date.now(),
    connectedClients: sseClients.size
  });
});

// Automatic mutation detection middleware: broadcasts any successful POST/PUT/PATCH/DELETE
app.use('/api', (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const skipPaths = [
      '/auth/login',
      '/auth/pandit-otp',
      '/auth/admin-login',
      '/admin/verify-section',
      '/live-sync'
    ];
    if (!skipPaths.some(p => req.path.startsWith(p))) {
      res.on('finish', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          let entity = 'general';
          if (req.path.includes('/bookings')) entity = 'bookings';
          else if (req.path.includes('/pandits')) entity = 'pandits';
          else if (req.path.includes('/pujas')) entity = 'pujas';
          else if (req.path.includes('/system-settings')) entity = 'settings';
          else if (req.path.includes('/long-puja')) entity = 'longs';
          else if (req.path.includes('/payments') || req.path.includes('/payouts') || req.path.includes('/platform-bank')) entity = 'payments';
          else if (req.path.includes('/media')) entity = 'media';
          else if (req.path.includes('/reviews')) entity = 'reviews';
          else if (req.path.includes('/users')) entity = 'users';

          broadcastChange({
            entity,
            action: req.method.toLowerCase(),
            path: req.path
          });
        }
      });
    }
  }
  next();
});

// ---- Ensure DB connection for everything else ----
app.use('/api', wrap(async (req, res, next) => {
  if (req.path === '/health' || req.path === '/ping' || req.path === '/db-status' || req.path === '/live-sync' || req.path === '/live-sync/status' || req.path === '/auth/admin-login' || req.path === '/admin/verify-section' || req.path === '/admin/sections-info') {
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

const publicUser = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  state: u.state,
  district: u.district,
  city: u.city,
  role: u.role,
  status: u.status || 'Active',
  bankAccount: u.bankAccount || '',
  ifscCode: u.ifscCode || '',
  upiId: u.upiId || '',
  bankName: u.bankName || '',
  accountHolder: u.accountHolder || '',
  qrCode: u.qrCode || '',
  createdAt: u.createdAt
});
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
  const cleanId = String(param || '').trim();
  const conds = [
    { bookingId: cleanId },
    { bookingId: new RegExp('^' + cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
  ];
  if (mongoose.Types.ObjectId.isValid(cleanId) && /^[0-9a-fA-F]{24}$/.test(cleanId)) {
    conds.push({ _id: cleanId });
  }
  return { $or: conds };
}

function longPujaFindQuery(param) {
  const cleanId = String(param || '').trim();
  const conds = [{ id: cleanId }, { id: new RegExp('^' + cleanId + '$', 'i') }];
  if (mongoose.Types.ObjectId.isValid(cleanId)) {
    conds.push({ _id: cleanId });
  }
  return { $or: conds };
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
  let user = await User.findOne({ email: e });
  if (!user) {
    // If user account is not found, check existing bookings or create new devotee profile
    const b = await Booking.findOne({ userEmail: { $regex: new RegExp(`^${e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }).sort({ createdAt: -1 });
    const longB = !b ? await LongPuja.findOne({ userEmail: { $regex: new RegExp(`^${e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }).sort({ createdAt: -1 }) : null;
    
    let fallbackName = (b && b.userName) || (longB && longB.userName) || '';
    if (!fallbackName) {
      const uname = (e.split('@')[0] || 'Devotee');
      fallbackName = uname.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }
    const phone = (b && b.phone) || (longB && longB.phone) || '';
    const district = (b && b.district) || (longB && longB.district) || 'Khordha';
    const state = (b && b.state) || (longB && longB.state) || 'Odisha';

    user = await User.create({
      name: fallbackName,
      email: e,
      phone,
      state,
      district,
      password: '',
      role: 'user'
    });
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
  let longRequest = null;
  if (bookingId) {
    booking = await Booking.findOne(bookingFindQuery(bookingId));
    if (booking) {
      if (!panditEmail) panditEmail = lc(booking.panditEmail);
      if (lc(booking.panditEmail) === panditEmail || (booking.rejectedPandits || []).includes(panditEmail)) {
        valid = true;
      }
    } else {
      const query = mongoose.Types.ObjectId.isValid(bookingId)
        ? { $or: [{ id: bookingId }, { _id: bookingId }] }
        : { id: bookingId };
      longRequest = await LongPujaRequest.findOne(query);
      if (longRequest) {
        if (!panditEmail && longRequest.assignedPandits && longRequest.assignedPandits.length) {
          panditEmail = lc(longRequest.assignedPandits[0]);
        }
        if (panditEmail && (longRequest.assignedPandits || []).map(lc).includes(panditEmail)) {
          valid = true;
        }
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
  const authToken = sign({ email: pandit.email, role: 'pandit', name: pandit.name });

  res.json({
    ok: true,
    user: userSession,
    token: authToken,
    booking,
    longRequest
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

// ============================================================================
// ADMIN & SECTION SECURITY: RATE LIMITING & LOCKOUT CONTROLLER
// Rule: Maximum 2 attempts per 1 minute window.
// If 2 failed attempts occur, or a 3rd attempt is made within 1 minute:
// System triggers a strict 2-minute (120 seconds) security lockout with active countdown.
// ============================================================================
const adminSecurityAttempts = new Map(); // key -> { attempts: [timestamp], lockoutUntil: timestamp }

function getAdminClientKey(req, scope = 'global') {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (forwarded ? forwarded.split(',')[0].trim() : (req.socket && req.socket.remoteAddress) || '127.0.0.1').replace(/[^a-zA-Z0-9_.-]/g, '_');
  return `admin_sec_${scope}_${ip}`;
}

function checkAdminSecurityRateLimit(rateKey) {
  const now = Date.now();
  let record = adminSecurityAttempts.get(rateKey);
  if (!record) {
    record = { attempts: [], lockoutUntil: 0 };
    adminSecurityAttempts.set(rateKey, record);
  }

  // 1. Check if currently in an active 2-minute lockout
  if (record.lockoutUntil && now < record.lockoutUntil) {
    const remainingSec = Math.ceil((record.lockoutUntil - now) / 1000);
    return {
      locked: true,
      remainingSec,
      lockoutUntil: record.lockoutUntil,
      message: `Security lockout active. Please wait ${remainingSec} second(s) before re-entering password.`
    };
  }

  // 2. Lockout expired: reset timer and old attempts
  if (record.lockoutUntil && now >= record.lockoutUntil) {
    record.lockoutUntil = 0;
    record.attempts = [];
  }

  // 3. Keep only attempts made in the last 60 seconds (1 minute window)
  record.attempts = record.attempts.filter(ts => (now - ts) < 60000);

  // 4. If already reached 2 attempts in the past 60s, trigger 2-minute lockout
  if (record.attempts.length >= 2) {
    record.lockoutUntil = now + 120000; // 2 minutes (120,000 ms)
    return {
      locked: true,
      remainingSec: 120,
      lockoutUntil: record.lockoutUntil,
      message: 'Maximum attempts exceeded (2 attempts allowed per minute). Security lockout active for 2 minutes.'
    };
  }

  return {
    locked: false,
    remainingAttempts: 2 - record.attempts.length,
    remainingSec: 0,
    lockoutUntil: 0
  };
}

function recordAdminSecurityFailure(rateKey) {
  const now = Date.now();
  let record = adminSecurityAttempts.get(rateKey);
  if (!record) {
    record = { attempts: [], lockoutUntil: 0 };
    adminSecurityAttempts.set(rateKey, record);
  }

  record.attempts.push(now);
  record.attempts = record.attempts.filter(ts => (now - ts) < 60000);

  // 2 failed attempts within 60 seconds triggers a 2-minute (120s) lockout
  if (record.attempts.length >= 2) {
    record.lockoutUntil = now + 120000;
    return {
      locked: true,
      remainingSec: 120,
      lockoutUntil: record.lockoutUntil,
      remainingAttempts: 0
    };
  }

  return {
    locked: false,
    remainingSec: 0,
    lockoutUntil: 0,
    remainingAttempts: 2 - record.attempts.length
  };
}

function clearAdminSecurityAttempts(rateKey) {
  adminSecurityAttempts.delete(rateKey);
}

// 4 Protected Sections and their explicit passwords
const ADMIN_SECTIONS = {
  section_1: {
    id: 'section_1',
    name: 'Bookings & Operations',
    description: 'Bookings & Assignments, Multi-Day Requests',
    password: 'unified mentor',
    tabs: ['bookings', 'longs', 'long']
  },
  section_2: {
    id: 'section_2',
    name: 'Scholars, Catalog & Settings',
    description: 'KYC Queue, Pandits Directory & Rates, Puja Catalog, Devotees, System Settings',
    password: 'unified mentor',
    tabs: ['kyc', 'pandits', 'pujas', 'users', 'devotees', 'settings']
  },
  section_3: {
    id: 'section_3',
    name: 'Finance & Payouts',
    description: 'Payment Verifications, Platform Bank & UPI, Pandit Payment',
    password: 'pandit',
    tabs: ['payments', 'platform-bank', 'bank', 'pandit-payouts', 'pandit-settlements']
  },
  section_4: {
    id: 'section_4',
    name: 'Media & Offers',
    description: 'Media and Offers',
    password: 'media',
    tabs: ['media', 'media-offers']
  }
};

// ---- Main Admin Login Endpoint ----
app.post('/api/auth/admin-login', wrap(async (req, res) => {
  const rateKey = getAdminClientKey(req, 'login');
  const rateStatus = checkAdminSecurityRateLimit(rateKey);

  if (rateStatus.locked) {
    return res.status(429).json({
      error: rateStatus.message,
      locked: true,
      retryAfter: rateStatus.remainingSec,
      lockoutUntil: rateStatus.lockoutUntil
    });
  }

  const { username, password } = req.body || {};
  const trimmedUser = (username || '').trim().toLowerCase();
  const trimmedPass = (password || '').trim();

  // Official Admin Credentials:
  // Username: puja
  // Password: unified mentor
  const isValidAdmin = (trimmedUser === 'puja' && trimmedPass === 'unified mentor');

  if (!isValidAdmin) {
    const failStatus = recordAdminSecurityFailure(rateKey);
    if (failStatus.locked) {
      return res.status(429).json({
        error: 'Incorrect admin credentials. Security lockout activated for 2 minutes.',
        locked: true,
        retryAfter: failStatus.remainingSec,
        lockoutUntil: failStatus.lockoutUntil
      });
    }
    return res.status(401).json({
      error: 'Invalid admin username or password. 1 attempt remaining before 2-minute lockout.',
      locked: false,
      remainingAttempts: failStatus.remainingAttempts
    });
  }

  // Clear attempts on successful authentication
  clearAdminSecurityAttempts(rateKey);

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@pujaconnect.com').toLowerCase();
  let user = null;
  try {
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: adminEmail });
      if (!user) {
        user = await User.create({
          name: 'Super Admin',
          email: adminEmail,
          phone: '0000000000',
          password: '',
          role: 'admin'
        });
      }
    }
  } catch (err) {
    console.warn('DB lookup note in admin-login:', err.message);
  }

  const adminUser = user ? { name: user.name, email: user.email, phone: user.phone, role: 'admin' } : { name: 'Super Admin', email: adminEmail, phone: '0000000000', role: 'admin' };

  res.json({
    user: adminUser,
    token: sign({ email: adminEmail, role: 'admin' }),
    message: 'Super Admin access granted successfully 🛡️'
  });
}));

// ---- Legacy / direct endpoint (now requires password or returns 401) ----
app.post('/api/auth/admin-direct', wrap(async (req, res) => {
  const { username, password } = req.body || {};
  const rateKey = getAdminClientKey(req, 'login');

  if (username || password) {
    const rateStatus = checkAdminSecurityRateLimit(rateKey);
    if (rateStatus.locked) {
      return res.status(429).json({
        error: rateStatus.message,
        locked: true,
        retryAfter: rateStatus.remainingSec,
        lockoutUntil: rateStatus.lockoutUntil
      });
    }
    const trimmedUser = (username || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();
    if (trimmedUser === 'puja' && trimmedPass === 'unified mentor') {
      clearAdminSecurityAttempts(rateKey);
      const adminEmail = (process.env.ADMIN_EMAIL || 'admin@pujaconnect.com').toLowerCase();
      let user = await User.findOne({ email: adminEmail });
      if (!user) {
        user = await User.create({ name: 'Super Admin', email: adminEmail, phone: '0000000000', password: '', role: 'admin' });
      }
      return res.json({
        user: { name: user.name, email: user.email, phone: user.phone, role: 'admin' },
        token: sign({ email: user.email, role: 'admin' })
      });
    }
    const failStatus = recordAdminSecurityFailure(rateKey);
    if (failStatus.locked) {
      return res.status(429).json({
        error: 'Incorrect credentials. Security lockout active for 2 minutes.',
        locked: true,
        retryAfter: failStatus.remainingSec,
        lockoutUntil: failStatus.lockoutUntil
      });
    }
    return res.status(401).json({
      error: 'Invalid admin credentials.',
      locked: false,
      remainingAttempts: failStatus.remainingAttempts
    });
  }

  return res.status(401).json({
    error: 'Authentication required. Direct passwordless admin entry is disabled. Please provide admin username and password.',
    authRequired: true
  });
}));

// ---- Section Password Verification Endpoint ----
app.post('/api/admin/verify-section', wrap(async (req, res) => {
  const { sectionId, password } = req.body || {};
  const targetSection = ADMIN_SECTIONS[sectionId];
  if (!targetSection) {
    return res.status(400).json({ error: 'Unknown admin section ID: ' + sectionId });
  }

  const rateKey = getAdminClientKey(req, 'sec_' + sectionId);
  const rateStatus = checkAdminSecurityRateLimit(rateKey);

  if (rateStatus.locked) {
    return res.status(429).json({
      error: rateStatus.message,
      locked: true,
      retryAfter: rateStatus.remainingSec,
      lockoutUntil: rateStatus.lockoutUntil,
      sectionId
    });
  }

  const trimmedPass = (password || '').trim();
  if (trimmedPass !== targetSection.password) {
    const failStatus = recordAdminSecurityFailure(rateKey);
    if (failStatus.locked) {
      return res.status(429).json({
        error: `Incorrect password for ${targetSection.description}. Security lockout activated for 2 minutes.`,
        locked: true,
        retryAfter: failStatus.remainingSec,
        lockoutUntil: failStatus.lockoutUntil,
        sectionId
      });
    }
    return res.status(401).json({
      error: `Incorrect password for ${targetSection.description}. 1 attempt remaining before 2-minute lockout.`,
      locked: false,
      remainingAttempts: failStatus.remainingAttempts,
      sectionId
    });
  }

  // Section password verified successfully!
  clearAdminSecurityAttempts(rateKey);
  res.json({
    success: true,
    sectionId,
    name: targetSection.name,
    description: targetSection.description,
    message: `Section "${targetSection.name}" unlocked successfully 🛡️`
  });
}));

// ---- Admin Sections Metadata ----
app.get('/api/admin/sections-info', wrap(async (req, res) => {
  const sections = Object.values(ADMIN_SECTIONS).map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    tabs: s.tabs
  }));
  res.json({ sections });
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
  const { name, phone, state, district, city, bankAccount, ifscCode, upiId, bankName, accountHolder, qrCode } = req.body;
  const user = await User.findOne({ email: lc(req.auth.email) });
  if (!user) return res.status(404).json({ error: 'Devotee profile not found' });
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (bankAccount !== undefined) user.bankAccount = String(bankAccount).trim();
  if (ifscCode !== undefined) user.ifscCode = String(ifscCode).trim().toUpperCase();
  if (upiId !== undefined) user.upiId = String(upiId).trim();
  if (bankName !== undefined) user.bankName = String(bankName).trim();
  if (accountHolder !== undefined) user.accountHolder = String(accountHolder).trim();
  if (qrCode !== undefined) user.qrCode = String(qrCode).trim();
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
    'bio', 'services', 'availableDays', 'daySlots',
    'photo', 'documentUrl', 'idDoc', 'fee', 'bankAccount', 'ifscCode',
    'upiId', 'bankName', 'accountHolder', 'qrCode', 'districtPrices'
  ];
  if (req.user && req.user.role === 'admin') allowed.push('timeSlots');
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

// --- Media Offer Discount & Real Fee Recalculator Engine ---
async function findApplicableOffer({ service = '', district = '', state = '', date = '' } = {}) {
  try {
    const nowStr = new Date().toISOString().split('T')[0];
    const queryDate = date ? String(date).split('T')[0] : nowStr;

    // Auto-expire past offers
    await MediaOffer.updateMany(
      { status: 'Active', endDate: { $lt: nowStr } },
      { $set: { status: 'Expired' } }
    ).catch(() => {});

    // An offer is applicable if it is currently active today (booking promotion)
    // OR active on the scheduled ceremony date
    const offers = await MediaOffer.find({
      status: 'Active',
      $or: [
        { startDate: { $lte: nowStr }, endDate: { $gte: nowStr } },
        { startDate: { $lte: queryDate }, endDate: { $gte: queryDate } }
      ]
    }).sort({ discountPercent: -1 }).lean();

    const sNorm = service ? service.trim().toLowerCase() : '';
    const dNorm = district ? district.trim().toLowerCase() : '';
    const stNorm = state ? state.trim().toLowerCase() : '';

    for (const offer of offers) {
      // Check puja match
      if (offer.pujaName && offer.pujaName.trim().toLowerCase() !== 'all') {
        if (sNorm && offer.pujaName.trim().toLowerCase() !== sNorm) continue;
      }
      // Check state match
      if (offer.targetState && offer.targetState.trim().toLowerCase() !== 'all') {
        if (stNorm && offer.targetState.trim().toLowerCase() !== stNorm) continue;
      }
      // Check district match
      const distList = (Array.isArray(offer.targetDistricts) ? offer.targetDistricts : [offer.targetDistricts || 'ALL'])
        .flatMap(d => String(d).split(','))
        .map(d => d.trim().toLowerCase())
        .filter(Boolean);

      if (distList.length > 0 && !distList.includes('all')) {
        if (!dNorm || !distList.includes(dNorm)) continue;
      }
      return offer;
    }
  } catch (e) {
    console.error('[findApplicableOffer Error]:', e.message);
  }
  return null;
}

function calculateFeeWithDiscount(baseDakshina, offer, commPct = DEFAULT_PLATFORM_COMMISSION) {
  const originalFee = Number(baseDakshina) || 0;
  if (!offer || !originalFee) {
    const adminFeeAmount = Math.round((originalFee * commPct) / 100);
    const panditNetPayout = Math.max(0, originalFee - adminFeeAmount);
    return {
      originalFee,
      discountPercent: 0,
      discountAmount: 0,
      finalFee: originalFee,
      adminFeePercent: commPct,
      adminFeeAmount,
      panditNetPayout,
      offerId: '',
      offerTitle: ''
    };
  }

  const discountPercent = Math.max(1, Math.min(100, Number(offer.discountPercent) || 0));
  const discountAmount = Math.round((originalFee * discountPercent) / 100);
  const finalFee = Math.max(0, originalFee - discountAmount);
  // Admin fee is calculated on the NEW final fee (e.g., 10% of 1800 = 180, NOT 10% of 3000)
  const adminFeeAmount = Math.round((finalFee * commPct) / 100);
  // Pandit payment is calculated on the NEW final fee (e.g., 1800 - 180 = 1620, NOT 3000 - 300 = 2700)
  const panditNetPayout = Math.max(0, finalFee - adminFeeAmount);

  return {
    originalFee,
    discountPercent,
    discountAmount,
    finalFee,
    adminFeePercent: commPct,
    adminFeeAmount,
    panditNetPayout,
    offerId: offer.offerId || '',
    offerTitle: offer.title || ''
  };
}

// Helper to check if Pandit is available on a specific date (considers unavailableDates and availableDays)
function isPanditAvailableOnDate(pandit, dateStr) {
  if (!pandit || !dateStr) return { available: true };
  const dStr = String(dateStr).trim().split('T')[0];

  // 1. Check marked non-availability
  const unavail = pandit.unavailableDates || [];
  for (const item of unavail) {
    const itemDate = typeof item === 'string' ? item.trim() : (item && item.date ? item.date.trim() : '');
    if (itemDate === dStr) {
      const reason = (typeof item === 'object' && item.reason) ? ` (${item.reason})` : '';
      return { available: false, reason: `Pandit marked non-availability for this date${reason}` };
    }
  }

  // 2. Check available days of week
  if (Array.isArray(pandit.availableDays) && pandit.availableDays.length) {
    const dt = parsePujaStartDateTime(dStr, '12:00 PM');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[dt.getDay()];
    if (!pandit.availableDays.includes(dayName)) {
      return { available: false, reason: `Pandit is not available on ${dayName}s` };
    }
  }

  return { available: true };
}

// Admin fixes district-wise amounts and daily ritual time slots for a Pandit
app.put('/api/pandits/:id/district-prices', adminOnly, wrap(async (req, res) => {
  const { fee, districtPrices, timeSlots } = req.body;
  const rawId = req.params.id ? decodeURIComponent(req.params.id).trim() : '';
  const query = /^[0-9a-fA-F]{24}$/.test(rawId) ? { _id: rawId } : { email: lc(rawId) };
  const update = {};
  if (fee !== undefined) update.fee = Number(fee) || 1500;
  if (districtPrices !== undefined) update.districtPrices = districtPrices;
  if (Array.isArray(timeSlots) && timeSlots.length > 0) update.timeSlots = timeSlots;
  // Ensure the pandit is verified and active when admin sets official district rates
  update.status = 'Verified';
  update.verified = true;
  const p = await Pandit.findOneAndUpdate(query, { $set: update }, { new: true, strict: false, runValidators: false }).lean();
  if (!p) return res.status(404).json({ error: 'Pandit not found' });

  // Send official confirmation email to Pandit regarding configured time slots of the day and district rates
  try {
    const reqHost = req.get('host') || '';
    const reqProto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : (req.protocol || 'http'));
    const origin = req.headers.origin || (reqHost ? `${reqProto}://${reqHost}` : 'https://pujaconnect-one.vercel.app');
    const baseUrl = process.env.APP_URL || origin;

    await sendSafe('PANDIT_TIMESLOTS_CONFIGURED', p.email, {
      panditName: p.name,
      email: p.email,
      phone: p.phone,
      timeSlots: p.timeSlots || timeSlots || ['06:00 AM - 09:00 AM', '09:00 AM - 12:00 PM', '04:00 PM - 07:00 PM'],
      fee: p.fee || fee || 1500,
      districtPrices: p.districtPrices || districtPrices || {},
      workingDistricts: p.workingDistricts || [p.district || 'Khordha'],
      workingState: p.workingState || p.state || 'Odisha',
      baseUrl
    });
  } catch (err) {
    console.error('[sendSafe PANDIT_TIMESLOTS_CONFIGURED error]:', err.message);
  }

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

// Get Pandit Unavailable Dates
app.get('/api/pandits/:id/unavailable-dates', wrap(async (req, res) => {
  const rawId = req.params.id ? decodeURIComponent(req.params.id).trim() : '';
  const query = /^[0-9a-fA-F]{24}$/.test(rawId) ? { _id: rawId } : { email: new RegExp('^' + rawId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') };
  const p = await Pandit.findOne(query).lean();
  if (!p) return res.status(404).json({ error: 'Pandit not found' });
  res.json(p.unavailableDates || []);
}));

// Pandit Marks Non-Availability for a day (enforcing minimum 12 hours advance notice, cannot select same date)
app.post('/api/pandits/:id/unavailable-dates', wrap(async (req, res) => {
  const { date, reason } = req.body;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date).trim())) {
    return res.status(400).json({ error: 'Please provide a valid ceremony date in YYYY-MM-DD format.' });
  }

  const dateStr = String(date).trim();
  const rawId = req.params.id ? decodeURIComponent(req.params.id).trim() : '';
  const query = /^[0-9a-fA-F]{24}$/.test(rawId) ? { _id: rawId } : { email: new RegExp('^' + rawId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') };
  const p = await Pandit.findOne(query);
  if (!p) return res.status(404).json({ error: 'Pandit not found' });

  // 12 Hours advance notice validation
  // Rule: Cannot select same date (today) or past dates. Must be marked at least 12 hours in advance.
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (dateStr <= todayStr) {
    return res.status(400).json({
      error: 'Non-availability cannot be selected for today (same date) or past dates. Platform policy requires marking non-availability at least 12 hours in advance.'
    });
  }

  const parts = dateStr.split('-');
  const selectedDateStart = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 0, 0, 0);
  const diffHours = (selectedDateStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (diffHours < 12) {
    return res.status(400).json({
      error: 'Non-availability must be marked at least 12 hours in advance before the date begins.'
    });
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[selectedDateStart.getDay()];

  const existingList = Array.isArray(p.unavailableDates) ? p.unavailableDates : [];
  const alreadyIndex = existingList.findIndex(x => (typeof x === 'string' ? x === dateStr : (x && x.date === dateStr)));

  const entry = {
    date: dateStr,
    day: dayName,
    reason: (reason && String(reason).trim()) || 'Personal Commitment',
    markedAt: new Date()
  };

  if (alreadyIndex >= 0) {
    existingList[alreadyIndex] = entry;
  } else {
    existingList.push(entry);
  }

  p.unavailableDates = existingList;
  p.markModified('unavailableDates');
  await p.save();

  res.json({ ok: true, unavailableDates: p.unavailableDates, message: `Successfully marked ${dateStr} (${dayName}) as unavailable.` });
}));

// Remove Non-Availability
app.delete('/api/pandits/:id/unavailable-dates/:date', wrap(async (req, res) => {
  const dateStr = String(req.params.date).trim();
  const rawId = req.params.id ? decodeURIComponent(req.params.id).trim() : '';
  const query = /^[0-9a-fA-F]{24}$/.test(rawId) ? { _id: rawId } : { email: new RegExp('^' + rawId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') };
  const p = await Pandit.findOne(query);
  if (!p) return res.status(404).json({ error: 'Pandit not found' });

  const currentList = Array.isArray(p.unavailableDates) ? p.unavailableDates : [];
  p.unavailableDates = currentList.filter(x => (typeof x === 'string' ? x !== dateStr : (x && x.date !== dateStr)));
  p.markModified('unavailableDates');
  await p.save();

  res.json({ ok: true, unavailableDates: p.unavailableDates, message: `Date ${dateStr} is now marked available again.` });
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

// Centralized System Settings (Official Contact, Logo, Office Address) Managed by Admin
const DEFAULT_SYSTEM_SETTINGS = {
  contactNumber: '+91 94370 12345',
  logo: '/logo.jpg',
  officeAddress: 'PujaConnect Central Headquarters, Plot No. 108, Vedic Marg, Chandrasekharpur, Bhubaneswar, Odisha – 751024'
};

app.get('/api/system-settings', wrap(async (req, res) => {
  const s = await AppSetting.findOne({ key: 'system_settings' });
  res.json(s && s.value ? { ...DEFAULT_SYSTEM_SETTINGS, ...s.value } : DEFAULT_SYSTEM_SETTINGS);
}));

app.put('/api/system-settings', adminOnly, wrap(async (req, res) => {
  const { contactNumber, logo, officeAddress } = req.body;
  const currentDoc = await AppSetting.findOne({ key: 'system_settings' });
  const current = currentDoc && currentDoc.value ? currentDoc.value : DEFAULT_SYSTEM_SETTINGS;
  const updated = {
    ...current,
    contactNumber: contactNumber !== undefined ? String(contactNumber).trim() : current.contactNumber,
    logo: logo !== undefined ? String(logo).trim() : current.logo,
    officeAddress: officeAddress !== undefined ? String(officeAddress).trim() : current.officeAddress
  };
  const s = await AppSetting.findOneAndUpdate(
    { key: 'system_settings' },
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
  const list = await Booking.find(q).sort({ transactionDate: -1 });

  // Recalculate discount if offer became active after booking creation and payment is still pending
  const commSetting = await AppSetting.findOne({ key: 'admin_commission_percent' });
  for (const b of list) {
    if (b.paymentStatus === 'Pending' && !b.discountAmount && b.fee > 0) {
      const devoteeUser = await User.findOne({ email: lc(b.userEmail) });
      const devoteeState = (devoteeUser && devoteeUser.state) || b.state || 'Odisha';
      const applicableOffer = await findApplicableOffer({ service: b.service, district: b.district, state: devoteeState, date: b.date });
      if (applicableOffer) {
        const commPct = commSetting && typeof commSetting.value === 'number' ? commSetting.value : (b.adminFeePercent || DEFAULT_PLATFORM_COMMISSION);
        const feeCalc = calculateFeeWithDiscount(b.originalFee || b.fee, applicableOffer, commPct);
        b.fee = feeCalc.finalFee;
        b.originalFee = feeCalc.originalFee;
        b.discountPercent = feeCalc.discountPercent;
        b.discountAmount = feeCalc.discountAmount;
        b.discountOfferId = feeCalc.offerId;
        b.discountOfferTitle = feeCalc.offerTitle;
        b.adminFeePercent = commPct;
        b.adminFeeAmount = feeCalc.adminFeeAmount;
        b.panditNetPayout = feeCalc.panditNetPayout;
        await b.save().catch(() => {});
      }
    }
  }

  const updated = await autoUpdatePassedSlots(list);
  res.json(updated);
}));

app.get('/api/bookings/:id', wrap(async (req, res) => {
  const b = await Booking.findOne(bookingFindQuery(req.params.id));
  if (!b) {
    const q = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
      : { id: req.params.id };
    const longDoc = await LongPujaRequest.findOne(q);
    if (longDoc) return res.json(longDoc);
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Recalculate discount if offer became active after booking creation and payment is still pending
  if (b.paymentStatus === 'Pending' && !b.discountAmount && b.fee > 0) {
    const devoteeUser = await User.findOne({ email: lc(b.userEmail) });
    const devoteeState = (devoteeUser && devoteeUser.state) || b.state || 'Odisha';
    const applicableOffer = await findApplicableOffer({ service: b.service, district: b.district, state: devoteeState, date: b.date });
    if (applicableOffer) {
      const commSetting = await AppSetting.findOne({ key: 'admin_commission_percent' });
      const commPct = commSetting && typeof commSetting.value === 'number' ? commSetting.value : (b.adminFeePercent || DEFAULT_PLATFORM_COMMISSION);
      const feeCalc = calculateFeeWithDiscount(b.originalFee || b.fee, applicableOffer, commPct);
      b.fee = feeCalc.finalFee;
      b.originalFee = feeCalc.originalFee;
      b.discountPercent = feeCalc.discountPercent;
      b.discountAmount = feeCalc.discountAmount;
      b.discountOfferId = feeCalc.offerId;
      b.discountOfferTitle = feeCalc.offerTitle;
      b.adminFeePercent = commPct;
      b.adminFeeAmount = feeCalc.adminFeeAmount;
      b.panditNetPayout = feeCalc.panditNetPayout;
      await b.save();
    }
  }

  const updated = await autoUpdatePassedSlots([b]);
  res.json(updated[0] || b);
}));

app.delete('/api/bookings/:id', wrap(async (req, res) => {
  let authUser = null;
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (token) {
    try { authUser = jwt.verify(token, JWT_SECRET()); } catch {}
  }

  const rawId = req.params.id ? decodeURIComponent(req.params.id).trim() : '';
  let b = await Booking.findOne(bookingFindQuery(rawId));
  let isLong = false;
  if (!b) {
    b = await LongPujaRequest.findOne(longPujaFindQuery(rawId));
    if (b) isLong = true;
  }
  if (!b) return res.status(404).json({ error: 'Booking not found' });

  const bEmail = lc(b.userEmail || '').trim();
  const authEmail = lc((authUser && authUser.email) || '').trim();
  const qEmail = lc(req.query.userEmail || (req.body && req.body.userEmail) || '').trim();

  const isAdmin = authUser && authUser.role === 'admin';
  const isDevotee = authUser && (authUser.role === 'user' || authUser.role === 'devotee');
  const isEmailMatch = Boolean(
    (authEmail && bEmail && (authEmail === bEmail || bEmail.includes(authEmail) || authEmail.includes(bEmail))) ||
    (qEmail && bEmail && (qEmail === bEmail || bEmail.includes(qEmail) || qEmail.includes(bEmail)))
  );
  const isOwner = isDevotee && (!bEmail || isEmailMatch);
  const isQueryOwner = Boolean(qEmail && (!bEmail || isEmailMatch));

  if (!isAdmin && !isOwner && !isQueryOwner && !isEmailMatch) {
    return res.status(403).json({ error: 'Not authorized to delete this booking' });
  }

  if (isLong) {
    await LongPujaRequest.deleteOne({ _id: b._id });
  } else {
    await Booking.deleteOne({ _id: b._id });
  }
  res.json({ ok: true, deletedId: b.bookingId || b.id || b._id });
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

  if (b.termsAccepted === false) {
    return res.status(400).json({ error: 'You must accept the Cancellation & Refund Policy terms to book a ceremony.' });
  }

  // Enforce devotee locked district: devotee cannot change district
  const devoteeUser = await User.findOne({ email: lc(b.userEmail) });
  if (devoteeUser && devoteeUser.district) {
    b.district = devoteeUser.district;
  }

  // Require refund payout destination (UPI ID or Bank Account) for booking
  const upiId = (b.upiId || (devoteeUser ? devoteeUser.upiId : '') || '').trim();
  const bankAccount = (b.bankAccount || (devoteeUser ? devoteeUser.bankAccount : '') || '').trim();
  if (!upiId && !bankAccount) {
    return res.status(400).json({ error: 'Please submit your UPI ID / Number or Bank Account for refund processing before booking.' });
  }

  // Enforce minimum 48 hours advance notice requirement
  const ceremonyStartDt = parsePujaStartDateTime(b.date, b.time);
  const hoursUntilCeremony = (ceremonyStartDt.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntilCeremony < 48) {
    return res.status(400).json({
      error: 'Ceremony bookings must be scheduled at least 48 hours in advance to allow verified Vedic Pandits to prepare and confirm. Please choose a slot at least 48 hours from now.'
    });
  }

  let preferredPandit = null;
  if (b.panditEmail && lc(b.panditEmail) !== 'any' && lc(b.panditEmail) !== '') {
    preferredPandit = await Pandit.findOne({ email: lc(b.panditEmail), verified: true });
    if (preferredPandit) {
      const avail = isPanditAvailableOnDate(preferredPandit, b.date);
      if (!avail.available) {
        return res.status(400).json({
          error: `Pandit ${preferredPandit.name} is not available on ${b.date} (${avail.reason}). Please choose another date or select 'Any Available Verified Pandit'.`
        });
      }
    }
  }

  // Calculate base Dakshina: from preferred Pandit if selected, otherwise from the Puja catalog estimated base fee
  const pujaDoc = await Puja.findOne({ name: new RegExp('^' + String(b.service).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') });
  const pujaEstimatedFee = (pujaDoc && (pujaDoc.baseFee || Number(String(pujaDoc.price || '').replace(/[^0-9]/g, '')))) || 1199;

  let rawBaseFee = 0;
  if (preferredPandit) {
    rawBaseFee = (preferredPandit.districtPrices && Number(preferredPandit.districtPrices[b.district])) || preferredPandit.fee || Number(b.originalFee || b.fee) || pujaEstimatedFee;
  } else if (Number(b.originalFee) > 0) {
    rawBaseFee = Number(b.originalFee);
  } else if (Number(b.fee) > 0) {
    rawBaseFee = Number(b.fee);
  } else {
    rawBaseFee = pujaEstimatedFee;
  }

  const advanceAmount = Number(b.advanceAmount) || 0;
  const bookingId = await uniqueId(Booking, 'bookingId', 'PUJA');

  const devoteeState = (devoteeUser && devoteeUser.state) || b.state || 'Odisha';
  const applicableOffer = rawBaseFee > 0 ? await findApplicableOffer({ service: b.service, district: b.district, state: devoteeState, date: b.date }) : null;
  const commSetting = await AppSetting.findOne({ key: 'admin_commission_percent' });
  const commPct = commSetting && typeof commSetting.value === 'number' ? commSetting.value : DEFAULT_PLATFORM_COMMISSION;

  const feeCalc = calculateFeeWithDiscount(rawBaseFee, applicableOffer, commPct);

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
    fee: feeCalc.finalFee,
    originalFee: feeCalc.originalFee,
    discountPercent: feeCalc.discountPercent,
    discountAmount: feeCalc.discountAmount,
    discountOfferId: feeCalc.offerId,
    discountOfferTitle: feeCalc.offerTitle,
    adminFeePercent: commPct,
    adminFeeAmount: feeCalc.adminFeeAmount,
    panditNetPayout: feeCalc.panditNetPayout,
    advanceAmount,
    advancePaid: advanceAmount > 0,
    paymentStatus: advanceAmount <= 0 ? 'Pending' : advanceAmount >= feeCalc.finalFee ? 'Paid' : 'Partial',
    bookingType: b.bookingType || 'Standard',
    termsAccepted: Boolean(b.termsAccepted !== undefined ? b.termsAccepted : true),
    refundAccountDetails: {
      upiId: (b.upiId || (devoteeUser ? devoteeUser.upiId : '') || '').trim(),
      bankAccount: (b.bankAccount || (devoteeUser ? devoteeUser.bankAccount : '') || '').trim(),
      ifscCode: (b.ifscCode || (devoteeUser ? devoteeUser.ifscCode : '') || '').trim().toUpperCase(),
      accountHolder: (b.accountHolder || (devoteeUser ? devoteeUser.accountHolder : '') || b.userName || '').trim(),
      bankName: (b.bankName || (devoteeUser ? devoteeUser.bankName : '') || '').trim(),
      qrCode: (b.qrCode || (devoteeUser ? devoteeUser.qrCode : '') || '').trim()
    }
  });

  if (devoteeUser) {
    let changed = false;
    if (b.upiId && !devoteeUser.upiId) { devoteeUser.upiId = String(b.upiId).trim(); changed = true; }
    if (b.bankAccount && !devoteeUser.bankAccount) { devoteeUser.bankAccount = String(b.bankAccount).trim(); changed = true; }
    if (b.ifscCode && !devoteeUser.ifscCode) { devoteeUser.ifscCode = String(b.ifscCode).trim().toUpperCase(); changed = true; }
    if (b.accountHolder && !devoteeUser.accountHolder) { devoteeUser.accountHolder = String(b.accountHolder).trim(); changed = true; }
    if (b.bankName && !devoteeUser.bankName) { devoteeUser.bankName = String(b.bankName).trim(); changed = true; }
    if (b.qrCode && !devoteeUser.qrCode) { devoteeUser.qrCode = String(b.qrCode).trim(); changed = true; }
    if (changed) await devoteeUser.save();
  }

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

  // Availability check (non-availability marked by pandit and availableDays)
  const avail = isPanditAvailableOnDate(pandit, b.date);
  if (!avail.available) {
    return res.status(400).json({ error: `Pandit ${pandit.name} is not available on ${b.date} (${avail.reason}). Please select another Pandit.` });
  }

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

  const pujaDoc = await Puja.findOne({ name: new RegExp('^' + String(b.service).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') });
  const pujaEstimatedFee = (pujaDoc && (pujaDoc.baseFee || Number(String(pujaDoc.price || '').replace(/[^0-9]/g, '')))) || 1199;
  const rawBaseFee = (pandit.districtPrices && Number(pandit.districtPrices[b.district])) || pandit.fee || (b.originalFee > 0 ? b.originalFee : (b.fee > 0 ? b.fee : pujaEstimatedFee));
  const devoteeUser = await User.findOne({ email: lc(b.userEmail) });
  const devoteeState = (devoteeUser && devoteeUser.state) || b.state || 'Odisha';

  let applicableOffer = null;
  if (b.discountOfferId) {
    applicableOffer = await MediaOffer.findOne({ offerId: b.discountOfferId });
  }
  if (!applicableOffer) {
    applicableOffer = await findApplicableOffer({ service: b.service, district: b.district, state: devoteeState, date: b.date });
  }
  if (!applicableOffer && b.discountPercent > 0) {
    applicableOffer = {
      offerId: b.discountOfferId || '',
      title: b.discountOfferTitle || 'Promotional Festive Offer',
      discountPercent: b.discountPercent
    };
  }

  const commSetting = await AppSetting.findOne({ key: 'admin_commission_percent' });
  const commPct = commSetting && typeof commSetting.value === 'number' ? commSetting.value : (b.adminFeePercent || DEFAULT_PLATFORM_COMMISSION);

  const feeCalc = calculateFeeWithDiscount(rawBaseFee, applicableOffer, commPct);

  b.panditEmail = pandit.email;
  b.panditName = pandit.name;
  b.fee = feeCalc.finalFee;
  b.originalFee = feeCalc.originalFee;
  b.discountPercent = feeCalc.discountPercent;
  b.discountAmount = feeCalc.discountAmount;
  b.discountOfferId = feeCalc.offerId;
  b.discountOfferTitle = feeCalc.offerTitle;
  b.adminFeePercent = commPct;
  b.adminFeeAmount = feeCalc.adminFeeAmount;
  b.panditNetPayout = feeCalc.panditNetPayout;
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
  const acceptUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(pandit.email)}&decision=Accept&token=${encodeURIComponent(panditToken)}#dashboard`;
  const rejectUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(pandit.email)}&decision=Reject&token=${encodeURIComponent(panditToken)}#dashboard`;
  const reviewUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(pandit.email)}&token=${encodeURIComponent(panditToken)}#dashboard`;

  // Send assignment offer alert to Pandit with complete offer details, uncompacted fee, breakdown, net profit, and direct Accept/Reject action links
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
    fee: feeCalc.finalFee,
    totalPujaCost: feeCalc.finalFee,
    originalFee: feeCalc.originalFee,
    discountAmount: feeCalc.discountAmount,
    discountPercent: feeCalc.discountPercent,
    discountOfferTitle: feeCalc.offerTitle,
    discountOfferId: feeCalc.offerId,
    offerTitle: feeCalc.offerTitle,
    offerDiscount: feeCalc.discountAmount,
    adminFeePercent: commPct,
    adminFeeAmount: feeCalc.adminFeeAmount,
    adminFee: feeCalc.adminFeeAmount,
    netDakshina: feeCalc.panditNetPayout,
    panditFee: feeCalc.panditNetPayout,
    netProfit: feeCalc.panditNetPayout,
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
  const acceptUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(b.panditEmail)}&decision=Accept&token=${encodeURIComponent(panditToken)}#dashboard`;
  const rejectUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(b.panditEmail)}&decision=Reject&token=${encodeURIComponent(panditToken)}#dashboard`;
  const reviewUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(b.panditEmail)}&token=${encodeURIComponent(panditToken)}#dashboard`;

  res.json({
    ok: true,
    bookingId: b.bookingId,
    service: b.service,
    date: b.date,
    time: b.time,
    district: b.district,
    panditName: b.panditName,
    panditEmail: b.panditEmail,
    fee: b.fee,
    totalPujaCost: b.fee,
    originalFee: b.originalFee || b.fee,
    discountAmount: b.discountAmount || 0,
    discountPercent: b.discountPercent || 0,
    discountOfferTitle: b.discountOfferTitle || '',
    adminFeePercent: b.adminFeePercent || DEFAULT_PLATFORM_COMMISSION,
    adminFeeAmount: b.adminFeeAmount || 0,
    netDakshina: b.panditNetPayout || b.fee,
    netProfit: b.panditNetPayout || b.fee,
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

  const pujaDoc = await Puja.findOne({ name: new RegExp('^' + String(b.service).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') });
  const pujaEstimatedFee = (pujaDoc && (pujaDoc.baseFee || Number(String(pujaDoc.price || '').replace(/[^0-9]/g, '')))) || 1199;
  const rawBaseFee = (b.originalFee > 0 ? b.originalFee : ((pandit.districtPrices && Number(pandit.districtPrices[b.district])) || pandit.fee || b.fee || pujaEstimatedFee));
  const fee = b.fee || rawBaseFee;
  const originalFee = b.originalFee || (b.discountAmount ? fee + b.discountAmount : rawBaseFee);
  const discountAmount = b.discountAmount || (originalFee > fee ? originalFee - fee : 0);
  const discountPercent = b.discountPercent || (originalFee > 0 && discountAmount > 0 ? Math.round((discountAmount / originalFee) * 100) : 0);
  const commPct = b.adminFeePercent || DEFAULT_PLATFORM_COMMISSION;
  const adminFeeAmount = b.adminFeeAmount || Math.round((fee * commPct) / 100);
  const panditNetPayout = b.panditNetPayout || Math.max(0, fee - adminFeeAmount);

  const panditToken = sign({ email: pandit.email, role: 'pandit', bookingId: b.bookingId, purpose: 'pandit_offer_response' });
  const reqHost = req.get('host') || '';
  const reqProto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  const origin = req.headers.origin || (reqHost ? `${reqProto}://${reqHost}` : 'https://pujaconnect-one.vercel.app');
  const baseUrl = process.env.APP_URL || origin;
  const acceptUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(pandit.email)}&decision=Accept&token=${encodeURIComponent(panditToken)}#dashboard`;
  const rejectUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(pandit.email)}&decision=Reject&token=${encodeURIComponent(panditToken)}#dashboard`;
  const reviewUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(b.bookingId)}&email=${encodeURIComponent(pandit.email)}&token=${encodeURIComponent(panditToken)}#dashboard`;

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
    originalFee,
    discountAmount,
    discountPercent,
    discountOfferTitle: b.discountOfferTitle || '',
    discountOfferId: b.discountOfferId || '',
    offerTitle: b.discountOfferTitle || '',
    offerDiscount: discountAmount,
    adminFeePercent: commPct,
    adminFeeAmount,
    adminFee: adminFeeAmount,
    netDakshina: panditNetPayout,
    panditFee: panditNetPayout,
    netProfit: panditNetPayout,
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

// Parse ceremony start date & time into Date object
function parsePujaStartDateTime(dateStr, timeStr) {
  if (!dateStr) return new Date();
  let year, month, day;
  const str = String(dateStr).trim();
  const sep = str.includes('/') ? '/' : str.includes('.') ? '.' : '-';
  const parts = str.split(sep);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    } else if (parts[2].length === 4) {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    } else {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    }
  } else {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      year = d.getFullYear();
      month = d.getMonth() + 1;
      day = d.getDate();
    } else {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1;
      day = now.getDate();
    }
  }
  let hour = 8;
  let minute = 0;

  if (timeStr) {
    const startPart = String(timeStr).split('-')[0].trim();
    const match = startPart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const ampm = (match[3] || '').toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      hour = h;
      minute = m;
    }
  }

  return new Date(year, month - 1, day, hour, minute, 0);
}

// Parse ceremony slot end date & time into Date object
function parsePujaEndDateTime(dateStr, timeStr) {
  if (!dateStr) return new Date();
  let year, month, day;
  const str = String(dateStr).trim();
  const sep = str.includes('/') ? '/' : str.includes('.') ? '.' : '-';
  const parts = str.split(sep);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    } else if (parts[2].length === 4) {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    } else {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    }
  } else {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      year = d.getFullYear();
      month = d.getMonth() + 1;
      day = d.getDate();
    } else {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1;
      day = now.getDate();
    }
  }

  if (timeStr && String(timeStr).includes('-')) {
    const timeParts = String(timeStr).split('-');
    const endPart = timeParts[1].trim();
    const match = endPart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const ampm = (match[3] || '').toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return new Date(year, month - 1, day, h, m, 0);
    }
  }

  const startDt = parsePujaStartDateTime(dateStr, timeStr);
  return new Date(startDt.getTime() + 3 * 60 * 60 * 1000);
}

function isPujaSlotPassed(dateStr, timeStr) {
  try {
    const endDt = parsePujaEndDateTime(dateStr, timeStr);
    return Date.now() >= endDt.getTime();
  } catch (e) {
    return false;
  }
}

async function autoUpdatePassedSlots(bookings) {
  if (!bookings || !bookings.length) return bookings;
  const toCompleteIds = [];
  const toRestoreConfirmedIds = [];
  const results = [];

  for (const item of bookings) {
    const b = (item && typeof item.toObject === 'function') ? item.toObject() : { ...item };
    if (!b) continue;

    const isCancelled = b.status === 'Cancelled' || b.status === 'Rejected';
    const slotPassed = isPujaSlotPassed(b.date, b.time);

    if (!isCancelled && slotPassed && b.status !== 'Completed') {
      b.status = 'Completed';
      if (item.status !== undefined) item.status = 'Completed';
      toCompleteIds.push(b._id || b.bookingId);
    } else if (!isCancelled && !slotPassed && b.status === 'Completed' && !b.havanConducted) {
      b.status = 'Confirmed';
      if (item.status !== undefined) item.status = 'Confirmed';
      toRestoreConfirmedIds.push(b._id || b.bookingId);
    }
    results.push(b);
  }

  if (toCompleteIds.length > 0) {
    try {
      await Booking.updateMany(
        {
          $or: [
            { _id: { $in: toCompleteIds } },
            { bookingId: { $in: toCompleteIds } }
          ],
          status: { $nin: ['Cancelled', 'Rejected'] }
        },
        { $set: { status: 'Completed' } }
      );
    } catch (err) {
      console.warn('Error auto-updating completed bookings in DB:', err.message);
    }
  }

  if (toRestoreConfirmedIds.length > 0) {
    try {
      await Booking.updateMany(
        {
          $or: [
            { _id: { $in: toRestoreConfirmedIds } },
            { bookingId: { $in: toRestoreConfirmedIds } }
          ],
          status: 'Completed',
          havanConducted: { $ne: true }
        },
        { $set: { status: 'Confirmed' } }
      );
    } catch (err) {
      console.warn('Error reverting premature completed bookings in DB:', err.message);
    }
  }

  return results;
}

// Calculate Cancellation & Refund terms according to platform rules:
// 1. Pandit cancels anytime -> 100% full refund to devotee.
// 2. Devotee cancels > 18h before start -> 100% full refund (₹0 fee). If unpaid, no payment required.
// 3. Devotee cancels 18h to 1h before start -> 40% refund, 60% cancellation fee.
//    Of the retained 60% fee, 40% goes to confirmed Pandit as compensation.
// 4. Devotee cancels < 1h before start -> 0% refund, 100% retained cancellation fee.
//    Of the retained fee, 40% goes to confirmed Pandit.
function calculateCancellationTerms(booking, cancelledBy = 'user') {
  const fee = Number(booking.fee) || 0;
  const isPaid = booking.paymentStatus === 'Paid' || booking.paymentStatus === 'Paid & Verified';
  const startDt = parsePujaStartDateTime(booking.date, booking.time);
  const now = new Date();
  const diffMs = startDt.getTime() - now.getTime();
  const rawHours = diffMs / (1000 * 60 * 60);
  const hoursBefore = Math.round(rawHours * 10) / 10;

  if (cancelledBy === 'pandit') {
    return {
      cancelledBy: 'pandit',
      hoursBefore,
      tier: 'pandit_cancelled',
      tierLabel: 'Cancelled by Pandit (100% Full Refund Guarantee)',
      refundPercent: 100,
      cancellationFeePercent: 0,
      refundAmount: isPaid ? fee : 0,
      cancellationFee: 0,
      panditCompensation: 0,
      adminRetained: 0,
      isPaid
    };
  }

  if (hoursBefore >= 18) {
    return {
      cancelledBy: 'user',
      hoursBefore,
      tier: 'more_than_18h',
      tierLabel: 'More than 18 hours before ceremony (100% Full Refund / ₹0 Fee)',
      refundPercent: 100,
      cancellationFeePercent: 0,
      refundAmount: isPaid ? fee : 0,
      cancellationFee: 0,
      panditCompensation: 0,
      adminRetained: 0,
      isPaid
    };
  }

  if (hoursBefore >= 1 && hoursBefore < 18) {
    const cancelFee = Math.round((fee * 60) / 100);
    const refundAmt = Math.round((fee * 40) / 100);
    const panditComp = Math.round((cancelFee * 40) / 100); // 40% of retained fee
    const adminShare = cancelFee - panditComp;

    return {
      cancelledBy: 'user',
      hoursBefore,
      tier: '18h_to_1h',
      tierLabel: 'Between 18 hours and 1 hour before ceremony (40% Refund, 60% Fee)',
      refundPercent: 40,
      cancellationFeePercent: 60,
      refundAmount: isPaid ? refundAmt : 0,
      cancellationFee: cancelFee,
      panditCompensation: panditComp,
      adminRetained: adminShare,
      isPaid,
      payableIfUnpaid: isPaid ? 0 : cancelFee
    };
  }

  const cancelFee = fee;
  const panditComp = Math.round((fee * 40) / 100);
  const adminShare = fee - panditComp;

  return {
    cancelledBy: 'user',
    hoursBefore,
    tier: 'less_than_1h',
    tierLabel: 'Less than 1 hour before ceremony (0% Refund, 100% Retained Fee)',
    refundPercent: 0,
    cancellationFeePercent: 100,
    refundAmount: 0,
    cancellationFee: cancelFee,
    panditCompensation: panditComp,
    adminRetained: adminShare,
    isPaid,
    payableIfUnpaid: isPaid ? 0 : cancelFee
  };
}

// Live Cancellation Preview (calculates hours left and applicable policy)
app.get('/api/bookings/:id/cancellation-preview', wrap(async (req, res) => {
  const b = await Booking.findOne(bookingFindQuery(req.params.id));
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  const cancelledBy = req.query.cancelledBy === 'pandit' ? 'pandit' : 'user';
  const terms = calculateCancellationTerms(b, cancelledBy);
  const devoteeUser = await User.findOne({ email: lc(b.userEmail) }).lean();
  res.json({
    ok: true,
    bookingId: b.bookingId,
    service: b.service,
    date: b.date,
    time: b.time,
    fee: b.fee,
    paymentStatus: b.paymentStatus,
    panditName: b.panditName,
    terms,
    userPayoutDetails: {
      upiId: (devoteeUser && devoteeUser.upiId) || (b.refundAccountDetails && b.refundAccountDetails.upiId) || '',
      bankAccount: (devoteeUser && devoteeUser.bankAccount) || (b.refundAccountDetails && b.refundAccountDetails.bankAccount) || '',
      ifscCode: (devoteeUser && devoteeUser.ifscCode) || (b.refundAccountDetails && b.refundAccountDetails.ifscCode) || '',
      accountHolder: (devoteeUser && devoteeUser.accountHolder) || (b.refundAccountDetails && b.refundAccountDetails.accountHolder) || b.userName,
      bankName: (devoteeUser && devoteeUser.bankName) || (b.refundAccountDetails && b.refundAccountDetails.bankName) || '',
      qrCode: (devoteeUser && devoteeUser.qrCode) || (b.refundAccountDetails && b.refundAccountDetails.qrCode) || ''
    }
  });
}));

// Process Ceremony Cancellation (Devotee or Pandit)
app.post('/api/bookings/:id/cancel', wrap(async (req, res) => {
  const b = await Booking.findOne(bookingFindQuery(req.params.id));
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  if (b.status === 'Cancelled') return res.status(400).json({ error: 'This ceremony booking is already cancelled' });
  if (b.status === 'Completed') return res.status(400).json({ error: 'Completed ceremonies cannot be cancelled' });

  const cancelledBy = (req.body && req.body.cancelledBy) === 'pandit' ? 'pandit' : 'user';
  const reason = (req.body && req.body.reason ? String(req.body.reason).trim() : '') || (cancelledBy === 'pandit' ? 'Cancelled by assigned Pandit' : 'Cancelled by Devotee');
  const terms = calculateCancellationTerms(b, cancelledBy);

  // Retrieve or update devotee refund payout details
  const devoteeUser = await User.findOne({ email: lc(b.userEmail) });
  let payout = req.body && req.body.refundAccountDetails ? req.body.refundAccountDetails : (b.refundAccountDetails || {});
  if (!payout || (!payout.upiId && !payout.bankAccount)) {
    if (devoteeUser) {
      payout = {
        upiId: devoteeUser.upiId || '',
        bankAccount: devoteeUser.bankAccount || '',
        ifscCode: devoteeUser.ifscCode || '',
        accountHolder: devoteeUser.accountHolder || devoteeUser.name || b.userName,
        bankName: devoteeUser.bankName || '',
        qrCode: devoteeUser.qrCode || ''
      };
    }
  }

  // If user passed new bank details, also save to devotee user profile
  if (req.body && req.body.refundAccountDetails && devoteeUser) {
    const r = req.body.refundAccountDetails;
    if (r.upiId) devoteeUser.upiId = String(r.upiId).trim();
    if (r.bankAccount) devoteeUser.bankAccount = String(r.bankAccount).trim();
    if (r.ifscCode) devoteeUser.ifscCode = String(r.ifscCode).trim().toUpperCase();
    if (r.accountHolder) devoteeUser.accountHolder = String(r.accountHolder).trim();
    if (r.bankName) devoteeUser.bankName = String(r.bankName).trim();
    if (r.qrCode) devoteeUser.qrCode = String(r.qrCode).trim();
    await devoteeUser.save();
  }

  b.status = 'Cancelled';
  b.cancelledBy = cancelledBy;
  b.cancelledAt = new Date();
  b.cancellationReason = reason;
  b.cancellationHoursBefore = terms.hoursBefore;
  b.cancellationFeePercent = terms.cancellationFeePercent;
  b.cancellationFeeAmount = terms.cancellationFee;
  b.refundEligiblePercent = terms.refundPercent;
  b.refundAmount = terms.refundAmount;
  b.refundStatus = terms.refundAmount > 0 ? 'Pending Refund' : 'N/A';
  b.refundAccountDetails = payout;
  b.panditCompensationAmount = terms.panditCompensation;
  b.panditCompensationStatus = terms.panditCompensation > 0 ? 'Pending' : 'N/A';
  if (cancelledBy === 'pandit') {
    b.panditApproval = 'Rejected';
  }
  await b.save();

  const refundDestSummary = payout.upiId ? `UPI: ${payout.upiId}` : (payout.bankAccount ? `Bank A/c: ${payout.bankAccount} (${payout.ifscCode || ''}, ${payout.accountHolder || ''})` : 'Devotee Registered Account');

  // Trigger Notifications:
  if (cancelledBy === 'user') {
    // 1. Notify devotee
    await sendSafe('USER_CANCELLED_DEVOTEE', b.userEmail, {
      ...b.toObject(),
      hoursBefore: terms.hoursBefore,
      tierLabel: terms.tierLabel,
      cancellationFee: terms.cancellationFee,
      cancellationFeePercent: terms.cancellationFeePercent,
      refundAmount: terms.refundAmount,
      refundPercent: terms.refundPercent,
      refundAccountSummary: refundDestSummary
    });

    // 2. Notify assigned pandit if present
    if (b.panditEmail) {
      await sendSafe('USER_CANCELLED_PANDIT', b.panditEmail, {
        ...b.toObject(),
        hoursBefore: terms.hoursBefore,
        panditCompensation: terms.panditCompensation,
        cancellationReason: reason
      });
    }
  } else {
    // Cancelled by Pandit -> 100% full refund guarantee to devotee within 24 hours
    await sendSafe('PANDIT_CANCELLED_DEVOTEE', b.userEmail, {
      ...b.toObject(),
      fee: b.fee,
      refundAmount: b.fee,
      refundAccountSummary: refundDestSummary,
      cancellationReason: reason
    });

    // Send dedicated 24-hour direct refund confirmation mail to user registered email address
    await sendSafe('PANDIT_CANCEL_REFUND_24H', b.userEmail, {
      ...b.toObject(),
      fee: b.fee,
      refundAmount: b.fee,
      refundAccountSummary: refundDestSummary,
      cancellationReason: reason
    });
  }

  res.json({
    ok: true,
    booking: b,
    terms,
    message: cancelledBy === 'pandit'
      ? 'Ceremony cancelled. Devotee has been notified of 100% full refund guarantee.'
      : `Ceremony cancelled successfully (${terms.tierLabel}).`
  });
}));

// Admin Process Refund: Disburse funds to devotee and record transaction reference
app.post('/api/bookings/:id/process-refund', adminOnly, wrap(async (req, res) => {
  const { refundTxnId, refundMethod, refundAmount } = req.body;
  if (!refundTxnId) return res.status(400).json({ error: 'Transaction Reference ID (UTR / UPI Ref) is required' });

  const b = await Booking.findOne(bookingFindQuery(req.params.id));
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  if (b.status !== 'Cancelled') return res.status(400).json({ error: 'Refunds can only be processed for cancelled bookings' });

  const finalRefundAmt = refundAmount !== undefined ? Number(refundAmount) : (b.refundAmount || 0);
  b.refundStatus = 'Refunded';
  b.refundTxnId = String(refundTxnId).trim();
  b.refundMethod = refundMethod || 'Direct Bank / UPI Transfer';
  b.refundDate = new Date();
  b.refundAmount = finalRefundAmt;
  await b.save();

  const payout = b.refundAccountDetails || {};
  const refundDestSummary = payout.upiId ? `UPI: ${payout.upiId}` : (payout.bankAccount ? `Bank A/c: ${payout.bankAccount} (${payout.ifscCode || ''}, ${payout.accountHolder || ''})` : 'Devotee Registered Account');

  // Trigger REFUND_PROCESSED email to Devotee
  await sendSafe('REFUND_PROCESSED', b.userEmail, {
    ...b.toObject(),
    refundAmount: finalRefundAmt,
    refundTxnId: b.refundTxnId,
    refundMethod: b.refundMethod,
    refundAccountSummary: refundDestSummary,
    refundDateFormatted: b.refundDate.toLocaleString('en-IN')
  });

  res.json({
    ok: true,
    booking: b,
    message: `Refund of ₹${finalRefundAmt} marked as completed and notification email sent to devotee.`
  });
}));

// Admin Settle Pandit Cancellation Compensation
app.post('/api/bookings/:id/settle-pandit-compensation', adminOnly, wrap(async (req, res) => {
  const { compensationTxnId, compensationAmount } = req.body;
  if (!compensationTxnId) return res.status(400).json({ error: 'Transaction Reference ID is required' });

  const b = await Booking.findOne(bookingFindQuery(req.params.id));
  if (!b) return res.status(404).json({ error: 'Booking not found' });

  if (compensationAmount !== undefined) {
    b.panditCompensationAmount = Number(compensationAmount);
  }
  const method = req.body.compensationMethod || 'Direct Bank / UPI Transfer';
  b.panditCompensationStatus = 'Paid';
  b.panditCompensationTxnId = String(compensationTxnId).trim();
  b.panditCompensationMethod = method;
  b.panditCompensationDate = new Date();
  await b.save();

  if (b.panditEmail) {
    const pandit = await Pandit.findOne({ email: lc(b.panditEmail) });
    const pDest = (pandit && pandit.upiId) ? `UPI: ${pandit.upiId}` : ((pandit && pandit.bankAccount) ? `Bank A/c: ${pandit.bankAccount} (${pandit.ifscCode || ''})` : 'Registered Pandit Bank Account');
    await sendSafe('PANDIT_COMPENSATION_CREDITED', b.panditEmail, {
      ...b.toObject(),
      amount: b.panditCompensationAmount,
      compensationTxnId: b.panditCompensationTxnId,
      compensationMethod: method,
      payoutAccountSummary: pDest,
      settlementDate: b.panditCompensationDate.toLocaleString('en-IN')
    });
  }

  res.json({
    ok: true,
    booking: b,
    message: `Pandit cancellation compensation of ₹${b.panditCompensationAmount} marked as settled and confirmation email sent.`
  });
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
  let b = await Booking.findOne(bookingFindQuery(req.params.id));
  if (!b) {
    const q = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
      : { id: req.params.id };
    const r = await LongPujaRequest.findOne(q);
    if (r) {
      if (r.status === 'Cancelled' || r.status === 'Rejected' || r.status === 'Declined') {
        return res.status(400).json({ error: 'Cannot submit Dakshina for a cancelled ceremony request.' });
      }
      r.paymentStatus = 'Under Processing';
      r.paymentProof = String(paymentProof).trim();
      r.paymentMethod = paymentMethod || 'UPI/Bank Transfer';
      r.paymentDate = new Date();
      r.advanceAmount = Number(req.body.amount) || r.estimatedCost || 0;
      r.advancePaid = false;
      r.paymentRejectionReason = '';
      await r.save();
      return res.json({ ok: true, request: r, message: 'Dakshina payment submitted successfully! Your payment is under processing and awaiting Admin verification.' });
    }
    return res.status(404).json({ error: 'Booking not found' });
  }

  if (b.status === 'Cancelled' || b.status === 'Rejected' || b.slotUnavailable) {
    return res.status(400).json({ error: 'Cannot submit Dakshina for a cancelled or rejected ceremony request.' });
  }

  // When devotee submits payment, status is 'Under Processing'.
  // Do NOT prematurely mark ceremony as 'Completed' or 'Paid' yet!
  b.paymentStatus = 'Under Processing';
  b.advanceAmount = b.fee;
  b.advancePaid = false;
  b.paymentProof = String(paymentProof).trim();
  b.paymentMethod = paymentMethod || 'UPI/Bank Transfer';
  b.paymentDate = new Date();
  b.paymentRejectionReason = '';
  if (isPujaSlotPassed(b.date, b.time) && b.status !== 'Cancelled' && b.status !== 'Rejected') {
    b.status = 'Completed';
  } else if (b.status !== 'Cancelled' && b.status !== 'Rejected' && b.status !== 'In Progress') {
    b.status = 'Confirmed';
  }
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

  // When Admin verifies payment, devotee is marked 'Paid & Verified'.
  // Do NOT mark ceremony as 'Completed' if ceremony date & time slot is in the future.
  // The ceremony only becomes 'Completed' after the scheduled date & time slot has passed without cancellation!
  b.paymentStatus = 'Paid & Verified';
  b.advanceAmount = b.fee;
  b.advancePaid = true;
  b.paymentRejectionReason = '';
  if (!b.invoiceId) {
    b.invoiceId = 'INV-' + b.bookingId.replace('PUJA-', '') + '-' + Date.now().toString().slice(-4);
    b.invoiceGeneratedAt = new Date();
  }

  if (isPujaSlotPassed(b.date, b.time) && b.status !== 'Cancelled' && b.status !== 'Rejected') {
    b.status = 'Completed';
  } else if (b.status !== 'Cancelled' && b.status !== 'Rejected' && b.status !== 'In Progress') {
    b.status = 'Confirmed';
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

// Admin pays Pandit: marks payout as Paid (or Admin Fee received) and emails Pandit with full breakdown
app.post('/api/bookings/:id/pay-pandit', adminOnly, wrap(async (req, res) => {
  const b = await Booking.findOne(bookingFindQuery(req.params.id));
  
  // If not found in regular bookings, check if this is a LongPujaRequest
  if (!b) {
    const r = await LongPujaRequest.findOne(longPujaFindQuery(req.params.id));
    if (!r) return res.status(404).json({ error: 'Ceremony booking not found' });
    return handleLongPujaPayPandit(r, req, res);
  }

  if (!b.panditEmail) return res.status(400).json({ error: 'No pandit assigned to this booking' });

  const pandit = await Pandit.findOne({ email: lc(b.panditEmail) });
  const { amount, txnId, method, adminFeePercent, adminFeeAmount, otherFee, paymentType } = req.body || {};

  const mainFee = Number(b.fee) || (pandit && pandit.fee) || 1500;
  const percent = Number(adminFeePercent !== undefined ? adminFeePercent : (b.adminFeePercent !== undefined ? b.adminFeePercent : 10));
  const feeDeduction = Number(adminFeeAmount !== undefined ? adminFeeAmount : Math.round((mainFee * percent) / 100));
  const otherFeeAmt = Number(otherFee !== undefined ? otherFee : (b.otherFee || 0));
  const effPaymentType = paymentType || b.paymentType || (b.paymentMethod === 'Cash Paid to Pandit' ? 'pandit_gives_admin_fee' : 'admin_transfer');
  
  const payoutAmount = Number(amount) || (effPaymentType === 'pandit_gives_admin_fee' ? (feeDeduction + otherFeeAmt) : Math.max(0, mainFee - feeDeduction - otherFeeAmt));
  const payoutTxn = txnId ? String(txnId).trim() : ('PAYOUT-' + b.bookingId.replace(/[^0-9]/g, '') + '-' + Date.now().toString().slice(-4));
  const payoutMethod = method || (effPaymentType === 'pandit_gives_admin_fee' ? 'Direct / Cash Handover' : 'Direct Bank Transfer (IMPS/NEFT)');

  b.adminFeePercent = percent;
  b.adminFeeAmount = feeDeduction;
  b.otherFee = otherFeeAmt;
  b.paymentType = effPaymentType;
  b.panditNetPayout = effPaymentType === 'pandit_gives_admin_fee' ? Math.max(0, mainFee - feeDeduction - otherFeeAmt) : payoutAmount;
  b.panditPayoutStatus = 'Paid';
  b.panditPayoutAmount = payoutAmount;
  b.panditPayoutDate = new Date();
  b.panditPayoutTxnId = payoutTxn;
  b.panditPayoutMethod = payoutMethod;
  await b.save();

  if (effPaymentType === 'pandit_gives_admin_fee') {
    // Send email acknowledging Admin Fee Received from Pandit
    await sendSafe('PANDIT_ADMIN_FEE_RECEIVED', b.panditEmail, {
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
      otherFee: otherFeeAmt,
      amount: payoutAmount,
      payoutTxnId: payoutTxn,
      payoutMethod
    });
  } else {
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
      otherFee: otherFeeAmt,
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
  }

  res.json({ ok: true, booking: b });
}));

async function handleLongPujaPayPandit(r, req, res) {
  const { amount, txnId, method, adminFeePercent, adminFeeAmount, otherFee, paymentType, panditEmail, grossFee } = req.body || {};
  const targetEmail = lc(panditEmail || (r.assignedPandits && r.assignedPandits[0]) || '');
  if (!targetEmail) return res.status(400).json({ error: 'No assigned pandit email specified for payout' });

  const pandit = await Pandit.findOne({ email: targetEmail });
  const teamSize = Math.max(1, Number(r.requiredPandits) || (r.assignedPandits && r.assignedPandits.length) || 1);
  const totalCost = Number(r.estimatedCost) || 0;
  const perPanditGross = Number(grossFee) || Math.round(totalCost / teamSize);

  const percent = Number(adminFeePercent !== undefined ? adminFeePercent : (r.adminFeePercent !== undefined ? r.adminFeePercent : 10));
  const feeDeduction = Number(adminFeeAmount !== undefined ? adminFeeAmount : Math.round((perPanditGross * percent) / 100));
  const otherFeeAmt = Number(otherFee !== undefined ? otherFee : (r.otherFee || 0));
  const effPaymentType = paymentType || r.paymentType || (r.paymentMethod === 'Cash Paid to Pandit' ? 'pandit_gives_admin_fee' : 'admin_transfer');

  const payoutAmount = Number(amount) || (effPaymentType === 'pandit_gives_admin_fee' ? (feeDeduction + otherFeeAmt) : Math.max(0, perPanditGross - feeDeduction - otherFeeAmt));
  const payoutTxn = txnId ? String(txnId).trim() : ('PAYOUT-' + r.id.replace(/[^0-9]/g, '') + '-' + Date.now().toString().slice(-4));
  const payoutMethod = method || (effPaymentType === 'pandit_gives_admin_fee' ? 'Direct / Cash Handover' : 'Direct Bank Transfer (IMPS/NEFT)');

  r.panditPayouts = r.panditPayouts || {};
  r.panditPayouts[targetEmail] = {
    panditEmail: targetEmail,
    panditName: (pandit && pandit.name) || targetEmail,
    payoutStatus: 'Paid',
    grossFee: perPanditGross,
    adminFeePercent: percent,
    adminFeeAmount: feeDeduction,
    otherFee: otherFeeAmt,
    netPayout: effPaymentType === 'pandit_gives_admin_fee' ? Math.max(0, perPanditGross - feeDeduction - otherFeeAmt) : payoutAmount,
    payoutAmount,
    payoutDate: new Date(),
    payoutTxnId: payoutTxn,
    payoutMethod,
    paymentType: effPaymentType
  };

  r.adminFeePercent = percent;
  r.adminFeeAmount = feeDeduction * teamSize;
  r.otherFee = otherFeeAmt;
  r.paymentType = effPaymentType;

  // Check if all assigned pandits are paid
  const assignedList = (r.assignedPandits && r.assignedPandits.length > 0) ? r.assignedPandits : [targetEmail];
  const allPaid = assignedList.every(em => r.panditPayouts[lc(em)] && r.panditPayouts[lc(em)].payoutStatus === 'Paid');
  if (allPaid || assignedList.length <= 1) {
    r.panditPayoutStatus = 'Paid';
    r.panditPayoutAmount = payoutAmount;
    r.panditPayoutDate = new Date();
    r.panditPayoutTxnId = payoutTxn;
    r.panditPayoutMethod = payoutMethod;
  }

  r.markModified('panditPayouts');
  await r.save();

  if (effPaymentType === 'pandit_gives_admin_fee') {
    // Send email acknowledging Admin Fee Received from Pandit
    await sendSafe('PANDIT_ADMIN_FEE_RECEIVED', targetEmail, {
      bookingId: r.id,
      service: `${r.pujaName} (Multi-Day Ceremony · ${r.totalDays} Days)`,
      panditName: (pandit && pandit.name) || 'Pandit ji',
      userName: r.userName,
      userPhone: r.phone || '',
      userEmail: r.userEmail,
      date: `${r.fromDate} → ${r.toDate} (${r.totalDays || 1} Days)`,
      time: `${r.dailyHours || 4}h/day, Daily Start: ${r.startTime || '08:00 AM'}`,
      district: r.district,
      address: r.venueAddress || r.venue || r.address || r.district,
      mainFee: perPanditGross,
      adminFeePercent: percent,
      adminFeeAmount: feeDeduction,
      otherFee: otherFeeAmt,
      amount: payoutAmount,
      payoutTxnId: payoutTxn,
      payoutMethod
    });
  } else {
    // Send email to Pandit notifying money amount credited to account number with full uncompacted details
    await sendSafe('PANDIT_PAYMENT_CREDITED', targetEmail, {
      bookingId: r.id,
      service: `${r.pujaName} (Multi-Day Ceremony · ${r.totalDays} Days)`,
      panditName: (pandit && pandit.name) || 'Pandit ji',
      userName: r.userName,
      userPhone: r.phone || '',
      userEmail: r.userEmail,
      date: `${r.fromDate} → ${r.toDate} (${r.totalDays || 1} Days)`,
      time: `${r.dailyHours || 4}h/day, Daily Start: ${r.startTime || '08:00 AM'}`,
      district: r.district,
      address: r.venueAddress || r.venue || r.address || r.district,
      mainFee: perPanditGross,
      adminFeePercent: percent,
      adminFeeAmount: feeDeduction,
      otherFee: otherFeeAmt,
      amount: payoutAmount,
      bankAccount: (pandit && pandit.bankAccount) || '',
      bankName: (pandit && pandit.bankName) || '',
      ifscCode: (pandit && pandit.ifscCode) || '',
      accountHolder: (pandit && pandit.accountHolder) || (pandit && pandit.name) || '',
      upiId: (pandit && pandit.upiId) || '',
      qrCode: (pandit && pandit.qrCode) || '',
      payoutTxnId: payoutTxn,
      payoutMethod,
      paymentProof: r.paymentProof
    });
  }

  return res.json({ ok: true, request: r });
}

// Dedicated endpoint for Long Puja Request Pandit Payouts
app.post('/api/long-puja-requests/:id/pay-pandit', adminOnly, wrap(async (req, res) => {
  const r = await LongPujaRequest.findOne(longPujaFindQuery(req.params.id));
  if (!r) return res.status(404).json({ error: 'Multi-day ritual request not found' });
  return handleLongPujaPayPandit(r, req, res);
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

  const ceremonyStartDt = parsePujaStartDateTime(date, time);
  const hoursUntilCeremony = (ceremonyStartDt.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntilCeremony < 48) {
    return res.status(400).json({ error: 'Rescheduled ceremony must be scheduled at least 48 hours in advance.' });
  }

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

  const ceremonyStartDt = parsePujaStartDateTime(date, time);
  const hoursUntilCeremony = (ceremonyStartDt.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntilCeremony < 48) {
    return res.status(400).json({ error: 'Ceremony bookings must be scheduled at least 48 hours in advance. Please choose a slot at least 48 hours from now.' });
  }

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

  const pujaDoc = await Puja.findOne({ name: new RegExp('^' + String(b.service).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') });
  const pujaEstimatedFee = (pujaDoc && (pujaDoc.baseFee || Number(String(pujaDoc.price || '').replace(/[^0-9]/g, '')))) || 1199;

  let rawBaseFee = 0;
  if (preferredPandit) {
    rawBaseFee = (preferredPandit.districtPrices && Number(preferredPandit.districtPrices[b.district])) || preferredPandit.fee || Number(req.body && req.body.originalFee ? req.body.originalFee : fee) || pujaEstimatedFee;
  } else if (Number(req.body && req.body.originalFee)) {
    rawBaseFee = Number(req.body.originalFee);
  } else if (Number(fee) > 0) {
    rawBaseFee = Number(fee);
  } else {
    rawBaseFee = pujaEstimatedFee;
  }

  const devoteeUser = await User.findOne({ email: lc(b.userEmail) });
  const devoteeState = (devoteeUser && devoteeUser.state) || b.state || 'Odisha';
  const applicableOffer = await findApplicableOffer({ service: b.service, district: b.district, state: devoteeState, date: b.date });
  const commSetting = await AppSetting.findOne({ key: 'admin_commission_percent' });
  const commPct = commSetting && typeof commSetting.value === 'number' ? commSetting.value : (b.adminFeePercent || DEFAULT_PLATFORM_COMMISSION);

  const feeCalc = calculateFeeWithDiscount(rawBaseFee, applicableOffer, commPct);
  b.fee = feeCalc.finalFee;
  b.originalFee = feeCalc.originalFee;
  b.discountPercent = feeCalc.discountPercent;
  b.discountAmount = feeCalc.discountAmount;
  b.discountOfferId = feeCalc.offerId;
  b.discountOfferTitle = feeCalc.offerTitle;
  b.adminFeePercent = commPct;
  b.adminFeeAmount = feeCalc.adminFeeAmount;
  b.panditNetPayout = feeCalc.panditNetPayout;

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
  if (!b.userEmail || !b.pujaName || !b.district || !b.fromDate || !b.toDate) {
    return res.status(400).json({ error: 'Missing required fields (userEmail, pujaName, district, fromDate, toDate)' });
  }

  // Parse structured Venue of Puja fields
  const venueType = (b.venueType || 'Home / Private Residence').trim();
  const venueName = (b.venueName || '').trim();
  const venueAddress = (b.venueAddress || b.address || b.venue || '').trim();
  const venueLandmark = (b.venueLandmark || '').trim();
  const venuePincode = (b.venuePincode || '').trim();
  const venueFacilities = Array.isArray(b.venueFacilities) ? b.venueFacilities : (typeof b.venueFacilities === 'string' && b.venueFacilities ? [b.venueFacilities] : []);
  const venueNotes = (b.venueNotes || '').trim();
  const startTime = (b.startTime || b.time || '08:00 AM').trim();

  // Formulate compiled venue description for comprehensive display
  const venueParts = [];
  if (venueType) venueParts.push(`[${venueType}]`);
  if (venueName) venueParts.push(venueName);
  if (venueAddress) venueParts.push(venueAddress);
  if (venueLandmark) venueParts.push(`Near ${venueLandmark}`);
  if (b.district) venueParts.push(b.district);
  if (venuePincode) venueParts.push(`PIN: ${venuePincode}`);
  const compiledVenue = venueParts.join(', ') || venueAddress || (b.venue || '').trim();

  if (!compiledVenue || (!venueName && !venueAddress && !(b.venue || '').trim())) {
    return res.status(400).json({ error: 'Venue of Puja is required. Please specify Ceremony Location, Mandap / Building Name, and Address.' });
  }

  if (b.termsAccepted === false) {
    return res.status(400).json({ error: 'You must accept the 48-Hour Advance Notice and Cancellation & Refund Policy terms to request a multi-day ceremony.' });
  }

  // Enforce minimum 48 hours advance notice requirement
  const ceremonyStartDt = parsePujaStartDateTime(b.fromDate, startTime);
  const hoursUntilCeremony = (ceremonyStartDt.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntilCeremony < 48) {
    return res.status(400).json({
      error: 'Multi-day ceremony bookings must be scheduled at least 48 hours in advance to allow verified Vedic Pandits and Acharyas to prepare sacred samagri, rituals, and travel. Please choose a start date at least 48 hours from now.'
    });
  }

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
    pujaName: b.pujaName, district: b.district,
    address: compiledVenue,
    venue: compiledVenue,
    venueType,
    venueName,
    venueAddress,
    venueLandmark,
    venuePincode,
    venueFacilities,
    venueNotes,
    fromDate: b.fromDate, toDate: b.toDate,
    startTime,
    totalDays: days, dailyHours, totalHours, requiredPandits, estimatedCost,
    advancePaid: advanceAmount > 0, advanceAmount,
    termsAccepted: Boolean(b.termsAccepted !== undefined ? b.termsAccepted : true)
  });
  await sendSafe('LONG_PUJA_SUBMITTED', reqDoc.userEmail, reqDoc.toObject());
  if (advanceAmount > 0) await sendSafe('PAYMENT_RECEIPT', reqDoc.userEmail, { userName: reqDoc.userName, reference: reqDoc.id, service: reqDoc.pujaName, total: estimatedCost, advanceAmount });
  res.status(201).json(reqDoc);
}));

// Fetch single multi-day ceremony request
app.get('/api/long-puja-requests/:id', wrap(async (req, res) => {
  const query = mongoose.Types.ObjectId.isValid(req.params.id)
    ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
    : { id: req.params.id };
  const r = await LongPujaRequest.findOne(query);
  if (!r) return res.status(404).json({ error: 'Multi-day ritual request not found' });
  res.json(r);
}));

// Multi-day Cancellation Preview (Devotee or Admin)
app.get('/api/long-puja-requests/:id/cancellation-preview', wrap(async (req, res) => {
  const r = await LongPujaRequest.findOne({ id: req.params.id });
  if (!r) return res.status(404).json({ error: 'Multi-day request not found' });

  const ceremonyStartDt = parsePujaStartDateTime(r.fromDate, r.startTime || '08:00 AM');
  const now = new Date();
  const diffMs = ceremonyStartDt.getTime() - now.getTime();
  const rawHours = diffMs / (1000 * 60 * 60);
  const hoursBefore = Math.round(rawHours * 10) / 10;
  const cancelledBy = req.query.cancelledBy === 'admin' ? 'admin' : 'devotee';

  let tier = '', tierLabel = '', refundPercent = 0, cancellationFeePercent = 0;
  if (cancelledBy === 'admin') {
    tier = 'platform_cancelled';
    tierLabel = 'Cancelled by Platform / Pandit (100% Full Refund Guarantee)';
    refundPercent = 100;
    cancellationFeePercent = 0;
  } else if (hoursBefore >= 18) {
    tier = 'more_than_18h';
    tierLabel = 'More than 18 hours before ceremony (100% Full Refund / ₹0 Fee)';
    refundPercent = 100;
    cancellationFeePercent = 0;
  } else if (hoursBefore >= 1 && hoursBefore < 18) {
    tier = '18h_to_1h';
    tierLabel = 'Between 18 hours and 1 hour before ceremony (40% Refund, 60% Fee)';
    refundPercent = 40;
    cancellationFeePercent = 60;
  } else {
    tier = 'less_than_1h';
    tierLabel = 'Less than 1 hour before ceremony (Non-refundable / 100% Retained Fee)';
    refundPercent = 0;
    cancellationFeePercent = 100;
  }

  const adv = Number(r.advanceAmount) || 0;
  const baseAmount = (r.advancePaid && adv > 0) ? adv : (Number(r.estimatedCost) || 0);
  const refundAmount = (r.advancePaid && adv > 0) ? Math.round((adv * refundPercent) / 100) : 0;
  const cancellationFee = (r.advancePaid && adv > 0) ? (adv - refundAmount) : 0;

  const devoteeUser = await User.findOne({ email: lc(r.userEmail) }).lean();
  const rPayout = r.refundAccountDetails || {};

  res.json({
    ok: true,
    id: r.id,
    pujaName: r.pujaName,
    fromDate: r.fromDate,
    toDate: r.toDate,
    startTime: r.startTime || '08:00 AM',
    totalDays: r.totalDays,
    dailyHours: r.dailyHours,
    venue: r.venue || r.address || '',
    venueType: r.venueType || 'Home / Private Residence',
    venueName: r.venueName || '',
    venueAddress: r.venueAddress || '',
    venueLandmark: r.venueLandmark || '',
    district: r.district,
    status: r.status,
    advancePaid: r.advancePaid,
    advanceAmount: adv,
    estimatedCost: r.estimatedCost,
    terms: {
      cancelledBy,
      hoursBefore,
      tier,
      tierLabel,
      refundPercent,
      cancellationFeePercent,
      refundAmount,
      cancellationFee,
      isPaid: Boolean(r.advancePaid && adv > 0)
    },
    userPayoutDetails: {
      upiId: (devoteeUser && devoteeUser.upiId) || rPayout.upiId || '',
      bankAccount: (devoteeUser && devoteeUser.bankAccount) || rPayout.bankAccount || '',
      ifscCode: (devoteeUser && devoteeUser.ifscCode) || rPayout.ifscCode || '',
      accountHolder: (devoteeUser && devoteeUser.accountHolder) || rPayout.accountHolder || r.userName || '',
      bankName: (devoteeUser && devoteeUser.bankName) || rPayout.bankName || ''
    }
  });
}));

app.post('/api/long-puja-requests/:id/cancel', wrap(async (req, res) => {
  const r = await LongPujaRequest.findOne({ id: req.params.id });
  if (!r) return res.status(404).json({ error: 'Multi-day request not found' });
  if (r.status === 'Cancelled') return res.status(400).json({ error: 'This ceremony request has already been cancelled' });
  if (r.status === 'Completed') return res.status(400).json({ error: 'Completed multi-day ceremonies cannot be cancelled' });

  const ceremonyStartDt = parsePujaStartDateTime(r.fromDate, r.startTime || '08:00 AM');
  const hoursUntilCeremony = (ceremonyStartDt.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntilCeremony < 1) {
    return res.status(400).json({ error: 'Ceremonies cannot be cancelled less than 1 hour before scheduled start time.' });
  }

  const reason = (req.body && req.body.reason ? String(req.body.reason) : 'Cancelled by devotee').trim();
  const cancelledBy = (req.body && req.body.cancelledBy) || 'devotee';

  let refundPercent = 0;
  if (cancelledBy === 'admin' || cancelledBy === 'pandit') {
    refundPercent = 100;
  } else if (hoursUntilCeremony >= 18) {
    refundPercent = 100;
  } else {
    refundPercent = 40;
  }

  const adv = Number(r.advanceAmount) || 0;
  const refundAmount = (r.advancePaid && adv > 0) ? Math.round((adv * refundPercent) / 100) : 0;
  const refundStatus = refundAmount > 0 ? 'Pending Refund' : 'N/A';

  // Save refund payout details
  const payout = (req.body && req.body.refundAccountDetails) || {};
  if (payout && (payout.upiId || payout.bankAccount)) {
    r.refundAccountDetails = {
      upiId: String(payout.upiId || '').trim(),
      bankAccount: String(payout.bankAccount || '').trim(),
      ifscCode: String(payout.ifscCode || '').trim().toUpperCase(),
      accountHolder: String(payout.accountHolder || '').trim(),
      bankName: String(payout.bankName || '').trim()
    };
    // Also save to devotee user profile for future use
    const devoteeUser = await User.findOne({ email: lc(r.userEmail) });
    if (devoteeUser) {
      if (payout.upiId) devoteeUser.upiId = String(payout.upiId).trim();
      if (payout.bankAccount) devoteeUser.bankAccount = String(payout.bankAccount).trim();
      if (payout.ifscCode) devoteeUser.ifscCode = String(payout.ifscCode).trim().toUpperCase();
      if (payout.accountHolder) devoteeUser.accountHolder = String(payout.accountHolder).trim();
      if (payout.bankName) devoteeUser.bankName = String(payout.bankName).trim();
      await devoteeUser.save();
    }
  }

  r.status = 'Cancelled';
  r.cancelledBy = cancelledBy;
  r.cancelledAt = new Date();
  r.cancellationReason = reason;
  r.refundEligiblePercent = refundPercent;
  r.refundAmount = refundAmount;
  r.refundStatus = refundStatus;
  await r.save();

  await sendSafe('LONG_PUJA_CANCELLED', r.userEmail, {
    ...r.toObject(),
    refundPercent,
    refundAmount
  });

  res.json({
    ok: true,
    request: r,
    message: `Multi-day ceremony request ${r.id} cancelled. ${refundAmount > 0 ? `Refund of ₹${refundAmount} will be processed to your account within 24 hours.` : 'No payment deductions incurred.'}`
  });
}));

app.put('/api/long-puja-requests/:id/assign', adminOnly, wrap(async (req, res) => {
  const emails = (req.body.panditEmails || req.body.assignedPandits || []).map(lc);
  if (!emails.length) return res.status(400).json({ error: 'Select at least one Pandit' });
  const found = await Pandit.find({ email: { $in: emails }, verified: true });
  if (found.length !== emails.length) return res.status(400).json({ error: 'All assigned Pandits must be verified' });
  const statuses = {};
  emails.forEach((e) => { statuses[e] = 'Assigned'; });

  const query = mongoose.Types.ObjectId.isValid(req.params.id)
    ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
    : { id: req.params.id };

  const existingRequest = await LongPujaRequest.findOne(query);
  if (!existingRequest) return res.status(404).json({ error: 'Request not found' });

  // Verify availability on ceremony start date
  for (const pandit of found) {
    const avail = isPanditAvailableOnDate(pandit, existingRequest.fromDate);
    if (!avail.available) {
      return res.status(400).json({ error: `Pandit ${pandit.name} is not available on ceremony date ${existingRequest.fromDate} (${avail.reason}). Please select another Pandit.` });
    }
  }

  const r = await LongPujaRequest.findOneAndUpdate(
    query,
    { assignedPandits: emails, panditStatuses: statuses, status: 'Assigned', rejectionReason: '' },
    { new: true }
  );
  if (!r) return res.status(404).json({ error: 'Request not found' });

  // Compute robust origin base URL
  const reqHost = req.get('host') || '';
  const reqProto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : (req.protocol || 'http'));
  const origin = req.headers.origin || (reqHost ? `${reqProto}://${reqHost}` : 'https://pujaconnect-one.vercel.app');
  const baseUrl = process.env.APP_URL || origin;

  // Send assignment offer notification email to each assigned Pandit with direct Accept/Reject action links
  for (const pandit of found) {
    const pEmail = lc(pandit.email);
    const panditToken = sign({ email: pEmail, role: 'pandit', requestId: r.id, purpose: 'long_puja_offer_response' });
    const acceptUrl = `${baseUrl}/api/long-puja-requests/${encodeURIComponent(r.id)}/email-response?email=${encodeURIComponent(pEmail)}&response=Accepted&token=${encodeURIComponent(panditToken)}`;
    const rejectUrl = `${baseUrl}/api/long-puja-requests/${encodeURIComponent(r.id)}/email-response?email=${encodeURIComponent(pEmail)}&response=Rejected&token=${encodeURIComponent(panditToken)}`;
    const dashboardUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(r.id)}&email=${encodeURIComponent(pEmail)}&token=${encodeURIComponent(panditToken)}&tab=long#dashboard`;

    await sendSafe('LONG_PUJA_ASSIGNED_PANDIT', pEmail, {
      ...r.toObject(),
      baseUrl,
      acceptUrl,
      rejectUrl,
      dashboardUrl,
      panditName: pandit.name,
      panditEmail: pEmail,
      panditPhone: pandit.phone || ''
    });
  }

  res.json(r);
}));

// Direct response handler for clicks from Pandit assignment email
app.get('/api/long-puja-requests/:id/email-response', wrap(async (req, res) => {
  const panditEmail = lc(req.query.email || req.query.panditEmail || '');
  const response = (req.query.response || req.query.decision || '').trim();
  const isAccept = response.toLowerCase() === 'accepted' || response.toLowerCase() === 'accept';
  const isReject = response.toLowerCase() === 'rejected' || response.toLowerCase() === 'reject' || response.toLowerCase() === 'declined' || response.toLowerCase() === 'decline';

  const query = mongoose.Types.ObjectId.isValid(req.params.id)
    ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
    : { id: req.params.id };

  const r = await LongPujaRequest.findOne(query);
  if (!r) {
    return res.status(404).send('<h2>Ceremony request not found or expired.</h2>');
  }

  const pandit = panditEmail ? await Pandit.findOne({ email: panditEmail }) : null;
  const panditName = pandit ? pandit.name : 'Vedic Pandit';
  const panditPhone = pandit ? (pandit.phone || '') : '';
  const statuses = { ...(r.panditStatuses || {}) };

  const reqHost = req.get('host') || '';
  const reqProto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : (req.protocol || 'http'));
  const origin = req.headers.origin || (reqHost ? `${reqProto}://${reqHost}` : 'https://pujaconnect-one.vercel.app');
  const baseUrl = process.env.APP_URL || origin;

  // Sign persistent auth token for the Pandit so clicking Dashboard logs them in immediately
  const effectiveEmail = panditEmail || (pandit && pandit.email) || '';
  const panditAuthToken = sign({ email: effectiveEmail, role: 'pandit', name: panditName });
  const dashboardUrl = `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(r.id)}&email=${encodeURIComponent(effectiveEmail)}&token=${encodeURIComponent(panditAuthToken)}&tab=long#dashboard`;

  if (isAccept) {
    statuses[panditEmail || 'pandit'] = 'Accepted';
    r.panditStatuses = statuses;
    r.status = 'Confirmed';
    r.markModified('panditStatuses');
    await r.save();

    // Send official confirmation email to Devotee!
    if (r.userEmail) {
      try {
        await sendSafe('LONG_PUJA_CONFIRMED', lc(r.userEmail), {
          ...r.toObject(),
          panditName,
          panditPhone,
          appUrl: baseUrl
        });
      } catch (mailErr) {
        console.error('Devotee confirmation email error:', mailErr);
      }
    }

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ceremony Assignment Accepted – PujaConnect</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="refresh" content="3;url=${esc(dashboardUrl)}">
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #fff8ed; color: #351605; margin: 0; padding: 40px 20px; display: flex; align-items: center; justify-content: center; min-height: 80vh; }
          .card { background: #ffffff; max-width: 560px; width: 100%; border-radius: 16px; border: 2px solid #2e7d32; padding: 36px 30px; text-align: center; box-shadow: 0 10px 30px rgba(46,125,50,0.12); }
          .icon { width: 64px; height: 64px; border-radius: 50%; background: #2e7d32; color: #ffffff; font-size: 36px; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
          h1 { font-family: Georgia, serif; color: #1b5e20; margin: 0 0 12px; font-size: 24px; }
          p { font-size: 14.5px; color: #4a2b16; line-height: 1.6; margin: 0 0 18px; }
          .box { background: #f0fff4; border: 1.5px solid #a5d6a7; padding: 14px 16px; border-radius: 10px; font-size: 13.5px; color: #1b5e20; margin-bottom: 22px; text-align: left; line-height: 1.6; }
          .btn { display: inline-block; background: #d99a19; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; box-shadow: 0 4px 14px rgba(217,154,25,0.35); }
          .btn:hover { background: #b87c0a; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">✓</div>
          <h1>Pranam ${esc(panditName)} 🙏</h1>
          <p>You have successfully <strong>Accepted</strong> the sacred multi-day ceremony assignment for <strong>${esc(r.pujaName)}</strong> (Request ID: <strong>${esc(r.id)}</strong>).</p>
          <div class="box">
            ✅ <strong>Devotee Confirmation Dispatched:</strong> An official confirmation email with your contact details (📞 ${esc(panditPhone || 'Registered Phone')}) has been sent to devotee <strong>${esc(r.userName)}</strong> (${esc(r.userEmail)}).<br>
            🏛️ <strong>Puja Venue:</strong> ${esc(r.venueAddress || r.venue || r.address || 'Address provided by devotee')}<br>
            📅 <strong>Dates:</strong> ${esc(r.fromDate)} → ${esc(r.toDate)} (${r.totalDays || 1} days, Daily Start: ${esc(r.startTime || '08:00 AM')})
          </div>
          <a href="${esc(dashboardUrl)}" class="btn">👉 Open Pandit Dashboard</a>
          <p style="font-size:12.5px;color:#7a553e;margin-top:16px">Redirecting to your Pandit Dashboard in 3 seconds... <a href="${esc(dashboardUrl)}" style="color:#d99a19;font-weight:700">Click here to open now</a></p>
        </div>
      </body>
      </html>
    `);
  } else if (isReject) {
    statuses[panditEmail || 'pandit'] = 'Rejected';
    r.panditStatuses = statuses;
    r.status = 'Rejected';
    r.rejectionReason = `Declined by Pandit ${panditName} (${panditEmail || 'pandit'})`;
    r.markModified('panditStatuses');
    await r.save();

    // Alert Admin so immediate reassignment can be performed
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SENDER_EMAIL || 'bookpujaconnect@gmail.com';
      await sendSafe('LONG_PUJA_PANDIT_REJECTED_ALERT', adminEmail, {
        ...r.toObject(),
        panditName,
        panditEmail,
        panditPhone,
        baseUrl
      });
    } catch (mailErr) {
      console.error('Admin rejection alert email error:', mailErr);
    }

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ceremony Assignment Declined – PujaConnect</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="refresh" content="3;url=${esc(dashboardUrl)}">
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #fff8ed; color: #351605; margin: 0; padding: 40px 20px; display: flex; align-items: center; justify-content: center; min-height: 80vh; }
          .card { background: #ffffff; max-width: 560px; width: 100%; border-radius: 16px; border: 2px solid #c62828; padding: 36px 30px; text-align: center; box-shadow: 0 10px 30px rgba(198,40,40,0.12); }
          .icon { width: 64px; height: 64px; border-radius: 50%; background: #c62828; color: #ffffff; font-size: 36px; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
          h1 { font-family: Georgia, serif; color: #c62828; margin: 0 0 12px; font-size: 24px; }
          p { font-size: 14.5px; color: #4a2b16; line-height: 1.6; margin: 0 0 18px; }
          .box { background: #ffebee; border: 1.5px solid #ef9a9a; padding: 14px 16px; border-radius: 10px; font-size: 13.5px; color: #b71c1c; margin-bottom: 22px; text-align: left; line-height: 1.6; }
          .btn { display: inline-block; background: #351605; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; }
          .btn:hover { background: #522208; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">✕</div>
          <h1>Assignment Declined</h1>
          <p>Pranam ${esc(panditName)}, you have declined the ceremony assignment for <strong>${esc(r.pujaName)}</strong> (Request ID: <strong>${esc(r.id)}</strong>).</p>
          <div class="box">
            ⚠️ <strong>Admin Dashboard Updated:</strong> The request status is marked as <strong>Rejected</strong> on the PujaConnect Administration dashboard so another qualified Vedic Pandit can be assigned promptly without delay.
          </div>
          <a href="${esc(dashboardUrl)}" class="btn">👉 Return to Pandit Dashboard</a>
          <p style="font-size:12.5px;color:#7a553e;margin-top:16px">Redirecting to your Pandit Dashboard in 3 seconds... <a href="${esc(dashboardUrl)}" style="color:#d99a19;font-weight:700">Click here to open now</a></p>
        </div>
      </body>
      </html>
    `);
  }

  res.redirect(dashboardUrl);
}));

app.put('/api/long-puja-requests/:id/pandit-response', wrap(async (req, res) => {
  const { panditEmail, response } = req.body; // 'Accepted' | 'Declined' | 'Rejected'
  const isAccept = response === 'Accepted' || response === 'Accept';
  const isReject = response === 'Declined' || response === 'Decline' || response === 'Rejected' || response === 'Reject';

  const query = mongoose.Types.ObjectId.isValid(req.params.id)
    ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
    : { id: req.params.id };

  const r = await LongPujaRequest.findOne(query);
  if (!r) return res.status(404).json({ error: 'Request not found' });

  const pEmail = lc(panditEmail);
  const pandit = await Pandit.findOne({ email: pEmail });
  const panditName = pandit ? pandit.name : 'Verified Pandit';
  const panditPhone = pandit ? (pandit.phone || '') : '';

  const statuses = { ...(r.panditStatuses || {}) };
  statuses[pEmail] = isAccept ? 'Accepted' : 'Rejected';
  r.panditStatuses = statuses;
  r.markModified('panditStatuses');

  const reqHost = req.get('host') || '';
  const reqProto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : (req.protocol || 'http'));
  const origin = req.headers.origin || (reqHost ? `${reqProto}://${reqHost}` : 'https://pujaconnect-one.vercel.app');
  const baseUrl = process.env.APP_URL || origin;

  if (isAccept) {
    r.status = 'Confirmed';
    await r.save();

    // Send official confirmation email to Devotee!
    if (r.userEmail) {
      await sendSafe('LONG_PUJA_CONFIRMED', lc(r.userEmail), {
        ...r.toObject(),
        panditName,
        panditPhone,
        appUrl: baseUrl
      });
    }
  } else if (isReject) {
    // Rejected: mark status as Rejected so admin dashboard highlights it immediately
    r.status = 'Rejected';
    r.rejectionReason = `Declined by Pandit ${panditName} (${pEmail})`;
    await r.save();

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SENDER_EMAIL || 'bookpujaconnect@gmail.com';
    await sendSafe('LONG_PUJA_PANDIT_REJECTED_ALERT', adminEmail, {
      ...r.toObject(),
      panditName,
      panditEmail: pEmail,
      panditPhone,
      baseUrl
    });
  } else {
    await r.save();
  }

  res.json(r);
}));

app.put('/api/long-puja-requests/:id/status', wrap(async (req, res) => {
  const r = await LongPujaRequest.findOneAndUpdate({ id: req.params.id }, { status: req.body.status }, { new: true });
  if (!r) return res.status(404).json({ error: 'Request not found' });
  res.json(r);
}));

app.post('/api/long-puja-requests/:id/submit-payment', wrap(async (req, res) => {
  const { paymentProof, paymentMethod, amount } = req.body;
  if (!paymentProof) return res.status(400).json({ error: 'Payment Transaction UTR / Ref ID is required' });

  const query = mongoose.Types.ObjectId.isValid(req.params.id)
    ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
    : { id: req.params.id };

  const r = await LongPujaRequest.findOne(query);
  if (!r) return res.status(404).json({ error: 'Multi-day ritual request not found' });

  if (r.status === 'Cancelled' || r.status === 'Rejected' || r.status === 'Declined') {
    return res.status(400).json({ error: 'Cannot submit Dakshina for a cancelled ceremony request.' });
  }

  r.paymentStatus = 'Under Processing';
  r.paymentProof = String(paymentProof).trim();
  r.paymentMethod = paymentMethod || 'UPI/Bank Transfer';
  r.paymentDate = new Date();
  r.advanceAmount = Number(amount) || r.estimatedCost || 0;
  r.advancePaid = false;
  r.paymentRejectionReason = '';
  await r.save();

  // Send admin notification
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SENDER_EMAIL || 'bookpujaconnect@gmail.com';
    await sendSafe('NEW_BOOKING_ADMIN_ALERT', adminEmail, {
      ...r.toObject(),
      service: `${r.pujaName} (Multi-Day Ceremony Dakshina Submitted)`,
      fee: r.estimatedCost,
      date: `${r.fromDate} → ${r.toDate} (${r.totalDays || 1} Days)`,
      paymentProof: r.paymentProof
    });
  } catch (mailErr) {}

  res.json({
    ok: true,
    request: r,
    message: 'Dakshina payment submitted successfully! Your payment is under processing and awaiting Admin verification.'
  });
}));

app.post('/api/long-puja-requests/:id/verify-payment', wrap(async (req, res) => {
  const query = mongoose.Types.ObjectId.isValid(req.params.id)
    ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
    : { id: req.params.id };

  const r = await LongPujaRequest.findOne(query);
  if (!r) return res.status(404).json({ error: 'Multi-day ritual request not found' });

  r.paymentStatus = 'Paid & Verified';
  r.advancePaid = true;
  r.advanceAmount = r.estimatedCost || r.advanceAmount;
  r.paymentRejectionReason = '';
  if (!r.invoiceId) {
    r.invoiceId = 'INV-' + String(r.id).replace(/[^a-zA-Z0-9]/g, '') + '-9901';
  }
  if (!r.invoiceGeneratedAt) {
    r.invoiceGeneratedAt = new Date();
  }

  // Calculate platform admin fee, other fee, and initialize assigned pandit payouts
  const commSetting = await AppSetting.findOne({ key: 'commission_percent' });
  const commPct = (commSetting && typeof commSetting.value === 'number') ? commSetting.value : (r.adminFeePercent || 10);
  r.adminFeePercent = commPct;

  const teamSize = Math.max(1, Number(r.requiredPandits) || (r.assignedPandits && r.assignedPandits.length) || 1);
  const totalCost = Number(r.estimatedCost) || 0;
  const perPanditGross = Math.round(totalCost / teamSize);
  const perPanditAdminCut = Math.round((perPanditGross * commPct) / 100);
  const otherFeeAmt = Number(r.otherFee || 0);
  const perPanditNet = Math.max(0, perPanditGross - perPanditAdminCut - otherFeeAmt);

  r.adminFeeAmount = perPanditAdminCut * teamSize;
  r.otherFee = otherFeeAmt;
  r.panditNetPayout = perPanditNet;
  r.paymentType = r.paymentMethod === 'Cash Paid to Pandit' ? 'pandit_gives_admin_fee' : 'admin_transfer';

  r.panditPayouts = r.panditPayouts || {};
  if (Array.isArray(r.assignedPandits) && r.assignedPandits.length > 0) {
    for (const pEmail of r.assignedPandits) {
      const e = lc(pEmail);
      if (!r.panditPayouts[e]) {
        const pObj = await Pandit.findOne({ email: e });
        r.panditPayouts[e] = {
          panditEmail: e,
          panditName: pObj ? pObj.name : e,
          payoutStatus: 'Pending',
          grossFee: perPanditGross,
          adminFeePercent: commPct,
          adminFeeAmount: perPanditAdminCut,
          otherFee: otherFeeAmt,
          netPayout: perPanditNet,
          paymentType: r.paymentType
        };
      }
    }
  }
  r.markModified('panditPayouts');
  await r.save();

  // Send official payment receipt email to devotee
  if (r.userEmail) {
    try {
      await sendSafe('PAYMENT_RECEIPT', lc(r.userEmail), {
        bookingId: r.id,
        reference: r.id,
        invoiceId: r.invoiceId,
        service: r.pujaName,
        userName: r.userName,
        userPhone: r.phone || '',
        userEmail: r.userEmail,
        panditName: (r.assignedPandits && r.assignedPandits.length) ? r.assignedPandits.join(', ') : 'Vedic Purohit Team',
        date: `${r.fromDate} → ${r.toDate} (${r.totalDays || 1} Days)`,
        time: `${r.dailyHours || 4}h/day, Daily Start: ${r.startTime || '08:00 AM'}`,
        district: r.district,
        address: r.venueAddress || r.address || r.venue || r.district,
        total: r.estimatedCost,
        amount: r.estimatedCost,
        paymentProof: r.paymentProof,
        paymentMethod: r.paymentMethod
      });
    } catch (e) {
      console.warn('Devotee long puja payment receipt email error:', e);
    }
  }

  res.json({ ok: true, request: r, message: 'Multi-day ceremony payment verified successfully.' });
}));

app.post('/api/long-puja-requests/:id/reject-payment', wrap(async (req, res) => {
  const query = mongoose.Types.ObjectId.isValid(req.params.id)
    ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
    : { id: req.params.id };

  const r = await LongPujaRequest.findOne(query);
  if (!r) return res.status(404).json({ error: 'Multi-day ritual request not found' });

  const reason = req.body.reason || 'Transaction reference not found in bank records. Please submit valid UTR.';
  r.paymentStatus = 'Rejected';
  r.paymentRejectionReason = reason;
  await r.save();

  // Send notification to devotee
  if (r.userEmail) {
    try {
      await sendSafe('PAYMENT_REJECTED', lc(r.userEmail), {
        bookingId: r.id,
        service: r.pujaName,
        userName: r.userName,
        amount: r.estimatedCost,
        rejectionReason: reason
      });
    } catch (e) {}
  }

  res.json({ ok: true, request: r, message: 'Payment rejected.' });
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

// ==========================================
// ---- Media Section & Festive Offers Engine ----
// ==========================================

// 1. Devotees Directory organized State-wise and District-wise
app.get('/api/admin/media/devotees', adminOnly, wrap(async (req, res) => {
  const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 }).lean();
  const grouped = {};
  let totalDevotees = 0;

  users.forEach(u => {
    totalDevotees++;
    const st = (u.state || 'Odisha').trim() || 'Odisha';
    const dist = (u.district || u.city || 'Unspecified').trim() || 'Unspecified';
    if (!grouped[st]) {
      grouped[st] = {
        state: st,
        count: 0,
        districts: {}
      };
    }
    grouped[st].count++;
    if (!grouped[st].districts[dist]) {
      grouped[st].districts[dist] = [];
    }
    grouped[st].districts[dist].push({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      state: st,
      district: dist,
      city: u.city || '',
      status: u.status || 'Active',
      createdAt: u.createdAt
    });
  });

  res.json({
    ok: true,
    totalDevotees,
    totalStates: Object.keys(grouped).length,
    states: grouped
  });
}));

// 2. Media Offers: List
app.get('/api/media/offers', wrap(async (req, res) => {
  const nowStr = new Date().toISOString().split('T')[0];
  // Auto-expire past offers
  await MediaOffer.updateMany(
    { status: 'Active', endDate: { $lt: nowStr } },
    { $set: { status: 'Expired' } }
  ).catch(() => {});

  const offers = await MediaOffer.find().sort({ createdAt: -1 }).lean();
  res.json(offers);
}));

// Query applicable offer for specific ceremony service, district, state, and date
app.get('/api/media/applicable-offer', wrap(async (req, res) => {
  const { service, district, state, date } = req.query;
  const offer = await findApplicableOffer({ service, district, state, date });
  res.json({ ok: true, offer });
}));

// 3. Media Offers: Create Offer (with optional direct broadcast email)
app.post('/api/admin/media/offers', adminOnly, wrap(async (req, res) => {
  const { title, description, pujaName, discountPercent, startDate, endDate, targetState, targetDistricts, bannerImage, sendMailToAll } = req.body;
  if (!title || !discountPercent || !startDate || !endDate) {
    return res.status(400).json({ error: 'Title, discount percent, start date, and end date are required.' });
  }

  const dPct = Math.max(1, Math.min(100, Number(discountPercent)));
  const offerId = await uniqueId(MediaOffer, 'offerId', 'OFFER');
  const nowStr = new Date().toISOString().split('T')[0];
  const isExpired = endDate < nowStr;

  const targetDistList = Array.isArray(targetDistricts) && targetDistricts.length ? targetDistricts : ['ALL'];
  const offer = await MediaOffer.create({
    offerId,
    title: String(title).trim(),
    description: String(description || '').trim(),
    pujaName: String(pujaName || 'ALL').trim(),
    discountPercent: dPct,
    startDate: String(startDate).trim(),
    endDate: String(endDate).trim(),
    targetState: String(targetState || 'ALL').trim(),
    targetDistricts: targetDistList,
    bannerImage: String(bannerImage || '').trim(),
    status: isExpired ? 'Expired' : 'Active',
    emailsSentCount: 0
  });

  let emailsSent = 0;
  if (sendMailToAll && !isExpired) {
    const q = { role: { $ne: 'admin' }, status: { $ne: 'Revoked' } };
    if (offer.targetState && offer.targetState !== 'ALL') {
      q.state = new RegExp('^' + offer.targetState.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
    }
    if (offer.targetDistricts && offer.targetDistricts.length && !offer.targetDistricts.includes('ALL')) {
      q.district = { $in: offer.targetDistricts.map(d => new RegExp('^' + d.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i')) };
    }
    const devotees = await User.find(q).lean();
    for (const dev of devotees) {
      if (!dev.email) continue;
      try {
        await sendSafe('MEDIA_PUJA_OFFER', dev.email, {
          ...offer.toObject(),
          userName: dev.name || 'Devotee',
          userEmail: dev.email
        });
        emailsSent++;
      } catch (e) {
        console.error(`[Media Offer Email Error to ${dev.email}]:`, e.message);
      }
    }
    offer.emailsSentCount = emailsSent;
    offer.emailsSentAt = new Date();
    await offer.save();
  }

  res.status(201).json({
    ok: true,
    offer,
    emailsSent,
    message: `Festive offer "${offer.title}" created successfully${sendMailToAll ? ` and emailed to ${emailsSent} devotees.` : '.'}`
  });
}));

// 4. Media Offers: Delete (Admin can remove any time)
app.delete('/api/admin/media/offers/:id', adminOnly, wrap(async (req, res) => {
  const rawId = req.params.id ? decodeURIComponent(req.params.id).trim() : '';
  const q = mongoose.Types.ObjectId.isValid(rawId)
    ? { $or: [{ offerId: rawId }, { _id: rawId }] }
    : { offerId: rawId };
  const offer = await MediaOffer.findOneAndDelete(q);
  if (!offer) return res.status(404).json({ error: 'Festive offer not found' });
  res.json({ ok: true, deletedId: offer.offerId, message: 'Festive offer successfully removed.' });
}));

// 5. Media Offers: Toggle status
app.put('/api/admin/media/offers/:id/status', adminOnly, wrap(async (req, res) => {
  const { status } = req.body;
  if (!['Active', 'Disabled', 'Expired'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const rawId = req.params.id ? decodeURIComponent(req.params.id).trim() : '';
  const q = mongoose.Types.ObjectId.isValid(rawId)
    ? { $or: [{ offerId: rawId }, { _id: rawId }] }
    : { offerId: rawId };
  const offer = await MediaOffer.findOneAndUpdate(q, { status }, { new: true });
  if (!offer) return res.status(404).json({ error: 'Festive offer not found' });

  // When admin activates an offer, auto-apply the discount to existing pending unpaid bookings in matching district/puja
  if (status === 'Active') {
    try {
      const bQuery = { paymentStatus: 'Pending', fee: { $gt: 0 } };
      if (offer.pujaName && offer.pujaName.trim().toLowerCase() !== 'all') {
        bQuery.service = new RegExp('^' + offer.pujaName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
      }
      const distList = (Array.isArray(offer.targetDistricts) ? offer.targetDistricts : [offer.targetDistricts || 'ALL'])
        .flatMap(d => String(d).split(','))
        .map(d => d.trim())
        .filter(d => Boolean(d) && d.toLowerCase() !== 'all');
      if (distList.length > 0) {
        bQuery.district = { $in: distList.map(d => new RegExp('^' + d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i')) };
      }

      const matchingBookings = await Booking.find(bQuery);
      const commSetting = await AppSetting.findOne({ key: 'admin_commission_percent' });
      for (const b of matchingBookings) {
        const commPct = commSetting && typeof commSetting.value === 'number' ? commSetting.value : (b.adminFeePercent || DEFAULT_PLATFORM_COMMISSION);
        const base = b.originalFee > 0 ? b.originalFee : b.fee;
        const feeCalc = calculateFeeWithDiscount(base, offer, commPct);
        b.fee = feeCalc.finalFee;
        b.originalFee = feeCalc.originalFee;
        b.discountPercent = feeCalc.discountPercent;
        b.discountAmount = feeCalc.discountAmount;
        b.discountOfferId = feeCalc.offerId;
        b.discountOfferTitle = feeCalc.offerTitle;
        b.adminFeePercent = commPct;
        b.adminFeeAmount = feeCalc.adminFeeAmount;
        b.panditNetPayout = feeCalc.panditNetPayout;
        await b.save().catch(() => {});
      }
    } catch (e) {
      console.error('[Auto-apply active offer to pending bookings error]:', e.message);
    }
  }

  res.json({ ok: true, offer });
}));

// 6. Media Offers: Broadcast / Send Email to target devotees
app.post('/api/admin/media/offers/:id/send-email', adminOnly, wrap(async (req, res) => {
  const rawId = req.params.id ? decodeURIComponent(req.params.id).trim() : '';
  const q = mongoose.Types.ObjectId.isValid(rawId)
    ? { $or: [{ offerId: rawId }, { _id: rawId }] }
    : { offerId: rawId };
  const offer = await MediaOffer.findOne(q);
  if (!offer) return res.status(404).json({ error: 'Festive offer not found' });

  const query = { role: { $ne: 'admin' }, status: { $ne: 'Revoked' } };
  if (offer.targetState && offer.targetState !== 'ALL') {
    query.state = new RegExp('^' + offer.targetState.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
  }
  if (offer.targetDistricts && offer.targetDistricts.length && !offer.targetDistricts.includes('ALL')) {
    query.district = { $in: offer.targetDistricts.map(d => new RegExp('^' + d.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i')) };
  }
  const devotees = await User.find(query).lean();
  let sentCount = 0;
  for (const dev of devotees) {
    if (!dev.email) continue;
    try {
      await sendSafe('MEDIA_PUJA_OFFER', dev.email, {
        ...offer.toObject(),
        userName: dev.name || 'Devotee',
        userEmail: dev.email
      });
      sentCount++;
    } catch (e) {
      console.error(`[Resend Offer Email Error to ${dev.email}]:`, e.message);
    }
  }

  offer.emailsSentCount = (offer.emailsSentCount || 0) + sentCount;
  offer.emailsSentAt = new Date();
  await offer.save();

  res.json({
    ok: true,
    sentCount,
    totalTargeted: devotees.length,
    message: `Offer broadcast sent to ${sentCount} devotees in ${offer.targetState || 'All States'}.`
  });
}));

// 7. Media Announcements: List
app.get('/api/media/announcements', wrap(async (req, res) => {
  const nowStr = new Date().toISOString().split('T')[0];
  // Auto-expire past announcements
  await MediaAnnouncement.updateMany(
    { status: 'Active', endDate: { $lt: nowStr } },
    { $set: { status: 'Expired' } }
  ).catch(() => {});

  const filter = {};
  if (req.query.audienceType) {
    filter.audienceType = req.query.audienceType;
  }
  const list = await MediaAnnouncement.find(filter).sort({ createdAt: -1 }).lean();
  res.json(list);
}));

// 8. Media Announcements: Create (with optional direct broadcast email)
app.post('/api/admin/media/announcements', adminOnly, wrap(async (req, res) => {
  const { title, content, audienceType, targetState, targetDistricts, bannerImage, startDate, endDate, sendMailToAll } = req.body;
  if (!title || !content || !audienceType) {
    return res.status(400).json({ error: 'Title, content, and audience type (user/pandit) are required.' });
  }

  const annId = await uniqueId(MediaAnnouncement, 'announcementId', 'ANN');
  const nowStr = new Date().toISOString().split('T')[0];
  const sDate = startDate || nowStr;
  const eDate = endDate || '2099-12-31';
  const isExpired = eDate < nowStr;

  const targetDistList = Array.isArray(targetDistricts) && targetDistricts.length ? targetDistricts : ['ALL'];
  const announcement = await MediaAnnouncement.create({
    announcementId: annId,
    title: String(title).trim(),
    content: String(content).trim(),
    audienceType: audienceType === 'pandit' ? 'pandit' : 'user',
    targetState: String(targetState || 'ALL').trim(),
    targetDistricts: targetDistList,
    bannerImage: String(bannerImage || '').trim(),
    startDate: sDate,
    endDate: eDate,
    status: isExpired ? 'Expired' : 'Active',
    emailsSentCount: 0
  });

  let emailsSent = 0;
  if (sendMailToAll && !isExpired) {
    if (announcement.audienceType === 'pandit') {
      // ONLY registered pandits receive the pandit announcement!
      const pQuery = {
        $or: [{ verified: true }, { status: 'Verified' }, { status: 'Pending Review' }]
      };
      if (announcement.targetState && announcement.targetState !== 'ALL') {
        const sRegex = new RegExp('^' + announcement.targetState.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
        pQuery.$or = [{ state: sRegex }, { workingState: sRegex }];
      }
      const pandits = await Pandit.find(pQuery).lean();
      for (const p of pandits) {
        if (!p.email) continue;
        try {
          await sendSafe('MEDIA_ANNOUNCEMENT', p.email, {
            ...announcement.toObject(),
            recipientName: p.name || 'Pandit Ji',
            recipientEmail: p.email
          });
          emailsSent++;
        } catch (e) {
          console.error(`[Pandit Announcement Email Error to ${p.email}]:`, e.message);
        }
      }
    } else {
      // Devotees announcement
      const uQuery = { role: { $ne: 'admin' }, status: { $ne: 'Revoked' } };
      if (announcement.targetState && announcement.targetState !== 'ALL') {
        uQuery.state = new RegExp('^' + announcement.targetState.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
      }
      if (announcement.targetDistricts && announcement.targetDistricts.length && !announcement.targetDistricts.includes('ALL')) {
        uQuery.district = { $in: announcement.targetDistricts.map(d => new RegExp('^' + d.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i')) };
      }
      const devotees = await User.find(uQuery).lean();
      for (const dev of devotees) {
        if (!dev.email) continue;
        try {
          await sendSafe('MEDIA_ANNOUNCEMENT', dev.email, {
            ...announcement.toObject(),
            recipientName: dev.name || 'Devotee',
            recipientEmail: dev.email
          });
          emailsSent++;
        } catch (e) {
          console.error(`[User Announcement Email Error to ${dev.email}]:`, e.message);
        }
      }
    }
    announcement.emailsSentCount = emailsSent;
    announcement.emailsSentAt = new Date();
    await announcement.save();
  }

  res.status(201).json({
    ok: true,
    announcement,
    emailsSent,
    message: `Announcement "${announcement.title}" published successfully${sendMailToAll ? ` and emailed to ${emailsSent} ${announcement.audienceType === 'pandit' ? 'Pandits' : 'Devotees'}.` : '.'}`
  });
}));

// 9. Media Announcements: Delete
app.delete('/api/admin/media/announcements/:id', adminOnly, wrap(async (req, res) => {
  const rawId = req.params.id ? decodeURIComponent(req.params.id).trim() : '';
  const q = mongoose.Types.ObjectId.isValid(rawId)
    ? { $or: [{ announcementId: rawId }, { _id: rawId }] }
    : { announcementId: rawId };
  const ann = await MediaAnnouncement.findOneAndDelete(q);
  if (!ann) return res.status(404).json({ error: 'Announcement not found' });
  res.json({ ok: true, deletedId: ann.announcementId, message: 'Announcement successfully deleted.' });
}));

// 10. Active Popups API: Fetches online discount offers & announcements for Full-Screen popup on dashboard open
app.get('/api/media/active-popups', wrap(async (req, res) => {
  const role = req.query.role || 'user'; // 'user' | 'pandit'
  const state = req.query.state ? String(req.query.state).trim().toLowerCase() : '';
  const district = req.query.district ? String(req.query.district).trim().toLowerCase() : '';
  const nowStr = new Date().toISOString().split('T')[0];

  // Auto-expire
  await Promise.all([
    MediaOffer.updateMany({ status: 'Active', endDate: { $lt: nowStr } }, { $set: { status: 'Expired' } }),
    MediaAnnouncement.updateMany({ status: 'Active', endDate: { $lt: nowStr } }, { $set: { status: 'Expired' } })
  ]).catch(() => {});

  let activeOffers = [];
  let activeAnnouncements = [];

  if (role === 'pandit') {
    // Only Pandit announcements for Pandit dashboard
    const anns = await MediaAnnouncement.find({
      status: 'Active',
      audienceType: 'pandit',
      startDate: { $lte: nowStr },
      endDate: { $gte: nowStr }
    }).sort({ createdAt: -1 }).lean();

    activeAnnouncements = anns.filter(a => {
      if (a.targetState && a.targetState !== 'ALL' && state) {
        if (a.targetState.trim().toLowerCase() !== state) return false;
      }
      if (a.targetDistricts && a.targetDistricts.length && !a.targetDistricts.includes('ALL') && district) {
        const matches = a.targetDistricts.some(d => d.trim().toLowerCase() === district);
        if (!matches) return false;
      }
      return true;
    });
  } else {
    // Devotee: Active Discount Offers + User Announcements
    const [offers, anns] = await Promise.all([
      MediaOffer.find({
        status: 'Active',
        startDate: { $lte: nowStr },
        endDate: { $gte: nowStr }
      }).sort({ discountPercent: -1, createdAt: -1 }).lean(),
      MediaAnnouncement.find({
        status: 'Active',
        audienceType: 'user',
        startDate: { $lte: nowStr },
        endDate: { $gte: nowStr }
      }).sort({ createdAt: -1 }).lean()
    ]);

    activeOffers = offers.filter(o => {
      if (o.targetState && o.targetState !== 'ALL' && state) {
        if (o.targetState.trim().toLowerCase() !== state) return false;
      }
      if (o.targetDistricts && o.targetDistricts.length && !o.targetDistricts.includes('ALL') && district) {
        const matches = o.targetDistricts.some(d => d.trim().toLowerCase() === district);
        if (!matches) return false;
      }
      return true;
    });

    activeAnnouncements = anns.filter(a => {
      if (a.targetState && a.targetState !== 'ALL' && state) {
        if (a.targetState.trim().toLowerCase() !== state) return false;
      }
      if (a.targetDistricts && a.targetDistricts.length && !a.targetDistricts.includes('ALL') && district) {
        const matches = a.targetDistricts.some(d => d.trim().toLowerCase() === district);
        if (!matches) return false;
      }
      return true;
    });
  }

  res.json({
    ok: true,
    hasActivePopup: activeOffers.length > 0 || activeAnnouncements.length > 0,
    offers: activeOffers,
    announcements: activeAnnouncements
  });
}));

// ---- Admin analytics ----
app.get('/api/admin/stats', adminOnly, wrap(async (req, res) => {
  const [users, pandits, verified, pending, rawBookings, longReqs, pendingLong] = await Promise.all([
    User.countDocuments({ role: 'user' }), Pandit.countDocuments(), Pandit.countDocuments({ verified: true }),
    Pandit.countDocuments({ status: 'Pending Review' }), Booking.find({}, { fee: 1, status: 1, date: 1, time: 1, havanConducted: 1 }), LongPujaRequest.countDocuments(),
    LongPujaRequest.countDocuments({ status: { $in: ['Pending Admin', 'Rejected', 'Declined', 'Rejected by Pandit'] } })
  ]);
  const bookings = await autoUpdatePassedSlots(rawBookings);
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
