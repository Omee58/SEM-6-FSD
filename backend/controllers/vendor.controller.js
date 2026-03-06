const mongoose = require('mongoose');
const User = require('../models/user.model');
const Service = require('../models/service.model');
const Booking = require('../models/booking.model');
const Review = require('../models/review.model');
const sendEmail = require('../utils/email');
const emailTemplates = require('../utils/emailTemplates');

// ─── Month name map ───────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── GET /vendor/profile ──────────────────────────────────────────────────────

const getVendorProfile = async (req, res) => {
  try {
    if (!req.user.verified) {
      return res.status(403).json({
        success: false,
        message: 'Your vendor account is pending approval.',
        data: {},
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Vendor profile retrieved.',
      data: { vendor: req.user },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error.',
      data: {},
    });
  }
};

// ─── POST /vendor/services ────────────────────────────────────────────────────

const addService = async (req, res) => {
  try {
    const { title, description, price, category, location } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'title, description, price, and category are required.',
        data: {},
      });
    }

    const images = req.files && req.files.length > 0
      ? req.files.map((f) => f.filename)
      : [];

    const service = await Service.create({
      title,
      description,
      price: Number(price),
      category,
      location,
      images,
      vendor: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Service created successfully.',
      data: { service },
    });
  } catch (err) {
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

// ─── GET /vendor/services ─────────────────────────────────────────────────────

const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Services retrieved.',
      data: { services },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error.',
      data: {},
    });
  }
};

// ─── PUT /vendor/services/:serviceId ─────────────────────────────────────────

const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
        data: {},
      });
    }

    if (service.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorised to update this service.',
        data: {},
      });
    }

    const { title, description, price, category, location, status } = req.body;

    if (title !== undefined) service.title = title;
    if (description !== undefined) service.description = description;
    if (price !== undefined) service.price = Number(price);
    if (category !== undefined) service.category = category;
    if (location !== undefined) service.location = location;
    if (status !== undefined) service.status = status;

    if (req.files && req.files.length > 0) {
      service.images = req.files.map((f) => f.filename);
    }

    await service.save();

    return res.status(200).json({
      success: true,
      message: 'Service updated successfully.',
      data: { service },
    });
  } catch (err) {
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

// ─── DELETE /vendor/services/:serviceId ──────────────────────────────────────

const deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
        data: {},
      });
    }

    if (service.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorised to delete this service.',
        data: {},
      });
    }

    const activeBooking = await Booking.findOne({
      service: serviceId,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a service that has active (pending or confirmed) bookings.',
        data: {},
      });
    }

    await Service.findByIdAndDelete(serviceId);

    return res.status(200).json({
      success: true,
      message: 'Service deleted successfully.',
      data: {},
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error.',
      data: {},
    });
  }
};

// ─── GET /vendor/services/:serviceId (public) ─────────────────────────────────

const getServiceById = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findById(serviceId).populate(
      'vendor',
      'full_name email phone business_name years_experience'
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
        data: {},
      });
    }

    const [ratingAgg] = await Review.aggregate([
      { $match: { service: new mongoose.Types.ObjectId(serviceId) } },
      {
        $group: {
          _id: null,
          avg_rating: { $avg: '$rating' },
          review_count: { $sum: 1 },
        },
      },
    ]);

    const avg_rating = ratingAgg ? Math.round(ratingAgg.avg_rating * 10) / 10 : 0;
    const review_count = ratingAgg ? ratingAgg.review_count : 0;

    return res.status(200).json({
      success: true,
      message: 'Service retrieved.',
      data: {
        service: {
          ...service.toObject(),
          avg_rating,
          review_count,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error.',
      data: {},
    });
  }
};

// ─── GET /vendor/bookings/requests ───────────────────────────────────────────

const getBookingRequests = async (req, res) => {
  try {
    const bookings = await Booking.find({
      vendor: req.user._id,
      status: 'pending',
    })
      .populate('client', 'full_name email phone')
      .populate('service', 'title category price images')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Pending booking requests retrieved.',
      data: { bookings },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error.',
      data: {},
    });
  }
};

// ─── GET /vendor/bookings ─────────────────────────────────────────────────────

