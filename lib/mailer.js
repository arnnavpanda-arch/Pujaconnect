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
  PANDIT_NEW_BOOKING: (d) => {
    const mainFee = Number(d.fee || d.totalPujaCost) || 1500;
    const feePct = Number(d.adminFeePercent !== undefined ? d.adminFeePercent : 10);
    const adminCut = Number(d.adminFeeAmount !== undefined ? d.adminFeeAmount : (d.adminFee !== undefined ? d.adminFee : Math.round((mainFee * feePct) / 100)));
    const netDakshina = Number(d.netDakshina !== undefined ? d.netDakshina : (d.panditFee !== undefined ? d.panditFee : Math.max(0, mainFee - adminCut)));

    return {
      subject: `New Ceremony Offer – ${d.service || ''} (Total Puja Cost: ${inr(mainFee)} | Pandit Fee: ${inr(netDakshina)}) | PujaConnect`,
      html: layout('New Sacred Ceremony Assignment Offer 🙏', `
        <p>Pranam <strong>${esc(d.panditName || 'Pandit ji')}</strong>,</p>
        <p>You have received a new ceremony assignment request from PujaConnect Administration. Please review the complete ceremony details and Dakshina payout terms below:</p>
        
        <div style="background:#fff8ed;border:1.5px solid #ebd9c2;border-left:5px solid #d99a19;padding:16px 20px;border-radius:8px;margin:18px 0;font-size:14px;line-height:1.6">
          <div style="font-weight:700;color:#351605;font-size:15px;margin-bottom:10px">💰 Dakshina &amp; Payout Terms:</div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr>
              <td style="padding:6px 0;color:#5a3825"><strong>Total Puja Cost:</strong></td>
              <td style="padding:6px 0;text-align:right;font-size:15px;color:#2e1305"><strong>${inr(mainFee)}</strong></td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#c62828"><strong>Admin Fee (${feePct}%):</strong></td>
              <td style="padding:6px 0;text-align:right;color:#c62828"><strong>-${inr(adminCut)} (${feePct}%)</strong></td>
            </tr>
            <tr style="border-top:1.5px dashed #d99a19">
              <td style="padding:8px 0 4px;color:#2e7d32;font-size:15px"><strong>Pandit Fee (Net Payable):</strong></td>
              <td style="padding:8px 0 4px;text-align:right;color:#2e7d32;font-size:16.5px"><strong>${inr(netDakshina)}</strong></td>
            </tr>
          </table>
          <p style="margin:10px 0 0;font-size:12.5px;color:#7a553e">
            Your net Pandit Fee of <strong>${inr(netDakshina)}</strong> will be directly credited to your registered bank / UPI account within 24 hours after devotee payment verification.
          </p>
        </div>

        <h3 style="font-family:Georgia,serif;color:#351605;margin:22px 0 10px;font-size:16px">Ceremony &amp; Fee Details:</h3>
        ${rows([
          ['Booking ID', d.bookingId],
          ['Sacred Ritual', d.service],
          ['Devotee (Customer) Name', d.userName],
          ['Customer Phone', d.phone || d.userPhone],
          ['Ceremony Date', d.date],
          ['Ceremony Time Slot', d.time],
          ['Ceremony District', d.district],
          ['Venue / Address', d.address || d.district],
          ['Total Puja Cost', inr(mainFee)],
          ['Admin Fee', `${inr(adminCut)} (${feePct}%)`],
          ['Pandit Fee', `${inr(netDakshina)} (Net Payable to Pandit)`],
          ['Assignment Status', 'Offered – Please Log in to Accept Ceremony']
        ])}
        <p style="margin-top:22px;font-size:13.5px">
          Please log in to your <strong>Pandit Dashboard</strong> to accept this ceremony assignment.
        </p>
      `)
    };
  },
  PANDIT_CONFIRMED_BOOKING: (d) => TEMPLATES.BOOKING_CONFIRMATION(d),
  PANDIT_REJECTED_BOOKING: (d) => ({
    subject: `Ceremony Update – Reassigning Pandit for ${d.service || ''} (${d.bookingId || ''}) | PujaConnect`,
    html: layout('Ceremony Assignment Update 🙏', `
      <p>Namaste <strong>${esc(d.userName || 'Devotee')}</strong>,</p>
      <p>We are currently reassigning a verified Vedic Pandit for your sacred ceremony <strong>${esc(d.service || 'Ceremony')}</strong> on <strong>${esc(d.date)}</strong> in <strong>${esc(d.district)}</strong>. You will receive an update as soon as the new Pandit confirms.</p>
    `)
  }),
  PAYMENT_REJECTED: (d) => {
    const feeAmt = Number(d.fee || d.amount) || 1500;
    return {
      subject: `Payment Verification Unsuccessful – Action Required for ${d.service || 'Ceremony'} (${d.bookingId || ''}) | PujaConnect`,
      html: layout('Payment Verification Unsuccessful ⚠️', `
        <p>Namaste <strong>${esc(d.userName || 'Devotee')}</strong>,</p>
        <p>We could not verify the payment proof submitted for your ceremony <strong>${esc(d.service || 'Ritual')}</strong> (Booking ID: <strong>${esc(d.bookingId)}</strong>).</p>
        
        <div style="background:#ffebee;border:1.5px solid #ffcdd2;border-left:5px solid #d32f2f;padding:16px;border-radius:8px;margin:18px 0;font-size:14px;color:#b71c1c;line-height:1.6">
          <strong>Reason for Rejection:</strong><br>
          ${esc(d.reason || 'Transaction reference could not be verified in bank records.')}
        </div>

        <div style="background:#fff8ed;border:1px solid #ebd9c2;padding:14px 16px;border-radius:8px;margin:16px 0;font-size:13.5px;color:#3b2115">
          <strong>Ceremony Dakshina:</strong> ${inr(feeAmt)}<br>
          ${d.paymentProof ? `<strong>Submitted Reference:</strong> <code>${esc(d.paymentProof)}</code><br>` : ''}
          <strong>Next Step:</strong> Please log in to your <strong>Devotee Dashboard</strong> and repay / re-submit your valid transaction reference (UTR or UPI Ref) to confirm your ceremony booking.
        </div>

        <p style="margin-top:22px">
          <a href="${esc(d.appUrl || 'https://pujaconnect.in')}" style="display:inline-block;background:#351605;color:#ffd166;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:6px;font-size:14px">
            Log In &amp; Repay Dakshina
          </a>
        </p>
        <p style="margin-top:16px;font-size:13px;color:#777">
          If you have any questions or have already made the transfer, please reply to this email with your transaction screenshot.
        </p>
      `)
    };
  },
  BOOKING_SLOT_UNAVAILABLE_REBOOK: (d) => {
    const bookingId = d.bookingId || '';
    const userEmail = d.userEmail || '';
    const token = d.rebookToken || '';
    const rebookUrl = d.rebookUrl || d.appUrl || `https://pujaconnect-one.vercel.app/?action=rebook&bookingId=${encodeURIComponent(bookingId)}&email=${encodeURIComponent(userEmail)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;

    return {
      subject: `Booking Request Rejected (Slot Unavailable) – Rebook Your Ceremony (${d.service || 'Puja'} - ${bookingId}) | PujaConnect`,
      html: layout('Ceremony Request Rejected – Rebook Your Slot 🙏', `
        <p>Namaste <strong>${esc(d.userName || 'Devotee')}</strong>,</p>
        <p>We are reaching out regarding your ritual booking request for <strong>${esc(d.service || 'Puja')}</strong> (Booking ID: <strong>${esc(bookingId)}</strong>).</p>
        
        <div style="background:#fff3e0;border:1.5px solid #ffcc80;border-left:5px solid #e65100;padding:16px;border-radius:8px;margin:18px 0;font-size:14px;color:#bf360c;line-height:1.6">
          <strong>⚠️ Puja Booking Request Status: Rejected (Slot Unavailable)</strong><br>
          Unfortunately, no verified Vedic Pandit is currently available in <strong>${esc(d.district)}</strong> for your requested time slot on <strong>${esc(d.date)} (${esc(d.time)})</strong>.<br>
          <span style="font-size:12.5px;color:#8d2800;display:inline-block;margin-top:4px"><em>Reason: ${esc(d.rejectionReason || d.reason || 'No verified Vedic Pandit available for this time slot.')}</em></span>
        </div>

        <p style="margin-top:16px;font-size:14.5px;line-height:1.5;color:#351605">
          <strong>Good news: You can easily rebook your sacred ceremony!</strong><br>
          Click the button below to directly open your Devotee Dashboard. All your ceremony details (puja, district, venue address, and contact details) are pre-filled so you can select another convenient ceremony date and time slot in just a few clicks.
        </p>

        ${rows([
          ['Booking ID', bookingId],
          ['Ritual', d.service],
          ['Requested District', d.district],
          ['Requested Date', d.date],
          ['Requested Slot', d.time],
          ['Venue / Address', d.address || d.district],
          ['Estimated Dakshina', d.fee ? inr(d.fee) : ''],
          ['Status', 'Rejected (Slot Unavailable) – Rebooking Open']
        ])}

        <div style="text-align:center;margin:32px 0 20px">
          <a href="${esc(rebookUrl)}" class="click-here-to-rebook-btn" style="display:inline-block;background:#e65100;background:linear-gradient(135deg, #e65100 0%, #b71c1c 100%);color:#ffffff !important;text-decoration:none;font-weight:700;padding:16px 36px;border-radius:8px;font-size:16px;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(230,81,0,0.35)">
            👉 Click Here to Rebook
          </a>
        </div>
        <div style="text-align:center;margin-bottom:12px;font-size:12px;color:#777">
          Direct link: <a href="${esc(rebookUrl)}" style="color:#d99a19;word-break:break-all">${esc(rebookUrl)}</a>
        </div>

        <p style="margin-top:20px;font-size:13px;color:#777">
          If you need a specific date or have custom requirements, simply reply directly to this email and our temple coordination team will assist you.
        </p>
      `)
    };
  },
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
  PANDIT_PAYMENT_VERIFIED_NOTICE: (d) => {
    const mainFee = Number(d.totalAmount || d.amount || d.fee) || 1500;
    const feePct = Number(d.adminFeePercent !== undefined ? d.adminFeePercent : 10);
    const adminCut = Number(d.adminFeeAmount !== undefined ? d.adminFeeAmount : Math.round((mainFee * feePct) / 100));
    const netDakshina = Number(d.netAmount !== undefined ? d.netAmount : (d.panditPayoutAmount || Math.max(0, mainFee - adminCut)));

    return {
      subject: `Customer Paid Dakshina: ${inr(netDakshina)} Net Credited within 24h – Booking ${d.bookingId || ''}`,
      html: layout('Customer Payment Received 🙏', `
        <p>Pranam <strong>${esc(d.panditName || 'Pandit ji')}</strong>,</p>
        <div style="background:#fff8ed;border:1.5px solid #ebd9c2;border-left:5px solid #d99a19;padding:16px;border-radius:8px;margin:16px 0;font-size:15px;line-height:1.6;color:#3b2115">
          The user has paid the money. <strong>Your net money amount ${inr(netDakshina)} (after ${feePct}% Admin Platform Charge of ${inr(adminCut)}) is to be credited to your account number ${esc(d.bankAccount || 'Registered Bank Account')} within 24 Hours.</strong>
        </div>
        <h3 style="font-family:Georgia,serif;color:#351605;margin:22px 0 10px;font-size:16.5px">Complete Customer, Ceremony &amp; Payout Details:</h3>
        ${rows([
          ['Booking ID', d.bookingId],
          ['Sacred Ritual', d.service],
          ['Devotee (Customer) Name', d.userName],
          ['Customer Phone Number', d.phone || d.userPhone],
          ['Customer Email Address', d.userEmail],
          ['Ceremony Date', d.date],
          ['Ceremony Time Slot', d.time],
          ['Ceremony Venue / District', d.address || d.district],
          ['Total Customer Dakshina', inr(mainFee)],
          [`Admin Platform Charge (${feePct}%)`, `-${inr(adminCut)} (${feePct}%)`],
          ['Net Dakshina to be Credited', inr(netDakshina)],
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
          ${d.bankAccount ? `Your Net Dakshina will be directly transferred to your bank account <strong>${esc(d.bankAccount)}</strong> (${esc(d.bankName || 'Bank')}). You will receive an immediate confirmation email once transferred.` : `<em>Note: If you have not yet provided your bank details or UPI QR code, please log in to your Pandit Dashboard and update your Bank &amp; Payout Account immediately.</em>`}
        </p>
      `)
    };
  },
  PANDIT_PAYMENT_CREDITED: (d) => {
    const creditedAmt = Number(d.amount) || 1350;
    const mainFee = Number(d.mainFee || d.total || d.fee || (d.amount ? Math.round(d.amount / 0.9) : 1500));
    const feePct = Number(d.adminFeePercent !== undefined ? d.adminFeePercent : 10);
    const adminCut = Number(d.adminFeeAmount !== undefined ? d.adminFeeAmount : Math.max(0, mainFee - creditedAmt));

    return {
      subject: `Dakshina Payment Credited: ${inr(creditedAmt)} to Account ${d.bankAccount || ''} – Booking ${d.bookingId || ''}`,
      html: layout('Dakshina Credited to Your Account 💰', `
        <p>Pranam <strong>${esc(d.panditName || 'Pandit ji')}</strong>,</p>
        <div style="background:#e8f5e9;border:1.5px solid #c8e6c9;border-left:5px solid #2e7d32;padding:16px;border-radius:8px;margin:16px 0;font-size:15px;line-height:1.6;color:#1b5e20">
          <strong>Your net money amount ${inr(creditedAmt)} (after ${feePct}% Admin Platform Fee of ${inr(adminCut)}) is credited to your account number ${esc(d.bankAccount || 'Registered Bank Account')}.</strong>
        </div>
        <h3 style="font-family:Georgia,serif;color:#351605;margin:22px 0 10px;font-size:16.5px">Complete Payment, Fee Deduction &amp; Ceremony Details:</h3>
        ${rows([
          ['Booking ID', d.bookingId],
          ['Sacred Ritual', d.service],
          ['Devotee (Customer) Name', d.userName],
          ['Customer Phone Number', d.phone || d.userPhone],
          ['Customer Email Address', d.userEmail],
          ['Ceremony Date', d.date],
          ['Ceremony Time Slot', d.time],
          ['Ceremony Venue / District', d.address || d.district],
          ['Total Customer Dakshina', inr(mainFee)],
          [`Admin Platform Fee (${feePct}%)`, `-${inr(adminCut)} (${feePct}%)`],
          ['Net Amount Credited', inr(creditedAmt)],
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
    };
  },
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
  }),
  REGION_SERVICE_AVAILABLE: (d) => ({
    subject: `Pandit Services Are Now Available in ${esc(d.district || d.location || 'Your Region')}! 🕉️ | PujaConnect`,
    html: layout(`Puja Services Are Now Live in ${esc(d.district || 'Your Region')} 🙏`, `
      <p>Namaste <strong>${esc(d.userName || 'Devotee')}</strong>,</p>
      <div style="background:#e8f5e9;border:1.5px solid #a5d6a7;border-left:5px solid #2e7d32;padding:16px;border-radius:8px;margin:16px 0;font-size:15px;line-height:1.6;color:#1b5e20">
        <strong>Great news! Authentic Vedic Pandit services have officially launched in your area: ${esc(d.district || d.location)}${d.state ? ', ' + esc(d.state) : ''}.</strong>
      </div>
      <p>As you were subscribed for service availability updates at <strong>${esc(d.email)}</strong>, we are thrilled to inform you that verified Vedic Pandits and Acharyas are now onboarded, verified, and ready to perform sacred rituals at your home.</p>
      ${rows([
        ['Region / District', d.district || d.location],
        ['State', d.state || 'India'],
        ['Available Rituals', 'Satyanarayan Puja, Griha Pravesh, Rudrabhishek, Ganesh Puja & More'],
        ['Fixed District Dakshina', d.fee ? inr(d.fee) : 'Standard Fixed Vedic Dakshina'],
        ['Service Status', 'Active & Available for Booking ✅']
      ])}
      <p style="margin-top:20px;font-size:14px">
        Your Devotee Dashboard features (My Bookings, Payment Tracking, Explore All Pujas, Multi-Day Yajnas, My Profile) have been fully unlocked. You can now browse all rituals, check Dakshina rates, and schedule your auspicious ceremony anytime.
      </p>
      <div style="text-align:center;margin:24px 0">
        <a href="${esc(d.portalUrl || 'https://pujaconnect.com')}" style="background:#d99a19;color:#fff;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">Book a Sacred Ceremony Now</a>
      </div>
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
