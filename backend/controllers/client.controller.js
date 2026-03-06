const User = require('../models/user.model');
const Service = require('../models/service.model');
const Booking = require('../models/booking.model');
const sendEmail = require('../utils/email.js');
const emailTemplates = require('../utils/emailTemplates.js');

// ─── GET /client/services ─────────────────────────────────────────────────────

const getAllServices = async (req, res) => {
  try {
    const { category, location, search, minPrice, maxPrice, sort } = req.query;

    // Build base filter — only active services
    const serviceFilter = { status: 'active' };

    if (category) {
      serviceFilter.category = category.toLowerCase();
    }

    if (location) {
      serviceFilter.location = { $regex: location, $options: 'i' };
    }

    if (search) {
      serviceFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      serviceFilter.price = {};
      if (minPrice !== undefined) serviceFilter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) serviceFilter.price.$lte = Number(maxPrice);
    }

    // First collect verified vendor IDs
    const verifiedVendors = await User.find(
      { role: 'vendor', verified: true },
      { _id: 1 }
    );
    const verifiedVendorIds = verifiedVendors.map((v) => v._id);

    serviceFilter.vendor = { $in: verifiedVendorIds };

    const sortOrder = sort === 'price_asc' ? { price: 1 }
      : sort === 'price_desc' ? { price: -1 }
      : sort === 'rating' ? { avg_rating: -1 }
      : { createdAt: -1 };

    const services = await Service.find(serviceFilter)
      .populate('vendor', 'full_name email phone')
      .sort(sortOrder);

    return res.status(200).json({
      success: true,
      message: 'Services retrieved successfully.',
      data: {
        services,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error retrieving services.',
      data: {},
    });
  }
};

// ─── POST /client/bookings ────────────────────────────────────────────────────

const bookService = async (req, res) => {
  try {
    const { service_id, booking_date, notes } = req.body;

    if (!service_id || !booking_date) {
      return res.status(400).json({
        success: false,
        message: 'service_id and booking_date are required.',
        data: {},
      });
    }

    // Validate booking date is in the future
    const parsedDate = new Date(booking_date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking_date provided.',
        data: {},
      });
    }

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (parsedDate <= todayStart) {
      return res.status(400).json({
        success: false,
        message: 'Booking date must be in the future.',
        data: {},
      });
    }

    // Look up the service
    const service = await Service.findById(service_id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
        data: {},
      });
    }

    if (service.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This service is currently unavailable.',
        data: {},
      });
    }

    // Check the vendor is verified
    const vendor = await User.findById(service.vendor);
    if (!vendor || !vendor.verified) {
      return res.status(403).json({
        success: false,
        message: 'This vendor is not verified and cannot accept bookings.',
        data: {},
      });
    }

    // Prevent client from booking their own service
    if (req.user._id.toString() === vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot book your own service.',
        data: {},
      });
    }

    // Create the booking
    const booking = await Booking.create({
      client: req.user._id,
      vendor: vendor._id,
      service: service._id,
      booking_date: parsedDate,
      total_amount: service.price,
      notes: notes || '',
    });

    // Send email notification to vendor (non-fatal)
    const formattedDate = parsedDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedAmount = `₹${service.price.toLocaleString('en-IN')}`;

    await sendEmail(
      vendor.email,
      'New Booking Request - ShadiSeva',
      emailTemplates.bookingRequestEmail(
        vendor.full_name,
        req.user.full_name,
        service.title,
        formattedDate,
        formattedAmount
      )
    );

    return res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully.',
      data: {
        booking,
      },
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
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format.',
        data: {},
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error creating booking.',
      data: {},
    });
  }
};

// ─── GET /client/bookings ─────────────────────────────────────────────────────

const getClientBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ client: req.user._id })
      .populate('service', 'title category images')
      .populate('vendor', 'full_name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully.',
      data: {
        bookings,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error retrieving bookings.',
      data: {},
    });
  }
};

// ─── PATCH /client/bookings/:bookingId/cancel ─────────────────────────────────

const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
        data: {},
      });
    }

    // Ensure the authenticated client owns this booking
    if (booking.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this booking.',
        data: {},
      });
    }

    // Only pending bookings can be cancelled by the client
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be cancelled because its current status is "${booking.status}".`,
        data: {},
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: {},
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format.',
        data: {},
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error cancelling booking.',
      data: {},
    });
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  getAllServices,
  bookService,
  getClientBookings,
  cancelBooking,
};
