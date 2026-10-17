const nodemailer = require('nodemailer');

let transporter;
function getTransporter() {
  if (!transporter) {
    const user = (process.env.SENDER_EMAIL || '').trim();
    const pass = (process.env.APP_PASSWORD || '').replace(/\s+/g, '').trim();
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
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
        ['District', d.district],
        ['Venue / Address', d.address || d.district],
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
        ['District', d.district],
        ['Venue / Address', d.address || d.district],
        ['Dakshina Amount', d.fee ? inr(d.fee) : ''],
        ['Booking Status', 'Confirmed ✅']
      ])}
      <p style="margin-top:18px">You can track your booking status, view ritual details, and complete Dakshina payment through the <strong>Payment Tracking</strong> section in your PujaConnect Devotee portal.</p>
    `)
  }),
  PANDIT_NEW_BOOKING: (d) => ({
    subject: `New ceremony request – ${d.service || ''}`,
    html: layout('New ceremony request', `<p>Pranam ${esc(d.panditName || 'Pandit ji')}, you have a new booking.</p>` + rows([
      ['Booking ID', d.bookingId],
      ['Devotee', d.userName],
      ['Phone', d.phone],
      ['Ritual', d.service],
      ['Date', d.date],
      ['Time', d.time],
      ['District', d.district],
      ['Venue / City / Address', d.address || d.district],
      ['Dakshina', d.fee ? inr(d.fee) : '']
    ]))
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
    subject: `Dakshina Payment Verified & Receipt – ${d.reference || d.bookingId || ''} | PujaConnect`,
    html: layout('Payment Verified 🙏', `
      <p>Namaste <strong>${esc(d.userName || 'Devotee')}</strong>,</p>
      <p>Your Dakshina payment for ceremony <strong>${esc(d.service || 'Vedic Ritual')}</strong> has been successfully verified by PujaConnect Administration.</p>
      <div style="background:#f0fff4;border:1px solid #c8e6c9;border-left:4px solid #2e7d32;padding:12px 16px;border-radius:6px;margin:16px 0;font-size:14px;color:#1b5e20">
        ✓ <strong>Payment Status: Verified &amp; Confirmed</strong><br>
        Your ritual booking is confirmed and official receipt has been issued.
      </div>
      <h3 style="font-family:Georgia,serif;color:#351605;margin:20px 0 10px;font-size:16px">Complete Ceremony &amp; Payment Details:</h3>
      ${rows([
        ['Booking ID', d.bookingId],
        ['Invoice / Receipt No.', d.reference || d.invoiceId],
        ['Sacred Ritual', d.service],
        ['Devotee Name', d.userName],
        ['Contact Phone', d.phone || d.userPhone],
        ['Contact Email', d.userEmail],
        ['Assigned Pandit', d.panditName || 'Assigned Vedic Pandit'],
        ['Ceremony Date', d.date],
        ['Ceremony Time Slot', d.time],
        ['Ceremony Venue', d.address || d.district],
        ['Total Dakshina', d.total ? inr(d.total) : (d.amount ? inr(d.amount) : '')],
        ['Amount Paid & Verified', inr(d.amount || d.advanceAmount)],
        ['Payment Reference / UTR', d.paymentProof || d.reference],
        ['Payment Mode', d.paymentMethod || 'UPI / Bank Transfer'],
        ['Verification Status', 'Paid & Verified ✅']
      ])}
      <p style="margin-top:20px;font-size:13px;color:#666">
        You can download your official PDF invoice anytime from the <strong>Payment Tracking</strong> section of your Devotee Dashboard.
      </p>
    `)
  }),
  PANDIT_PAYMENT_VERIFIED_NOTICE: (d) => ({
    subject: `Customer Paid Dakshina: ${inr(d.amount)} – Booking ${d.bookingId || ''} | Credited Within 24 Hours`,
    html: layout('Customer Payment Received 🙏', `
      <p>Pranam <strong>${esc(d.panditName || 'Pandit ji')}</strong>,</p>
      <div style="background:#fff8ed;border:1.5px solid #ebd9c2;border-left:5px solid #d99a19;padding:16px;border-radius:8px;margin:16px 0;font-size:15px;line-height:1.6;color:#3b2115">
        The user has paid the money. <strong>Your money amount ${inr(d.amount)} is to be credited to your account number ${esc(d.bankAccount || 'Registered Bank Account')} within 24 Hours.</strong>
      </div>
      <h3 style="font-family:Georgia,serif;color:#351605;margin:22px 0 10px;font-size:16.5px">Complete Customer &amp; Ceremony Details:</h3>
      ${rows([
        ['Booking ID', d.bookingId],
        ['Sacred Ritual', d.service],
        ['Devotee (Customer) Name', d.userName],
        ['Customer Phone Number', d.phone || d.userPhone],
        ['Customer Email Address', d.userEmail],
        ['Ceremony Date', d.date],
        ['Ceremony Time Slot', d.time],
        ['Ceremony Venue / District', d.address || d.district],
        ['Total Dakshina Amount', inr(d.amount)],
        ['Credit Timeline', 'Within 24 Hours'],
        ['Pandit Name', d.panditName],
        ['Bank Account Number', d.bankAccount || 'To be updated in Pandit Dashboard'],
        ['Bank Name', d.bankName || 'Registered Bank'],
        ['IFSC Code', d.ifscCode || 'N/A'],
        ['Account Holder Name', d.accountHolder || d.panditName],
        ['UPI ID', d.upiId || 'N/A'],
        ['Customer Payment Ref', d.paymentProof || 'Verified in Records'],
        ['Payment Status', 'Customer Payment Verified ✅']
      ])}
      <p style="margin-top:20px;font-size:13.5px;color:#555">
        ${d.bankAccount ? `Your Dakshina will be directly transferred to your bank account <strong>${esc(d.bankAccount)}</strong> (${esc(d.bankName || 'Bank')}). You will receive an immediate confirmation email once transferred.` : `<em>Note: If you have not yet provided your bank details, please log in to your Pandit Dashboard and enter your Bank Account and IFSC code immediately.</em>`}
      </p>
    `)
  }),
  PANDIT_PAYMENT_CREDITED: (d) => ({
    subject: `Dakshina Payment Credited: ${inr(d.amount)} to Account ${d.bankAccount || ''} – Booking ${d.bookingId || ''}`,
    html: layout('Dakshina Credited to Your Account 💰', `
      <p>Pranam <strong>${esc(d.panditName || 'Pandit ji')}</strong>,</p>
      <div style="background:#e8f5e9;border:1.5px solid #c8e6c9;border-left:5px solid #2e7d32;padding:16px;border-radius:8px;margin:16px 0;font-size:15px;line-height:1.6;color:#1b5e20">
        <strong>Your money amount ${inr(d.amount)} is credited to your account number ${esc(d.bankAccount || 'Registered Bank Account')}.</strong>
      </div>
      <h3 style="font-family:Georgia,serif;color:#351605;margin:22px 0 10px;font-size:16.5px">Complete Payment &amp; Ceremony Details:</h3>
      ${rows([
        ['Booking ID', d.bookingId],
        ['Sacred Ritual', d.service],
        ['Devotee (Customer) Name', d.userName],
        ['Customer Phone Number', d.phone || d.userPhone],
        ['Customer Email Address', d.userEmail],
        ['Ceremony Date', d.date],
        ['Ceremony Time Slot', d.time],
        ['Ceremony Venue / District', d.address || d.district],
        ['Amount Credited', inr(d.amount)],
        ['Credited Account Number', d.bankAccount || 'Registered Bank Account'],
        ['Bank Name', d.bankName || 'Registered Bank'],
        ['IFSC Code', d.ifscCode || 'N/A'],
        ['Account Holder Name', d.accountHolder || d.panditName],
        ['UPI ID', d.upiId || 'N/A'],
        ['Payout Transaction / UTR Ref', d.payoutTxnId || d.paymentProof || 'Direct Settlement'],
        ['Payout Mode', d.payoutMethod || 'Direct Bank Transfer (IMPS/NEFT)'],
        ['Settlement Status', 'Successfully Credited & Settled ✅']
      ])}
      <p style="margin-top:20px;color:#2e7d32;font-weight:600;font-size:14px">
        ✓ The Dakshina amount has been credited to your bank account. Thank you for rendering your sacred Vedic service!
      </p>
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
  const cleanTo = String(to || '').trim().toLowerCase();
  if (!cleanTo) throw new Error('Recipient email missing');
  if (!process.env.SENDER_EMAIL || !process.env.APP_PASSWORD) throw new Error('Email credentials not configured');
  const { subject, html } = tpl(data);
  const from = (process.env.EMAIL_FROM || process.env.SENDER_EMAIL).replace(/^["']|["']$/g, '').trim();
  return getTransporter().sendMail({
    from,
    to: cleanTo,
    subject,
    html
  });
}

// Reliable email sender that doesn't break the caller if SMTP fails
async function sendSafe(type, to, data) {
  try {
    const info = await sendTemplate(type, to, data);
    console.log(`[email:${type}] Sent successfully to ${to} (id: ${info ? info.messageId : 'ok'})`);
    return { ok: true, messageId: info ? info.messageId : '' };
  } catch (e) {
    console.error(`[email:${type}] Failed sending to ${to}:`, e.message);
    return { ok: false, error: e.message };
  }
}

module.exports = { sendTemplate, sendSafe, TEMPLATES };
