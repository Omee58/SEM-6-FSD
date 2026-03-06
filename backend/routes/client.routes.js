const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { getAllServices, bookService, getClientBookings, cancelBooking } = require('../controllers/client.controller');

const clientMiddleware = (req, res, next) => {
  if (req.user.role !== 'client')
    return res.status(403).json({ success: false, message: 'Client access only' });
  next();
};

// Public route — no auth required (for landing page featured services)
router.get('/services', getAllServices);

// Protected routes
router.post('/bookings', authMiddleware, clientMiddleware, bookService);
router.get('/bookings', authMiddleware, clientMiddleware, getClientBookings);
router.patch('/bookings/:bookingId/cancel', authMiddleware, clientMiddleware, cancelBooking);

module.exports = router;
