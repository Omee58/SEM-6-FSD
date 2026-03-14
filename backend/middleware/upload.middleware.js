const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Simple in-memory upload rate limiter: max 20 uploads per user per 60 seconds
const uploadCounts = new Map();
const UPLOAD_LIMIT = 20;
const UPLOAD_WINDOW_MS = 60 * 1000;

const uploadRateLimit = (req, res, next) => {
  const key = req.user?._id?.toString() || req.ip;
  const now = Date.now();
  const entry = uploadCounts.get(key);

  if (!entry || now - entry.start > UPLOAD_WINDOW_MS) {
    uploadCounts.set(key, { count: 1, start: now });
    return next();
  }
  if (entry.count >= UPLOAD_LIMIT) {
    return res.status(429).json({ success: false, message: 'Too many uploads. Please wait a minute and try again.' });
  }
  entry.count += 1;
  next();
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shadiseva',
    allowed_formats: ['jpeg', 'jpg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: 'limit' }],
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  if (allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = upload;
module.exports.uploadRateLimit = uploadRateLimit;
