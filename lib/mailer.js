const nodemailer = require('nodemailer');

let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: process.env.SENDER_EMAIL, pass: process.env.APP_PASSWORD }
    });
  }
  return transporter;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

function layout(title, body) {
  return `<div style="font-family:Inter,Arial,sans-serif;background:#fff8ed;padding:24px">
  <div style="max-width:560px;margin:auto;background:#fff;border:1px solid #f0e0cc;border-radius:12px;overflow:hidden">
    <div style="background:#351605;color:#ffd166;padding:18px 24px;font-family:Georgia,serif;font-size:22px;letter-spacing:1px">ॐ PujaConnect</div>
    <div style="padding:24px;color:#3b2115;line-height:1.6">
      <h2 style="font-family:Georgia,serif;margin-top:0">${esc(title)}</h2>${body}
      <p style="margin-top:28px;color:#8a6a55;font-size:13px">With divine blessings,<br>Team PujaConnect</p>
    </div></div></div>`;
}
const rows = (pairs) => '<table style="width:100%;border-collapse:collapse">' + pairs.filter((p) => p[1] !== undefined && p[1] !== '').map(([k, v]) => `<tr><td style="padding:6px 0;color:#8a6a55;width:40%">${esc(k)}</td><td style="padding:6px 0"><strong>${esc(v)}</strong></td></tr>`).join('') + '</table>';