const getAllVendorBookings = async (req, res) => {
  try {
    const filter = { vendor: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const bookings = await Booking.find(filter)
      .populate('client', 'full_name email phone')
      .populate('service', 'title category price images')
      .sort({ booking_date: -1 });

    return res.status(200).json({
      success: true,
      message: 'Bookings retrieved.',
      data: { bookings },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error.',
      data: {},
    });
  }
};

// ─── PATCH /vendor/bookings/:bookingId/status ─────────────────────────────────

const changeBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status: newStatus } = req.body;

    if (!newStatus) {
      return res.status(400).json({
        success: false,
        message: 'status is required.',
        data: {},
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate('client', 'full_name email phone')
      .populate('service', 'title category price images');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
        data: {},
      });
    }

    if (booking.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorised to update this booking.',
        data: {},
      });
    }

    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
    };

    const allowed = validTransitions[booking.status];
    if (!allowed || !allowed.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition booking from "${booking.status}" to "${newStatus}".`,
        data: {},
      });
    }

    const prevStatus = booking.status;
    booking.status = newStatus;
    await booking.save();

    const client = booking.client;
    const service = booking.service;
    const vendorUser = req.user;
    const dateStr = booking.booking_date
      ? booking.booking_date.toDateString()
      : 'N/A';

    if (newStatus === 'confirmed') {
      await sendEmail(
        client.email,
        'Your Booking is Confirmed! – ShadiSeva',
        emailTemplates.bookingConfirmedEmail(
          client.full_name,
          service.title,
          vendorUser.business_name || vendorUser.full_name,
          dateStr
        )
      );
    } else if (newStatus === 'cancelled' && (prevStatus === 'pending' || prevStatus === 'confirmed')) {
      await sendEmail(
        client.email,
        'Booking Update – ShadiSeva',
        emailTemplates.bookingRejectedEmail(
          client.full_name,
          service.title,
          vendorUser.business_name || vendorUser.full_name
        )
      );
    } else if (newStatus === 'completed') {
      await sendEmail(
        client.email,
        'How was your experience? – ShadiSeva',
        emailTemplates.reviewReminderEmail(client.full_name, service.title)
      );
    }

    return res.status(200).json({
      success: true,
      message: `Booking status updated to "${newStatus}".`,
      data: { booking },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error.',
      data: {},
    });
  }
};

// ─── GET /vendor/earnings ─────────────────────────────────────────────────────

const getVendorEarnings = async (req, res) => {
  try {
    const now = new Date();

    // Build an array of the last 6 calendar months (oldest first)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1 }); // month 1-12
    }

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const agg = await Booking.aggregate([
      {
        $match: {
          vendor: new mongoose.Types.ObjectId(req.user._id),
          status: 'completed',
          booking_date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$booking_date' },
            month: { $month: '$booking_date' },
          },
          earnings: { $sum: '$total_amount' },
          bookings: { $sum: 1 },
        },
      },
    ]);

    // Map aggregation results to a lookup keyed by "YYYY-M"
    const lookup = {};
    for (const item of agg) {
      lookup[`${item._id.year}-${item._id.month}`] = item;
    }

    const monthly = months.map(({ year, month }) => {
      const key = `${year}-${month}`;
      const found = lookup[key];
      return {
        month: MONTH_NAMES[month - 1],
        earnings: found ? found.earnings : 0,
        bookings: found ? found.bookings : 0,
      };
    });

    // Overall totals (all time, not just 6 months)
    const [totalsAgg] = await Booking.aggregate([
      {
        $match: {
          vendor: new mongoose.Types.ObjectId(req.user._id),
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          total_earned: { $sum: '$total_amount' },
          total_bookings: { $sum: 1 },
        },
      },
    ]);

    const total_earned = totalsAgg ? totalsAgg.total_earned : 0;
    const total_bookings = totalsAgg ? totalsAgg.total_bookings : 0;
    const this_month_earnings = monthly[monthly.length - 1].earnings;

    return res.status(200).json({
      success: true,
      message: 'Earnings retrieved.',
      data: {
        monthly,
        totals: {
          total_earned,
          total_bookings,
          this_month_earnings,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error.',
      data: {},
    });
  }
};

// ─── GET /vendor/availability ─────────────────────────────────────────────────

const getAvailability = async (req, res) => {
  try {
    const { serviceId, month, year } = req.query;

    if (!serviceId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'serviceId, month, and year query params are required.',
        data: {},
      });
    }

    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    if (m < 1 || m > 12) {
      return res.status(400).json({
        success: false,
        message: 'month must be between 1 and 12.',
        data: {},
      });
    }

    const startOfMonth = new Date(y, m - 1, 1);
    const endOfMonth = new Date(y, m, 0, 23, 59, 59, 999); // last day of month

    const bookings = await Booking.find({
      service: serviceId,
      status: { $in: ['pending', 'confirmed'] },
      booking_date: { $gte: startOfMonth, $lte: endOfMonth },
    }).select('booking_date');

    const booked_dates = bookings.map((b) => b.booking_date.toISOString());

    // Fetch vendor's blocked dates — look up vendor from service
    const service = await Service.findById(serviceId).select('vendor');
    let blocked_dates = [];
    if (service && service.vendor) {
      const vendor = await User.findById(service.vendor).select('blocked_dates');
      if (vendor) {
        blocked_dates = (vendor.blocked_dates || [])
          .filter((d) => {
            const date = new Date(d);
            return date >= startOfMonth && date <= endOfMonth;
          })
          .map((d) => new Date(d).toISOString());
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Availability retrieved.',
      data: { booked_dates, blocked_dates },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error.',
      data: {},
    });
  }
};

// ─── PATCH /vendor/availability/block ────────────────────────────────────────

const toggleBlockedDate = async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'date (YYYY-MM-DD) is required.',
        data: {},
      });
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD.',
        data: {},
      });
    }

    const vendor = await User.findById(req.user._id);

    // Normalise the target date to midnight UTC for consistent comparison
    const targetTime = targetDate.toISOString().split('T')[0];
    const existingIndex = vendor.blocked_dates.findIndex(
      (d) => new Date(d).toISOString().split('T')[0] === targetTime
    );

    if (existingIndex !== -1) {
      vendor.blocked_dates.splice(existingIndex, 1);
    } else {
      vendor.blocked_dates.push(targetDate);
    }

    await vendor.save();

    return res.status(200).json({
      success: true,
      message: existingIndex !== -1 ? 'Date unblocked.' : 'Date blocked.',
      data: { blocked_dates: vendor.blocked_dates.map((d) => new Date(d).toISOString()) },
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
  getVendorProfile,
  addService,
  getMyServices,
  updateService,
  deleteService,
  getServiceById,
  getBookingRequests,
  getAllVendorBookings,
  changeBookingStatus,
  getVendorEarnings,
  getAvailability,
  toggleBlockedDate,
};
