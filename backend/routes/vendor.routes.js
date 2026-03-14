const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { uploadRateLimit } = require('../middleware/upload.middleware');
const {
  getVendorProfile, addService, getMyServices, updateService, deleteService,
  getServiceById, getBookingRequests, getAllVendorBookings, changeBookingStatus,
  getVendorEarnings, getAvailability, toggleBlockedDate
} = require('../controllers/vendor.controller');

const vendorOnly = [authMiddleware, (req, res, next) => {
  if (req.user.role !== 'vendor')
    return res.status(403).json({ success: false, message: 'Vendor access only' });
  next();
}];

// Public routes (no auth) — must come before any param routes
router.get('/availability', getAvailability);

// Vendor-only routes that could conflict with /:serviceId — declare first
router.get('/services/mine', ...vendorOnly, getMyServices);

// Service by ID (public) — after static routes to avoid swallowing /mine
router.get('/services/:serviceId', getServiceById);

// Remaining vendor-only routes
router.get('/profile', ...vendorOnly, getVendorProfile);
router.get('/earnings', ...vendorOnly, getVendorEarnings);
router.patch('/availability/block', ...vendorOnly, toggleBlockedDate);
router.get('/bookings/requests', ...vendorOnly, getBookingRequests);
router.get('/bookings', ...vendorOnly, getAllVendorBookings);
router.patch('/bookings/:bookingId/status', ...vendorOnly, changeBookingStatus);
router.post('/services', ...vendorOnly, uploadRateLimit, upload.array('images', 5), addService);
router.put('/services/:serviceId', ...vendorOnly, uploadRateLimit, upload.array('images', 5), updateService);
router.delete('/services/:serviceId', ...vendorOnly, deleteService);

module.exports = router;
