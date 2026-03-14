const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { getAllServices, bookService, getClientBookings, cancelBooking, getVendorPublicProfile, toggleWishlist, getWishlist } = require('../controllers/client.controller');

const clientMiddleware = (req, res, next) => {
  if (req.user.role !== 'client')
    return res.status(403).json({ success: false, message: 'Client access only' });
  next();
};

// Public routes — no auth required
router.get('/services', getAllServices);
router.get('/vendors/:vendorId', getVendorPublicProfile);

// Protected routes
router.post('/bookings', authMiddleware, clientMiddleware, bookService);
router.get('/bookings', authMiddleware, clientMiddleware, getClientBookings);
router.patch('/bookings/:bookingId/cancel', authMiddleware, clientMiddleware, cancelBooking);
router.post('/wishlist/:serviceId', authMiddleware, clientMiddleware, toggleWishlist);
router.get('/wishlist', authMiddleware, clientMiddleware, getWishlist);

module.exports = router;
