const mongoose = require('mongoose');
const { Schema } = mongoose;

const User = mongoose.models.User || mongoose.model('User', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, default: '' },
  state: { type: String, default: '' },
  district: { type: String, default: '' },
  city: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
}));

if (mongoose.models.Pandit) delete mongoose.models.Pandit;
const Pandit = mongoose.model('Pandit', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  state: { type: String, default: 'Odisha' },
  district: { type: String, default: 'Khordha' },
  city: { type: String, default: 'Bhubaneswar' },
  location: { type: String, default: 'Bhubaneswar, Odisha' },
  workingState: { type: String, default: 'Odisha' },
  workingDistricts: { type: [String], default: ['Khordha'] },
  experience: { type: Number, default: 5 },
  exp: { type: String, default: '5+ Years' },
  specialty: { type: String, default: 'Vedic Rituals' },
  bio: { type: String, default: 'Experienced Vedic Pandit performing authentic Vedic rituals.' },
  fee: { type: Number, default: 1500 },
  services: { type: [String], default: ['Satyanarayan Puja', 'Griha Pravesh', 'Ganesh Puja'] },
  availableDays: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  daySlots: { type: Schema.Types.Mixed, default: {} },
  timeSlots: { type: [String], default: ['08:00 AM - 11:00 AM', '04:00 PM - 07:00 PM'] },
  districtPrices: { type: Schema.Types.Mixed, default: {} },
  bankAccount: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  upiId: { type: String, default: '' },
  bankName: { type: String, default: '' },
  accountHolder: { type: String, default: '' },
  qrCode: { type: String, default: '' },
  photo: { type: String, default: 'https://images.unsplash.com/photo-1544168190-79c15427015f?auto=format&fit=crop&q=80&w=200' },
  documentUrl: { type: String, default: '' },
  idDoc: { type: String, default: '' },
  status: { type: String, enum: ['Pending Review', 'Verified', 'Rejected'], default: 'Pending Review' },
  verified: { type: Boolean, default: false }
}, { minimize: false, strict: false }));

if (mongoose.models.Booking) delete mongoose.models.Booking;
const Booking = mongoose.model('Booking', new Schema({
  bookingId: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true, lowercase: true, trim: true },
  userName: { type: String, default: 'Customer' },
  phone: { type: String, default: '' },
  service: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, default: '10:00 AM' },
  district: { type: String, required: true },
  panditEmail: { type: String, default: '', lowercase: true, trim: true },
  panditName: { type: String, default: 'To Be Assigned by Admin' },
  preferredPanditEmail: { type: String, default: '', lowercase: true, trim: true },
  preferredPanditName: { type: String, default: '' },
  status: { type: String, enum: ['Pending Assignment', 'Pending Pandit Confirmation', 'Confirmed', 'Completed', 'Cancelled', 'In Progress'], default: 'Pending Assignment' },
  panditApproval: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  adminApproval: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  rejectedPandits: { type: [String], default: [] },
  rejectionReason: { type: String, default: '' },
  fee: { type: Number, default: 1199 },
  advancePaid: { type: Boolean, default: false },
  advanceAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Pending', 'Partial', 'Paid', 'Verification Pending', 'Rejected', 'Payment Rejected'], default: 'Pending' },
  paymentProof: { type: String, default: '' },
  paymentMethod: { type: String, default: 'UPI/Bank Transfer' },
  paymentDate: { type: Date },
  paymentRejectionReason: { type: String, default: '' },
  invoiceId: { type: String, default: '' },
  invoiceGeneratedAt: { type: Date },
  bookingType: { type: String, default: 'Standard' },
  address: { type: String, default: '' },
  adminFeePercent: { type: Number, default: 10 },
  adminFeeAmount: { type: Number, default: 0 },
  panditNetPayout: { type: Number, default: 0 },
  panditPayoutStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  panditPayoutAmount: { type: Number, default: 0 },
  panditPayoutDate: { type: Date },
  panditPayoutTxnId: { type: String, default: '' },
  panditPayoutMethod: { type: String, default: 'Bank Transfer (IMPS/NEFT)' },
  transactionDate: { type: Date, default: Date.now }
}, { minimize: false, strict: false }));

const LongPujaRequest = mongoose.models.LongPujaRequest || mongoose.model('LongPujaRequest', new Schema({
  id: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true, lowercase: true, trim: true },
  userName: { type: String, default: 'Devotee' },
  phone: { type: String, default: '' },
  pujaName: { type: String, required: true },
  district: { type: String, required: true },
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  totalDays: { type: Number, default: 1 },
  dailyHours: { type: Number, default: 4 },
  totalHours: { type: Number, default: 4 },
  requiredPandits: { type: Number, default: 1 },
  assignedPandits: { type: [String], default: [] },
  panditStatuses: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['Pending Admin', 'Assigned', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending Admin' },
  estimatedCost: { type: Number, default: 0 },
  advancePaid: { type: Boolean, default: false },
  advanceAmount: { type: Number, default: 0 },
  submittedAt: { type: String, default: () => new Date().toISOString() }
}, { minimize: false }));

const Puja = mongoose.models.Puja || mongoose.model('Puja', new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  desc: { type: String, required: true },
  longDesc: { type: String, default: '' },
  image: { type: String, default: 'https://images.unsplash.com/photo-1590055531615-f16d36ffe8ce?auto=format&fit=crop&q=80&w=400' },
  benefits: { type: [String], default: [] },
  type: { type: String, enum: ['Short', 'Long'], default: 'Short' },
  perHourFee: { type: Number, default: 500 },
  baseFee: { type: Number, default: 1199 },
  price: { type: String, default: '₹1,199' }
}));

const AppSetting = mongoose.models.AppSetting || mongoose.model('AppSetting', new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed }
}));

module.exports = { User, Pandit, Booking, LongPujaRequest, Puja, AppSetting };
