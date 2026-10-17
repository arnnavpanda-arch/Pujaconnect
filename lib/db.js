const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Pandit, Puja } = require('./models');

// Serverless-friendly connection cache
let cached = global.__pujaMongo;
if (!cached) cached = global.__pujaMongo = { conn: null, promise: null, seeded: false };

// Prevent uncaughtException when socket drops in serverless container
if (!global.__pujaMongoListener) {
  global.__pujaMongoListener = true;
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection event error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected, will reconnect on next request');
    if (cached) cached.conn = null;
  });
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set in environment variables. Please configure MONGO_URI in Vercel project settings.');
  }
  if (!cached.promise || mongoose.connection.readyState === 0) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false
      })
      .then((m) => m)
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        throw err;
      });
  }
  cached.conn = await cached.promise;
  if (!cached.seeded) {
    cached.seeded = true;
    try {
      await seed();
    } catch (e) {
      console.error('Seed error:', e.message);
    }
  }
  return cached.conn;
}

const DEFAULT_PUJAS = [
  {
    name: 'Satyanarayan Puja', type: 'Short', baseFee: 1999, price: '₹1,999',
    desc: 'Worship of Lord Vishnu for prosperity, peace and gratitude.',
    longDesc: 'A popular home ritual with Katha, aarti and prasad. Duration about 2–3 hours. Includes puja samagri list and prasad preparation guidance.',
    benefits: ['Prosperity & peace', 'Family harmony', 'Fulfilment of wishes'],
    image: 'https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Griha Pravesh', type: 'Short', baseFee: 2499, price: '₹2,499',
    desc: 'Housewarming ritual to purify and bless a new home.',
    longDesc: 'Includes Ganesh puja, Vastu shanti, havan and kalash sthapana. Duration about 3 hours.',
    benefits: ['Vastu harmony', 'Positive energy', 'Auspicious beginnings'],
    image: 'https://images.unsplash.com/photo-1590055531615-f16d36ffe8ce?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Rudrabhishek', type: 'Short', baseFee: 3100, price: '₹3,100',
    desc: 'Sacred abhishek of Lord Shiva with milk, honey and Vedic mantras.',
    longDesc: 'Rudri path with abhishek using panchamrit. Duration about 2–3 hours.',
    benefits: ['Removes obstacles', 'Health & well-being', 'Spiritual growth'],
    image: 'https://images.unsplash.com/photo-1609766418204-94aae0ecfdfc?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Ganesh Puja', type: 'Short', baseFee: 1199, price: '₹1,199',
    desc: 'Invoke Lord Ganesha for new beginnings and success.',
    longDesc: 'Ganapati puja with modak offering and aarti. Duration about 1–2 hours.',
    benefits: ['Success in new ventures', 'Wisdom', 'Removal of hurdles'],
    image: 'https://images.unsplash.com/photo-1567591370504-80bf3a3b3d7f?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Chandi Path', type: 'Long', perHourFee: 600, baseFee: 5100, price: 'From ₹600/hr',
    desc: 'Multi-day recitation of Durga Saptashati with havan.',
    longDesc: 'Performed by multiple pandits over several days, concluding with purnahuti.',
    benefits: ['Protection', 'Courage', 'Victory over adversity'],
    image: 'https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Bhagavat Katha', type: 'Long', perHourFee: 700, baseFee: 7100, price: 'From ₹700/hr',
    desc: 'Seven-day narration of the Srimad Bhagavatam.',
    longDesc: 'Daily discourse sessions with bhajan and aarti.',
    benefits: ['Devotion', 'Inner peace', 'Ancestral blessings'],
    image: 'https://images.unsplash.com/photo-1590055531615-f16d36ffe8ce?auto=format&fit=crop&q=80&w=400'
  }
];

const DEMO_PANDITS = [
  { name: 'Pt. Ramesh Mishra', email: 'ramesh.demo@example.com', phone: '9000000001', state: 'Odisha', workingState: 'Odisha', district: 'Khordha', city: 'Bhubaneswar', workingDistricts: ['Khordha', 'Puri', 'Cuttack'], experience: 12, exp: '10+ Years', specialty: 'Satyanarayan & Griha Pravesh', fee: 1800, services: ['Satyanarayan Puja', 'Griha Pravesh', 'Ganesh Puja', 'Rudrabhishek'] },
  { name: 'Pt. Sudhir Acharya', email: 'sudhir.demo@example.com', phone: '9000000002', state: 'Odisha', workingState: 'Odisha', district: 'Puri', city: 'Puri', location: 'Puri, Odisha', workingDistricts: ['Puri', 'Khordha'], experience: 18, exp: '15+ Years', specialty: 'Rudrabhishek & Chandi Path', fee: 2200, services: ['Rudrabhishek', 'Chandi Path', 'Ganesh Puja', 'Bhagavat Katha'] },
  { name: 'Pt. Anil Sharma', email: 'anil.demo@example.com', phone: '9000000003', state: 'Odisha', workingState: 'Odisha', district: 'Cuttack', city: 'Cuttack', location: 'Cuttack, Odisha', workingDistricts: ['Cuttack', 'Khordha'], experience: 8, exp: '5+ Years', specialty: 'Ganesh & Satyanarayan Puja', fee: 1500, services: ['Satyanarayan Puja', 'Ganesh Puja', 'Griha Pravesh'] }
];

async function seed() {
  // Super admin
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@pujaconnect.com').toLowerCase();
  if (!(await User.findOne({ email: adminEmail }))) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    await User.create({ name: 'Super Admin', email: adminEmail, phone: '0000000000', password: hash, role: 'admin' });
  }
  // Catalog
  if ((await Puja.countDocuments()) === 0) await Puja.insertMany(DEFAULT_PUJAS);
  // Demo pandits (only on a fresh database)
  if ((await Pandit.countDocuments()) === 0) {
    await Pandit.insertMany(DEMO_PANDITS.map((p) => ({ ...p, status: 'Verified', verified: true })));
  }
}

module.exports = { connectDB };
