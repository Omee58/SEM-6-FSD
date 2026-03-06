const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

app.get('/health', (req, res) => res.json({ success: true, message: 'ShadiSeva v2 Backend Running' }));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/client', require('./routes/client.routes'));
app.use('/api/vendor', require('./routes/vendor.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/reviews', require('./routes/review.routes'));

app.use('/{*splat}', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map(e => e.message).join(', ');
    return res.status(400).json({ success: false, message: msg });
  }
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

module.exports = app;
