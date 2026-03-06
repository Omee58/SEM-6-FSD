const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    // Email not configured — log silently and skip
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'ShadiSeva <noreply@shadiseva.com>',
      to,
      subject,
      html,
    });
  } catch (err) {
    // Non-fatal — don't crash the request if email fails
    console.error('Email send failed:', err.message);
  }
};

module.exports = sendEmail;
