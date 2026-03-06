const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { addReview, getServiceReviews, getReviewableBookings } = require('../controllers/review.controller');

// Static routes first (before param routes)
router.get('/my-reviewable', authMiddleware, getReviewableBookings);

// Param routes (public read, auth required for write)
router.get('/:serviceId', getServiceReviews);
router.post('/:serviceId', authMiddleware, addReview);

module.exports = router;
