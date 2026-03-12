const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const {
  getAdminProfile, getVendorRequests, acceptVendorRequest, rejectVendorRequest,
  getAllUsers, getAllBookings, getStats, getAllReviews, deleteReview,
} = require('../controllers/admin.controller');
const { updateProfile } = require('../controllers/auth.controller');

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Admin access only' });
  next();
};

router.use(authMiddleware, adminMiddleware);

router.get('/profile', getAdminProfile);
router.put('/profile', updateProfile);
router.get('/vendor-requests', getVendorRequests);
router.patch('/vendor-requests/:vendorId/accept', acceptVendorRequest);
router.patch('/vendor-requests/:vendorId/reject', rejectVendorRequest);
router.get('/users', getAllUsers);
router.get('/bookings', getAllBookings);
router.get('/stats', getStats);

// Reviews
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
