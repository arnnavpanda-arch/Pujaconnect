require('dotenv').config();
const nodemailer = require('nodemailer');

let transporter = null;
function getTransporter() {
  const user = (process.env.SENDER_EMAIL || '').trim();
  const pass = (process.env.APP_PASSWORD || '').replace(/\s+/g, '').trim();
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use direct SSL for fastest & most reliable handshake
      auth: { user, pass },
      pool: true,
      maxConnections: 3,
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 25000,
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
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${esc(title)}</title>
  <style type="text/css">
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; min-width: 100% !important; background-color: #fbf6ee; -webkit-font-smoothing: antialiased; }
    .email-outer-table { width: 100% !important; min-width: 100% !important; }
    .email-main-card { width: 100% !important; }
    @media only screen and (max-width: 600px) {
      .email-cell-pad { padding: 16px 14px !important; }
      .email-hdr-pad { padding: 18px 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;width:100% !important;min-width:100% !important;background-color:#fbf6ee;font-family:'Segoe UI',Roboto,-apple-system,BlinkMacSystemFont,Inter,Arial,sans-serif;color:#2b1406;line-height:1.65;">
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" class="email-outer-table" style="width:100% !important;min-width:100% !important;background-color:#fbf6ee;margin:0;padding:24px 0;">
    <tr>
      <td align="center" style="padding:0 20px;" class="email-cell-pad">
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" class="email-main-card" style="width:100% !important;background:#ffffff;border:1.5px solid #ebd9c2;border-radius:14px;box-shadow:0 8px 30px rgba(53,22,5,0.06);margin:0;">
          <tr>
            <td class="email-hdr-pad" style="background:#351605;color:#ffd166;padding:22px 32px;border-top-left-radius:12px;border-top-right-radius:12px;border-bottom:3px solid #d99a19;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td align="left" style="font-family:Georgia,serif;font-size:24px;font-weight:700;letter-spacing:1px;color:#ffd166;">
                    ॐ PujaConnect
                  </td>
                  <td align="right" style="font-family:'Segoe UI',Roboto,sans-serif;font-size:13px;color:#f3d69b;letter-spacing:0.04em;text-transform:uppercase;font-weight:600;">
                    Vedic Ceremony &amp; Purohit Services
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="email-cell-pad" style="padding:32px 36px;color:#3b2115;line-height:1.65;">
              <h1 style="font-family:Georgia,serif;margin:0 0 16px;color:#2b1406;font-size:23px;font-weight:700;">${esc(title)}</h1>
              ${body}
              <div style="margin-top:36px;color:#8a6a55;font-size:13.5px;border-top:1.5px solid #ebd9c2;padding-top:20px;line-height:1.6;">
                With divine blessings,<br>
                <strong style="color:#351605;font-size:14.5px;">PujaConnect Spiritual Advisory Board</strong><br>
                <span style="font-size:12px;color:#9b7a65;">Authentic Lineage-Verified Vedic Scholars &amp; Sacred Rituals</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const rows = (pairs) => `
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;background:#ffffff;border:1px solid #ebd9c2;border-radius:8px;">
    ${pairs.filter((p) => p[1] !== undefined && p[1] !== '').map(([k, v], idx) => `
      <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#fffcf7'};border-bottom:1px solid #f4e8d8;">
        <td style="padding:12px 18px;color:#7a553e;font-size:13.5px;font-weight:600;width:30%;vertical-align:top;border-right:1px solid #f4e8d8;">${esc(k)}</td>
        <td style="padding:12px 18px;color:#2b1406;font-size:14px;vertical-align:top;"><strong>${esc(v)}</strong></td>
      </tr>
    `).join('')}
  </table>
`;

function renderLocationScholarsReport(loc) {
  if (!loc || !loc.district) return '';
  const dist = loc.district;
  const state = loc.state || 'Odisha';
  const pandits = Array.isArray(loc.pandits) ? loc.pandits : [];
  const total = loc.totalPandits !== undefined ? loc.totalPandits : pandits.length;
  const minP = loc.minPrice || (pandits.length ? Math.min(...pandits.map(x => x.districtRate)) : 1500);
  const maxP = loc.maxPrice || (pandits.length ? Math.max(...pandits.map(x => x.districtRate)) : 1500);

  return `
    <div style="margin-top:32px;padding-top:24px;border-top:2px solid #d99a19;width:100%;">
      <div style="background:#fffcf5;border:1.5px solid #ebd9c2;border-radius:10px;padding:22px 24px;margin-bottom:20px;width:100%;box-sizing:border-box;">
        <div style="font-size:12.5px;font-weight:700;color:#b85d19;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px">
          📍 Official Local Area Vedic Report (Devotee Registered Location)
        </div>
        <h3 style="margin:0 0 10px;font-size:20px;color:#351605;font-family:Georgia,serif">
          Verified Vedic Scholars &amp; Rates for ${esc(dist)}, ${esc(state)}
        </h3>
        <p style="margin:0;font-size:14px;color:#6b4c35;line-height:1.6">
          Filtered for your registered account location (<strong>${esc(dist)}, ${esc(state)}</strong>). Here is the complete official availability report of verified Vedic Scholars and fixed Dakshina rates serving your area:
        </p>
        
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:16px;background:#ffffff;border:1px solid #ebd9c2;border-radius:8px;">
          <tr>
            <td style="padding:14px 20px;border-right:1px solid #ebd9c2;width:50%">
              <div style="font-size:11.5px;color:#8a6a55;text-transform:uppercase;font-weight:700">Total Verified Scholars in Area</div>
              <div style="font-size:22px;font-weight:800;color:#2b1406;margin-top:4px">${total} Verified Scholar${total === 1 ? '' : 's'}</div>
            </td>
            <td style="padding:14px 20px;width:50%">
              <div style="font-size:11.5px;color:#8a6a55;text-transform:uppercase;font-weight:700">District Dakshina Schedule</div>
              <div style="font-size:22px;font-weight:800;color:#2e7d32;margin-top:4px">
                ${minP === maxP ? inr(minP) : `${inr(minP)} – ${inr(maxP)}`}
              </div>
            </td>
          </tr>
        </table>
      </div>

      ${pandits.length ? `
        <div style="margin-bottom:14px;font-size:16px;font-weight:700;color:#351605">
          Verified Vedic Scholars Serving ${esc(dist)} &amp; Their Official Rates:
        </div>
        <div style="width:100%;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:1.5px solid #ebd9c2;background:#ffffff;font-size:14px;border-radius:8px;">
            <thead>
              <tr style="background:#fbf5ec;border-bottom:2px solid #d99a19">
                <th style="padding:14px 18px;text-align:left;color:#351605;font-size:12.5px;text-transform:uppercase;letter-spacing:0.04em;width:34%">Verified Scholar</th>
                <th style="padding:14px 18px;text-align:left;color:#351605;font-size:12.5px;text-transform:uppercase;letter-spacing:0.04em;width:28%">Specialty</th>
                <th style="padding:14px 18px;text-align:left;color:#351605;font-size:12.5px;text-transform:uppercase;letter-spacing:0.04em;width:18%">Experience</th>
                <th style="padding:14px 18px;text-align:right;color:#351605;font-size:12.5px;text-transform:uppercase;letter-spacing:0.04em;width:20%">District Rate (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${pandits.map(p => `
                <tr style="border-bottom:1px solid #ebd9c2">
                  <td style="padding:14px 18px;vertical-align:middle">
                    <strong style="color:#351605;font-size:15px">Pt. ${esc(p.name)}</strong>
                    <div style="font-size:11.5px;color:#2e7d32;font-weight:600;margin-top:3px">✓ Verified Vedic Scholar</div>
                  </td>
                  <td style="padding:14px 18px;vertical-align:middle;color:#5a3825">
                    ${esc(p.specialty || 'Vedic Rituals')}
                  </td>
                  <td style="padding:14px 18px;vertical-align:middle;color:#6b4c35">
                    ${esc(p.experience || '5+ Years Rigor')}
                  </td>
                  <td style="padding:14px 18px;vertical-align:middle;text-align:right">
                    <span style="font-size:17px;font-weight:800;color:#b85d19">${inr(p.districtRate)}</span>
                    <div style="font-size:11px;color:#8a6a55">Dakshina Fee</div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div style="background:#fffcf5;border:1px dashed #ebd9c2;border-radius:8px;padding:18px;text-align:center;font-size:14px;color:#7a553e">
          PujaConnect Administration auto-assigns verified Vedic Scholars from the regional center with standard fixed Dakshina for ${esc(dist)}.
        </div>
      `}
      <p style="margin:14px 0 0;font-size:12.5px;color:#8a6a55;font-style:italic">
        Note: The above transparent schedule is certified by PujaConnect Vedic Administration for ${esc(dist)} District. All Dakshina rates are fixed and verified.
      </p>
    </div>
  `;
}

const TEMPLATES = {
  BOOKING_REQUEST_RECEIVED: (d) => ({
    subject: `Booking Request Confirmed & Verified Scholars Report – ${d.bookingId || ''} (${d.district || ''}) | PujaConnect`,
    html: layout('Booking Request Confirmed 🙏', `
      <p>Namaste <strong>${esc(d.userName || 'Devotee')}</strong>,</p>
      <p>We have successfully received your ceremony booking request. Our team will verify pandit availability and assign an authentic verified Vedic Scholar for your sacred ritual.</p>
      
      <div style="font-size:14.5px;font-weight:700;color:#351605;margin:18px 0 6px">Ceremony Booking Details:</div>
      ${rows([
        ['Booking ID', d.bookingId],
        ['Ritual / Ceremony', d.service],
        ['Preferred Pandit', d.preferredPanditName || 'Any Available Verified Pandit'],
        ['Ceremony Date', d.date],
        ['Time Slot', d.time],
        ['Devotee District', d.district],
        ['Venue / Address', d.address || d.district],
        ['Estimated Dakshina', d.fee && d.fee > 0 ? inr(d.fee) : 'To be confirmed by Admin upon Pandit assignment'],
        ['Status', 'Booking Request Received – Assignment in Progress']
      ])}

      <div style="margin-top:20px;background:#fff8ed;border-left:4px solid #d99a19;padding:14px;border-radius:4px;font-size:13.5px;color:#3b2115">
        <strong>What happens next?</strong><br>
        PujaConnect is reviewing your requirement and assigning a verified Vedic Purohit for your area. Once the Pandit accepts the assignment, you will automatically receive an official confirmation email with the Pandit's details.
      </div>

      ${renderLocationScholarsReport(d.locationReport)}
    `)
  }),
  BOOKING_CONFIRMATION: (d) => {
    const portalUrl = d.portalUrl || d.appUrl || 'https://pujaconnect-one.vercel.app/#dashboard';
    return {
      subject: `Ceremony Confirmed 🙏 – ${d.bookingId || ''} | Pandit ${esc(d.panditName || 'Assigned')}`,
      html: layout('Your Ceremony is Confirmed 🙏', `
        <p>Namaste <strong>${esc(d.userName || 'Devotee')}</strong>,</p>
        <p>Great news! Your ritual booking has been confirmed. <strong>Pandit ${esc(d.panditName || 'Assigned Pandit')}</strong> has accepted the request and is confirmed for your sacred ceremony.</p>
        
        <div style="font-size:14.5px;font-weight:700;color:#351605;margin:18px 0 6px">Confirmed Ceremony Schedule:</div>
        ${rows([
          ['Booking ID', d.bookingId],
          ['Sacred Ritual', d.service],
          ['Devotee Registered Email', d.userEmail || ''],
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

        <div style="text-align:center;margin:28px 0 20px">
          <a href="${esc(portalUrl)}" style="display:inline-block;background:#d99a19;background:linear-gradient(135deg, #d99a19 0%, #b3740e 100%);color:#ffffff !important;text-decoration:none;font-weight:700;padding:14px 32px;border-radius:8px;font-size:15px;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(217,154,25,0.35)">
            👉 Open Devotee Dashboard on PujaConnect
          </a>
        </div>
        <div style="text-align:center;font-size:13px;color:#8a6a55;margin-bottom:14px">
          Official Platform Website: <a href="https://pujaconnect-one.vercel.app" style="color:#d99a19;font-weight:700;text-decoration:underline">https://pujaconnect-one.vercel.app</a>
        </div>

        ${renderLocationScholarsReport(d.locationReport)}
      `)
    };
  },
  PANDIT_NEW_BOOKING: (d) => {
    const mainFee = Number(d.fee || d.totalPujaCost) || 1500;
    const feePct = Number(d.adminFeePercent !== undefined ? d.adminFeePercent : 10);
    const adminCut = Number(d.adminFeeAmount !== undefined ? d.adminFeeAmount : (d.adminFee !== undefined ? d.adminFee : Math.round((mainFee * feePct) / 100)));
    const netDakshina = Number(d.netDakshina !== undefined ? d.netDakshina : (d.panditFee !== undefined ? d.panditFee : Math.max(0, mainFee - adminCut)));
    const bookingId = d.bookingId || '';
    const panditEmail = d.panditEmail || d.email || '';
    const token = d.panditToken || d.token || '';
    const baseUrl = d.baseUrl || 'https://pujaconnect-one.vercel.app';
    const acceptUrl = d.acceptUrl || `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(bookingId)}&email=${encodeURIComponent(panditEmail)}&decision=Accept${token ? `&token=${encodeURIComponent(token)}` : ''}`;
    const rejectUrl = d.rejectUrl || `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(bookingId)}&email=${encodeURIComponent(panditEmail)}&decision=Reject${token ? `&token=${encodeURIComponent(token)}` : ''}`;
    const reviewUrl = d.reviewUrl || `${baseUrl}/?action=pandit-decision&bookingId=${encodeURIComponent(bookingId)}&email=${encodeURIComponent(panditEmail)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;

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
          ['Booking ID', bookingId],
          ['Sacred Ritual', d.service],
          ['Devotee (Customer) Name', d.userName],
          ['Devotee Registered Email', d.userEmail || 'Registered Devotee Account'],
          ['Customer Phone', d.phone || d.userPhone || 'Available in Devotee Dashboard'],
          ['Ceremony Date', d.date],
          ['Ceremony Time Slot', d.time],
          ['Ceremony District', d.district],
          ['Venue / Address', d.address || d.district],
          ['Total Puja Cost', inr(mainFee)],
          ['Admin Fee', `${inr(adminCut)} (${feePct}%)`],
          ['Pandit Fee', `${inr(netDakshina)} (Net Payable to Pandit)`],
          ['Assignment Status', 'Offered – Please Accept or Decline via buttons below']
        ])}

        <div style="margin:28px 0;background:#ffffff;border:2px solid #ebd9c2;border-radius:12px;padding:24px 20px;text-align:center;">
          <div style="font-size:17px;font-weight:700;color:#351605;margin-bottom:8px;">
            Will you accept and perform this sacred ceremony?
          </div>
          <p style="font-size:14px;color:#7a553e;margin:0 0 20px;max-width:540px;margin-left:auto;margin-right:auto;">
            You can accept or decline this ceremony offer directly from this email. Clicking your choice will open your Pandit Dashboard on <strong>https://pujaconnect-one.vercel.app</strong>:
          </p>
          <div style="display:inline-flex;gap:14px;flex-wrap:wrap;justify-content:center;">
            <a href="${esc(acceptUrl)}" style="display:inline-block;background:#2e7d32;background:linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);color:#ffffff !important;text-decoration:none;font-weight:700;padding:15px 32px;border-radius:8px;font-size:15px;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(46,125,50,0.35);">
              ✅ Accept Ceremony (${inr(netDakshina)})
            </a>
            <a href="${esc(rejectUrl)}" style="display:inline-block;background:#c62828;background:linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);color:#ffffff !important;text-decoration:none;font-weight:700;padding:15px 28px;border-radius:8px;font-size:15px;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(211,47,47,0.3);">
              ❌ Decline / Reject Offer
            </a>
          </div>
          <div style="margin-top:16px;font-size:12.5px;color:#8a6a55;">
            Direct Portal: <a href="${esc(reviewUrl)}" style="color:#d99a19;font-weight:600;">Open in Pandit Dashboard</a> · Connected to <a href="https://pujaconnect-one.vercel.app" style="color:#d99a19;font-weight:600;">pujaconnect-one.vercel.app</a>
          </div>
        </div>
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
  REGION_SERVICE_AVAILABLE: (d) => {
    const loc = d.district || d.location || 'Your Region';
    const feeAmt = Number(d.fee || d.dakshina || 0);
    const pName = d.panditName || 'Verified Vedic Purohits & Acharyas';
    const email = d.email || '';

    return {
      subject: `✓ Auto-Notification: Pandits Now Available in ${esc(loc)} (Dakshina: ${feeAmt ? inr(feeAmt) : 'Fixed Rates'}) | PujaConnect`,
      html: layout(`Pandits Are Now Available in ${esc(loc)} 🙏`, `
        <p>Namaste <strong>${esc(d.userName || 'Devotee')}</strong>,</p>
        
        <div style="background:#e8f5e9;border:1.5px solid #a5d6a7;border-left:5px solid #2e7d32;padding:16px 20px;border-radius:8px;margin:18px 0;font-size:14.5px;line-height:1.6;color:#1b5e20">
          <strong>✓ Auto-Notification Subscribed Update:</strong><br>
          We are pleased to notify you at <strong>${esc(email)}</strong> that verified Vedic Pandits are now officially available in your location <strong>${esc(loc)}${d.state ? ', ' + esc(d.state) : ''}</strong>!
        </div>

        <div style="background:#fff8ed;border:1px solid #ebd9c2;border-left:4px solid #d99a19;padding:14px 18px;border-radius:8px;margin:16px 0;font-size:13.5px;color:#3b2115;line-height:1.6">
          <strong>Subscription Notice:</strong><br>
          <em>"✓ Auto-Notification Subscribed: We will notify <b>${esc(email)}</b> as soon as Pandits become available in <b>${esc(loc)}</b>."</em><br>
          As the admin has fixed the official Dakshina rate for your region, your Devotee Dashboard has now been <strong>fully unlocked</strong>.
        </div>

        <h3 style="font-family:Georgia,serif;color:#351605;margin:22px 0 10px;font-size:16.5px">Official Region &amp; Dakshina Rate Details:</h3>
        ${rows([
          ['Subscribed Devotee Email', email],
          ['Available Location / District', loc],
          ['State', d.state || 'India'],
          ['Assigned / Available Pandit', pName],
          ['Newly Fixed District Dakshina', feeAmt ? inr(feeAmt) : 'Official Fixed Dakshina'],
          ['Available Sacred Rituals', 'Satyanarayan Puja, Griha Pravesh, Rudrabhishek, Ganesh Puja & All Vedic Ceremonies'],
          ['Devotee Dashboard Status', 'Unlocked & Active ✅']
        ])}

        <p style="margin-top:20px;font-size:14px">
          You can now log in, explore all Pujas, check date/time availability, and schedule your auspicious ceremony directly.
        </p>

        <div style="text-align:center;margin:28px 0 20px">
          <a href="${esc(d.portalUrl || 'https://pujaconnect-one.vercel.app/#dashboard')}" style="display:inline-block;background:#d99a19;background:linear-gradient(135deg, #d99a19 0%, #b3740e 100%);color:#ffffff !important;text-decoration:none;font-weight:700;padding:14px 32px;border-radius:8px;font-size:15px;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(217,154,25,0.35)">
            👉 Open Devotee Dashboard &amp; Book Ceremony
          </a>
        </div>
      `)
    };
  }
};

async function sendTemplate(type, to, data = {}) {
  const tpl = TEMPLATES[type];
  if (!tpl) throw new Error('Unknown email template: ' + type);
  const cleanTo = String(to || '').trim().toLowerCase();
  if (!cleanTo) throw new Error('Recipient email missing');
  if (!process.env.SENDER_EMAIL || !process.env.APP_PASSWORD) throw new Error('Email credentials not configured');
  const { subject, html } = tpl(data);
  const from = (process.env.EMAIL_FROM || process.env.SENDER_EMAIL).replace(/^["']|["']$/g, '').trim();

  // Clean plain-text fallback for spam score minimization
  const text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                   .replace(/<[^>]+>/g, ' ')
                   .replace(/\s{2,}/g, ' ')
                   .trim();

  const mailOptions = {
    from,
    to: cleanTo,
    replyTo: (process.env.SENDER_EMAIL || '').trim(),
    subject,
    html,
    text,
    headers: {
      'X-Mailer': 'PujaConnect Notification Engine',
      'X-Priority': '1 (Highest)',
      'Importance': 'High'
    }
  };

  try {
    return await getTransporter().sendMail(mailOptions);
  } catch (err) {
    // Reset cached transporter so next attempt re-establishes fresh socket
    transporter = null;
    throw err;
  }
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
