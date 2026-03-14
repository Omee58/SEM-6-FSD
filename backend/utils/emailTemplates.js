const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const BASE_STYLE = `
  font-family: 'Inter', Arial, sans-serif;
  max-width: 600px; margin: 0 auto; background: #FAFAF8;
`;
const HEADER = `
  <div style="background: linear-gradient(135deg,#BE185D,#9D174D); padding: 32px 40px; text-align:center; border-radius:12px 12px 0 0;">
    <h1 style="color:#fff; font-size:26px; margin:0; letter-spacing:-0.5px;">💍 ShadiSeva</h1>
    <p style="color:rgba(255,255,255,0.8); margin:4px 0 0; font-size:13px;">India's Wedding Marketplace</p>
  </div>
`;
const FOOTER = `
  <div style="padding:20px 40px; text-align:center; color:#A8A8A2; font-size:12px; border-top:1px solid #E8E8E4;">
    <p style="margin:0">© 2026 ShadiSeva · Made with love in India 🇮🇳</p>
  </div>
`;

const wrap = (content) => `
<div style="${BASE_STYLE}">
  ${HEADER}
  <div style="background:#fff; padding:32px 40px; border-radius:0 0 12px 12px; border:1px solid #E8E8E4; border-top:none;">
    ${content}
  </div>
  ${FOOTER}
</div>`;

const btn = (text, url) =>
  `<a href="${url}" style="display:inline-block;background:#BE185D;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:16px;">${text}</a>`;

const row = (label, value) =>
  `<tr><td style="padding:8px 12px;color:#6B6B65;font-size:13px;white-space:nowrap;">${label}</td><td style="padding:8px 12px;color:#1A1A18;font-size:13px;font-weight:500;">${value}</td></tr>`;

module.exports = {
  bookingRequestEmail: (vendorName, clientName, serviceName, date, amount) => wrap(`
    <h2 style="color:#1A1A18;font-size:20px;margin:0 0 8px;">New Booking Request 📋</h2>
    <p style="color:#6B6B65;margin:0 0 20px;">Hi <strong>${vendorName}</strong>, you have a new booking request!</p>
    <table style="width:100%;border-collapse:collapse;background:#FAFAF8;border-radius:8px;overflow:hidden;">
      ${row('Client', clientName)}
      ${row('Service', serviceName)}
      ${row('Date', date)}
      ${row('Amount', amount)}
    </table>
    <p style="color:#6B6B65;font-size:13px;margin-top:20px;">Please log in to your dashboard to confirm or reject this request.</p>
    ${btn('View Booking', `${BASE_URL}/vendor/bookings`)}
  `),

  bookingConfirmedEmail: (clientName, serviceName, vendorName, date) => wrap(`
    <h2 style="color:#16A34A;font-size:20px;margin:0 0 8px;">Booking Confirmed! 🎉</h2>
    <p style="color:#6B6B65;margin:0 0 20px;">Hi <strong>${clientName}</strong>, your booking has been confirmed!</p>
    <table style="width:100%;border-collapse:collapse;background:#FAFAF8;border-radius:8px;overflow:hidden;">
      ${row('Service', serviceName)}
      ${row('Vendor', vendorName)}
      ${row('Date', date)}
      ${row('Status', '<span style="color:#16A34A;font-weight:700;">Confirmed ✓</span>')}
    </table>
    <p style="color:#6B6B65;font-size:13px;margin-top:20px;">Your wedding day is getting closer! View your booking details in your dashboard.</p>
    ${btn('View My Bookings', `${BASE_URL}/bookings`)}
  `),

  bookingRejectedEmail: (clientName, serviceName, vendorName) => wrap(`
    <h2 style="color:#DC2626;font-size:20px;margin:0 0 8px;">Booking Update</h2>
    <p style="color:#6B6B65;margin:0 0 20px;">Hi <strong>${clientName}</strong>, unfortunately your booking request was not confirmed.</p>
    <table style="width:100%;border-collapse:collapse;background:#FAFAF8;border-radius:8px;overflow:hidden;">
      ${row('Service', serviceName)}
      ${row('Vendor', vendorName)}
      ${row('Status', '<span style="color:#DC2626;font-weight:700;">Not Available</span>')}
    </table>
    <p style="color:#6B6B65;font-size:13px;margin-top:20px;">Don't worry — there are many other great vendors available. Browse alternatives below.</p>
    ${btn('Browse Services', `${BASE_URL}/services`)}
  `),

  vendorApprovedEmail: (vendorName) => wrap(`
    <h2 style="color:#16A34A;font-size:20px;margin:0 0 8px;">You're Verified! ✅</h2>
    <p style="color:#6B6B65;margin:0 0 20px;">Congratulations <strong>${vendorName}</strong>! Your vendor account has been approved by our team.</p>
    <p style="color:#1A1A18;font-size:14px;margin:0 0 16px;">You can now:</p>
    <ul style="color:#6B6B65;font-size:13px;padding-left:20px;line-height:1.8;">
      <li>Add your services to reach thousands of couples</li>
      <li>Manage bookings from your dashboard</li>
      <li>Track your earnings with detailed analytics</li>
    </ul>
    ${btn('Go to Dashboard', `${BASE_URL}/vendor/dashboard`)}
  `),

  vendorRejectedEmail: (vendorName, reason) => wrap(`
    <h2 style="color:#1A1A18;font-size:20px;margin:0 0 8px;">Application Update</h2>
    <p style="color:#6B6B65;margin:0 0 20px;">Hi <strong>${vendorName}</strong>, we've reviewed your vendor application.</p>
    <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="color:#DC2626;margin:0;font-size:13px;"><strong>Status:</strong> Not Approved</p>
      ${reason ? `<p style="color:#7F1D1D;margin:8px 0 0;font-size:13px;"><strong>Reason:</strong> ${reason}</p>` : ''}
    </div>
    <p style="color:#6B6B65;font-size:13px;">You may re-apply after addressing the feedback. Contact us at hello@shadiseva.com for help.</p>
  `),

  passwordResetEmail: (name, resetUrl) => wrap(`
    <h2 style="color:#1A1A18;font-size:20px;margin:0 0 8px;">Reset Your Password 🔐</h2>
    <p style="color:#6B6B65;margin:0 0 20px;">Hi <strong>${name}</strong>, we received a request to reset your ShadiSeva password.</p>
    <p style="color:#6B6B65;font-size:13px;margin:0 0 20px;">Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
    ${btn('Reset Password', resetUrl)}
    <p style="color:#A8A8A2;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
  `),

  reviewReminderEmail: (clientName, serviceName) => wrap(`
    <h2 style="color:#D97706;font-size:20px;margin:0 0 8px;">How was your experience? ⭐</h2>
    <p style="color:#6B6B65;margin:0 0 20px;">Hi <strong>${clientName}</strong>, your <strong>${serviceName}</strong> service has been completed!</p>
    <p style="color:#1A1A18;font-size:14px;margin:0 0 16px;">Your review helps other couples make better decisions and rewards great vendors. It only takes 30 seconds!</p>
    ${btn('Write a Review', `${BASE_URL}/bookings`)}
  `),
};