const TEMPLATES = {
  BOOKING_REQUEST_RECEIVED: (d) => ({
    subject: `Booking Request Received – ${d.bookingId || ''} | PujaConnect`,
    html: layout('Booking Request Received 🙏', `
      <p>Namaste <strong>${esc(d.userName || 'Devotee')}</strong>,</p>
      <p>We have received your ceremony booking request. Our team will verify availability and assign a verified Vedic Pandit to your ritual as soon as possible.</p>
      ${rows([
        ['Booking ID', d.bookingId],
        ['Ritual', d.service],
        ['Preferred Pandit', d.preferredPanditName || 'Any Available Verified Pandit'],
        ['Ceremony Date', d.date],
        ['Time Slot', d.time],
        ['District / Venue', d.address || d.district],
        ['Estimated Dakshina', d.fee ? inr(d.fee) : ''],
        ['Status', 'Request Received – Pandit Assignment in Progress']
      ])}
      <p style="margin-top:18px;background:#fff8ed;border-left:4px solid #d99a19;padding:12px;font-size:13.5px;color:#3b2115">
        <strong>What happens next?</strong><br>
        Our PujaConnect team is reviewing your requirement and assigning a verified Vedic Purohit for your area. Once the Pandit accepts the assignment, you will automatically receive an official confirmation email with the Pandit's details.
      </p>
    `)
  }),
  BOOKING_CONFIRMATION: (d) => ({
    subject: `Ceremony Confirmed 🙏 – ${d.bookingId || ''} | Pandit ${esc(d.panditName || 'Assigned')}`,
    html: layout('Your Ceremony is Confirmed 🙏', `
      <p>Namaste <strong>${esc(d.userName || 'Devotee')}</strong>,</p>
      <p>Great news! Your ritual booking has been confirmed. <strong>Pandit ${esc(d.panditName || 'Assigned Pandit')}</strong> has accepted the request and is confirmed for your sacred ceremony.</p>
      ${rows([
        ['Booking ID', d.bookingId],
        ['Sacred Ritual', d.service],
        ['Confirmed Pandit', d.panditName],
        ['Pandit Phone', d.panditPhone || 'Available in Devotee Dashboard'],
        ['Ceremony Date', d.date],
        ['Time Slot', d.time],
        ['District / Address', d.address || d.district],
        ['Dakshina Amount', d.fee ? inr(d.fee) : ''],
        ['Booking Status', 'Confirmed ✅']
      ])}
      <p style="margin-top:18px">You can track your booking status, view ritual details, and complete Dakshina payment through the <strong>Payment Tracking</strong> section in your PujaConnect Devotee portal.</p>
    `)
  }),
  PANDIT_NEW_BOOKING: (d) => ({
    subject: `New ceremony request – ${d.service || ''}`,
    html: layout('New ceremony request', `<p>Pranam ${esc(d.panditName || 'Pandit ji')}, you have a new booking.</p>` + rows([['Booking ID', d.bookingId], ['Devotee', d.userName], ['Phone', d.phone], ['Ritual', d.service], ['Date', d.date], ['Time', d.time], ['District / Address', d.address || d.district], ['Dakshina', d.fee ? inr(d.fee) : '']]))
  }),
  PANDIT_VERIFIED: (d) => ({
    subject: d.status === 'Rejected' ? 'Your PujaConnect profile review' : 'Your PujaConnect profile is verified ✅',
    html: layout(d.status === 'Rejected' ? 'Profile not approved' : 'Welcome aboard!', d.status === 'Rejected'
      ? `<p>Pranam ${esc(d.panditName)}, we could not verify your profile at this time. Please re-check your identity document link and register again.</p>`
      : `<p>Pranam ${esc(d.panditName)}, your profile has been verified. You can now receive bookings from devotees.</p>`)
  }),
  LONG_PUJA_SUBMITTED: (d) => ({
    subject: `Multi-day puja request received – ${d.id || ''}`,
    html: layout('Request received', `<p>Namaste ${esc(d.userName || 'Devotee')}, we received your multi-day ritual request. Our team will assign verified pandits shortly.</p>` + rows([['Request ID', d.id], ['Ritual', d.pujaName], ['District', d.district], ['From', d.fromDate], ['To', d.toDate], ['Daily hours', d.dailyHours], ['Pandits required', d.requiredPandits], ['Estimated Dakshina', d.estimatedCost ? inr(d.estimatedCost) : '']]))
  }),
  PAYMENT_RECEIPT: (d) => ({
    subject: `Payment receipt – ${d.reference || ''}`,
    html: layout('Payment received', `<p>Thank you ${esc(d.userName || 'Devotee')}. Here is your payment receipt.</p>` + rows([['Reference', d.reference], ['Ritual', d.service], ['Dakshina Total', d.total ? inr(d.total) : ''], ['Amount Paid', inr(d.advanceAmount || d.amount)], ['Payment Status', 'Paid & Verified ✅']]))
  }),
  PANDIT_CONFIRMED_BOOKING: (d) => ({
    subject: `Pandit Confirmed for ${d.service || 'Puja'} – ${d.bookingId || ''}`,
    html: layout('Pandit Confirmed Your Ceremony 🙏', `<p>Namaste ${esc(d.userName || 'Devotee')},</p><p>We are pleased to inform you that <strong>Pandit ${esc(d.panditName || 'Assigned Pandit')}</strong> has accepted and confirmed your ceremony booking.</p>` + rows([['Booking ID', d.bookingId], ['Ritual', d.service], ['Date', d.date], ['Time Slot', d.time], ['District / Venue', d.address || d.district], ['Dakshina', d.fee ? inr(d.fee) : '']]) + `<p style="margin-top:16px">You can now track the ceremony and complete Dakshina payment through the <strong>Payment Tracking</strong> section in your Devotee dashboard.</p>`)
  }),
  PANDIT_REJECTED_BOOKING: (d) => ({
    subject: `Booking Update – ${d.bookingId || ''}`,
    html: layout('Ceremony Request Update', `<p>Namaste ${esc(d.userName || 'Devotee')},</p><p>Pandit ${esc(d.panditName || '')} was unavailable for the requested slot on ${esc(d.date)}. Please choose another time slot or browse our verified pandits.</p>` + rows([['Booking ID', d.bookingId], ['Ritual', d.service]]))
  }),
  PANDIT_PAYMENT_CREDITED: (d) => ({
    subject: `Dakshina Payment Credited: ${inr(d.amount)} – Booking ${d.bookingId || ''}`,
    html: layout('Dakshina Credited to Your Account 💰', `
      <p>Pranam <strong>${esc(d.panditName || 'Pandit ji')}</strong>,</p>
      <p>Please check your bank account or UPI (${esc(d.upiId || d.bankAccount || 'Registered Account')}). The devotee has completed Dakshina payment and the transaction has been verified by PujaConnect finance.</p>
      ${rows([['Booking ID', d.bookingId], ['Ceremony', d.service], ['Devotee', d.userName], ['Amount Credited', inr(d.amount)], ['Transaction Ref', d.paymentProof || d.txnId || 'Direct Payment Verified']])}
      <p style="margin-top:16px;color:#2e7d32;font-weight:600">✓ The payment has been verified and settled. Thank you for rendering your sacred Vedic service!</p>
    `)
  }),
  PANDIT_OTP: (d) => ({
    subject: `${d.otp} is your PujaConnect Login OTP`,
    html: layout('Pandit Login Verification Code', `
      <p>Pranam <strong>${esc(d.name || 'Pandit ji')}</strong>,</p>
      <p>Your one-time verification code (OTP) for PujaConnect Pandit login is:</p>
      <div style="text-align:center;margin:24px 0">
        <span style="display:inline-block;background:#351605;color:#ffd166;font-size:32px;font-weight:700;letter-spacing:6px;padding:12px 28px;border-radius:8px">${esc(d.otp)}</span>
      </div>
      <p style="color:#666;font-size:13px">This code is valid for 10 minutes. If you did not request this login, please ignore this email.</p>
    `)
  })
};

async function sendTemplate(type, to, data = {}) {
  const tpl = TEMPLATES[type];
  if (!tpl) throw new Error('Unknown email template: ' + type);
  if (!to) throw new Error('Recipient email missing');
  if (!process.env.SENDER_EMAIL || !process.env.APP_PASSWORD) throw new Error('Email credentials not configured');
  const { subject, html } = tpl(data);
  return getTransporter().sendMail({
    from: process.env.EMAIL_FROM || process.env.SENDER_EMAIL,
    to, subject, html
  });
}

// Fire-and-forget: never let email failures break an API call
function sendSafe(type, to, data) {
  return sendTemplate(type, to, data).catch((e) => console.error(`[email:${type}]`, e.message));
}

module.exports = { sendTemplate, sendSafe, TEMPLATES };
