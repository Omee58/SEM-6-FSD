const mongoose = require('mongoose');
const Review = require('../models/review.model');
const Service = require('../models/service.model');
const Booking = require('../models/booking.model');

// ─── POST /reviews/:serviceId ─────────────────────────────────────────────────

const addReview = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Only clients can submit reviews.',
        data: {},
      });
    }

    const { serviceId } = req.params;
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: 'rating is required.',
        data: {},
      });
    }

    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'rating must be between 1 and 5.',
        data: {},
      });
    }

    // Find a completed booking for this client + service
    const booking = await Booking.findOne({
      client: req.user._id,
      service: serviceId,
      status: 'completed',
    });

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: 'You can only review a service after a completed booking.',
        data: {},
      });
    }

    // Check no review already exists for this booking
    const existingReview = await Review.findOne({ booking: booking._id });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this booking.',
        data: {},
      });
    }

    // Verify the service exists and get vendor id
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
        data: {},
      });
    }

    const review = await Review.create({
      client: req.user._id,
      service: serviceId,
      vendor: service.vendor,
      booking: booking._id,
      rating: ratingNum,
      comment: comment || '',
    });

    // Recalculate avg_rating and review_count for the service
    const [agg] = await Review.aggregate([
      { $match: { service: new mongoose.Types.ObjectId(serviceId) } },
      {
        $group: {
          _id: null,
          avg_rating: { $avg: '$rating' },
          review_count: { $sum: 1 },
        },
      },
    ]);

    await Service.findByIdAndUpdate(serviceId, {
      avg_rating: agg ? Math.round(agg.avg_rating * 10) / 10 : ratingNum,
      review_count: agg ? agg.review_count : 1,
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: { review },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A review for this booking already exists.',
        data: {},
      });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
        data: {},
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error.',
      data: {},
    });
  }
};

// ─── GET /reviews/:serviceId ──────────────────────────────────────────────────

const getServiceReviews = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const reviews = await Review.find({ service: serviceId })
      .populate('client', 'full_name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Reviews retrieved.',
      data: { reviews },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error.',
      data: {},
    });
  }
};

// ─── GET /reviews/my-reviewable ───────────────────────────────────────────────

const getReviewableBookings = async (req, res) => {
  try {
    // Find all completed bookings for this client
    const completedBookings = await Booking.find({
      client: req.user._id,
      status: 'completed',
    }).populate('service', 'title category');

    if (completedBookings.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No reviewable bookings found.',
        data: { bookings: [] },
      });
    }

    const bookingIds = completedBookings.map((b) => b._id);

    // Find all reviews that already exist for these bookings
    const existingReviews = await Review.find({
      booking: { $in: bookingIds },
    }).select('booking');

    const reviewedBookingIds = new Set(existingReviews.map((r) => r.booking.toString()));

    // Keep only bookings that have NOT been reviewed
    const reviewableBookings = completedBookings.filter(
      (b) => !reviewedBookingIds.has(b._id.toString())
    );

    return res.status(200).json({
      success: true,
      message: 'Reviewable bookings retrieved.',
      data: { bookings: reviewableBookings },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error.',
      data: {},
    });
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  addReview,
  getServiceReviews,
  getReviewableBookings,
};
