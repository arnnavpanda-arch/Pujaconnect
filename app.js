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
app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const s = mongoose.connection.readyState;
  res.status(s === 1 ? 200 : 503).json({
    status: s === 1 ? 'ok' : 'degraded',
    database: states[s] || 'unknown',
    readyState: s,
    hasMongoUri: Boolean(process.env.MONGO_URI),
    time: Date.now()
  });
});

// ---- Ensure DB connection for everything else ----
app.use('/api', wrap(async (req, res, next) => {
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
const publicUser = (u) => ({ name: u.name, email: u.email, phone: u.phone, state: u.state, district: u.district, city: u.city, role: u.role });
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
    if (state) user.state = state;
    if (district) user.district = district;
    if (city) user.city = city;
    await user.save();
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
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const s = mongoose.connection.readyState;
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
  const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
  res.json(users);
}));

app.get('/api/users/profile', auth, wrap(async (req, res) => {
  const user = await User.findOne({ email: lc(req.auth.email) });
  if (!user) return res.status(404).json({ error: 'Devotee profile not found' });
  res.json(publicUser(user));
}));

app.put('/api/users/profile', auth, wrap(async (req, res) => {
  const { name, phone, state, district, city } = req.body;
  const user = await User.findOne({ email: lc(req.auth.email) });
  if (!user) return res.status(404).json({ error: 'Devotee profile not found' });
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (state !== undefined) user.state = state;
  if (district !== undefined) user.district = district;
  if (city !== undefined) user.city = city;
  await user.save();
  res.json(publicUser(user));
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
  if (req.query.email) q.email = lc(req.query.email);
  if (req.query.district) q.$or = [{ district: req.query.district }, { workingDistricts: req.query.district }];
  if (req.query.state) q.$and = [{ $or: [{ state: req.query.state }, { workingState: req.query.state }] }];
  if (req.query.service) q.services = req.query.service;
  res.json(await Pandit.find(q).sort({ experience: -1 }));
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

app.put('/api/pandits/:id/status', adminOnly, wrap(async (req, res) => {
  const { status } = req.body;
  if (!['Verified', 'Rejected', 'Pending Review'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const p = await Pandit.findByIdAndUpdate(req.params.id, { status, verified: status === 'Verified' }, { new: true });
  if (!p) return res.status(404).json({ error: 'Pandit not found' });
  if (status !== 'Pending Review') await sendSafe('PANDIT_VERIFIED', p.email, { panditName: p.name, status });
  res.json(p);
}));

app.put('/api/pandits/:id', wrap(async (req, res) => {
  const allowed = ['name', 'phone', 'state', 'district', 'city', 'location', 'workingState', 'workingDistricts', 'experience', 'exp', 'specialty', 'bio', 'fee', 'services', 'availableDays', 'daySlots', 'timeSlots', 'districtPrices', 'photo', 'documentUrl', 'idDoc'];
  const update = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
  const p = await Pandit.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!p) return res.status(404).json({ error: 'Pandit not found' });
  res.json(p);
}));

// ---- Bookings ----
async function uniqueId(Model, field, prefix) {
  for (let i = 0; i < 10; i++) {
    const id = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    if (!(await Model.findOne({ [field]: id }))) return id;
  }
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

app.get('/api/bookings', wrap(async (req, res) => {
  const q = {};
  if (req.query.userEmail) q.userEmail = lc(req.query.userEmail);
  if (req.query.panditEmail) q.panditEmail = lc(req.query.panditEmail);
  res.json(await Booking.find(q).sort({ transactionDate: -1 }));
}));

app.post('/api/bookings', wrap(async (req, res) => {
  const b = req.body;
  if (!b.userEmail || !b.service || !b.date || !b.district || !b.panditEmail) return res.status(400).json({ error: 'Missing required booking fields' });
  const pandit = await Pandit.findOne({ email: lc(b.panditEmail) });
  if (!pandit || !pandit.verified) return res.status(400).json({ error: 'Selected Pandit is not available' });
  // Slot clash check
  const clash = await Booking.findOne({ panditEmail: pandit.email, date: b.date, time: b.time, status: { $in: ['Confirmed', 'In Progress'] } });
  if (clash) return res.status(409).json({ error: 'This slot is already booked. Please choose another.' });

  const fee = Number(b.fee) || (pandit.districtPrices && pandit.districtPrices[b.district]) || pandit.fee;
  const advanceAmount = Number(b.advanceAmount) || 0;
  const booking = await Booking.create({
    bookingId: await uniqueId(Booking, 'bookingId', 'PUJA'),
    userEmail: lc(b.userEmail), userName: b.userName || 'Customer', phone: b.phone || '',
    service: b.service, date: b.date, time: b.time || '08:00 AM - 11:00 AM', district: b.district, address: b.address || '',
    panditEmail: pandit.email, panditName: pandit.name,
    fee, advanceAmount, advancePaid: advanceAmount > 0,
    paymentStatus: advanceAmount <= 0 ? 'Pending' : advanceAmount >= fee ? 'Paid' : 'Partial',
    bookingType: b.bookingType || 'Standard'
  });
  const mail = { ...booking.toObject(), address: booking.address || booking.district };
  sendSafe('BOOKING_CONFIRMATION', booking.userEmail, mail);
  sendSafe('PANDIT_NEW_BOOKING', pandit.email, mail);
  if (advanceAmount > 0) sendSafe('PAYMENT_RECEIPT', booking.userEmail, { userName: booking.userName, reference: booking.bookingId, service: booking.service, total: fee, advanceAmount });
  res.status(201).json(booking);
}));

app.put('/api/bookings/:id/status', wrap(async (req, res) => {
  const { status } = req.body;
  if (!['Confirmed', 'Completed', 'Cancelled', 'In Progress'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const b = await Booking.findOneAndUpdate({ bookingId: req.params.id }, { status }, { new: true });
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  res.json(b);
}));

app.put('/api/bookings/:id/reschedule', wrap(async (req, res) => {
  const { date, time } = req.body;
  if (!date || !time) return res.status(400).json({ error: 'Date and time are required' });
  const b = await Booking.findOne({ bookingId: req.params.id });
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  if (!['Confirmed', 'In Progress'].includes(b.status)) return res.status(400).json({ error: 'Only active bookings can be rescheduled' });
  const clash = await Booking.findOne({ bookingId: { $ne: b.bookingId }, panditEmail: b.panditEmail, date, time, status: { $in: ['Confirmed', 'In Progress'] } });
  if (clash) return res.status(409).json({ error: 'That slot is already booked.' });
  b.date = date; b.time = time; b.status = 'Confirmed';
  await b.save();
  res.json(b);
}));

// ---- Long (multi-day) pujas ----
app.get('/api/long-puja-requests', wrap(async (req, res) => {
  const q = {};
  if (req.query.userEmail) q.userEmail = lc(req.query.userEmail);
  if (req.query.panditEmail) q.assignedPandits = lc(req.query.panditEmail);
  res.json(await LongPujaRequest.find(q).sort({ submittedAt: -1 }));
}));

app.post('/api/long-puja-requests', wrap(async (req, res) => {
  const b = req.body;
  if (!b.userEmail || !b.pujaName || !b.district || !b.fromDate || !b.toDate) return res.status(400).json({ error: 'Missing required fields' });
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
  sendSafe('LONG_PUJA_SUBMITTED', reqDoc.userEmail, reqDoc.toObject());
  if (advanceAmount > 0) sendSafe('PAYMENT_RECEIPT', reqDoc.userEmail, { userName: reqDoc.userName, reference: reqDoc.id, service: reqDoc.pujaName, total: estimatedCost, advanceAmount });
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
    Pandit.countDocuments({ status: 'Pending Review' }), Booking.find(), LongPujaRequest.countDocuments(),
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
