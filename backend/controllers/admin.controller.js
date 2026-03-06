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

// ─── GET /admin/profile ───────────────────────────────────────────────────────

const getAdminProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Admin profile retrieved.',
      data: { admin: req.user },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error.',
      data: {},
    });
  }
};

// ─── GET /admin/vendors/requests ─────────────────────────────────────────────

const getVendorRequests = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor', verified: false }).select('-password');
    return res.status(200).json({
      success: true,
      message: 'Pending vendor requests retrieved.',
      data: { vendors },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error.',
      data: {},
    });
  }
};

// ─── PATCH /admin/vendors/:vendorId/accept ────────────────────────────────────

const acceptVendorRequest = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await User.findById(vendorId);

    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found.',
        data: {},
      });
    }

    vendor.verified = true;
    await vendor.save();

    await sendEmail(
      vendor.email,
      'Your ShadiSeva Vendor Account is Approved!',
      emailTemplates.vendorApprovedEmail(vendor.full_name)
    );

    return res.status(200).json({
      success: true,
      message: 'Vendor approved successfully.',
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

// ─── PATCH /admin/vendors/:vendorId/reject ────────────────────────────────────

const rejectVendorRequest = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    const vendor = await User.findById(vendorId);

    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found.',
        data: {},
      });
    }

    await sendEmail(
      vendor.email,
      'Update on Your ShadiSeva Vendor Application',
      emailTemplates.vendorRejectedEmail(vendor.full_name, reason || null)
    );

    await Service.deleteMany({ vendor: vendorId });
    await User.findByIdAndDelete(vendorId);

    return res.status(200).json({
      success: true,
      message: 'Vendor rejected and removed successfully.',
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

// ─── GET /admin/users ─────────────────────────────────────────────────────────

const getAllUsers = async (req, res) => {
  try {
    const {
      role,
      verified,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (role) filter.role = role;
    if (verified !== undefined && verified !== '') {
      filter.verified = verified === 'true';
    }
    if (search) {
      filter.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter).select('-password').skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Users retrieved.',
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
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

// ─── GET /admin/bookings ──────────────────────────────────────────────────────

const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total, revenueAgg] = await Promise.all([
      Booking.find(filter)
        .populate('client', 'full_name email')
        .populate('vendor', 'full_name email')
        .populate('service', 'title category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Booking.countDocuments(filter),
      Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total_revenue: { $sum: '$total_amount' } } },
      ]),
    ]);

    const total_revenue = revenueAgg.length > 0 ? revenueAgg[0].total_revenue : 0;

    return res.status(200).json({
      success: true,
      message: 'Bookings retrieved.',
      data: {
        bookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
        total_revenue,
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

// ─── GET /admin/stats ─────────────────────────────────────────────────────────

const getStats = async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Build last 6 months array (oldest first)
    const lastSixMonths = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      lastSixMonths.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    const [
      userCounts,
      activeServiceCount,
      bookingStats,
      monthlyRaw,
      topCategoriesRaw,
    ] = await Promise.all([
      // 1. User counts: total, by role, verified vendors
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
          },
        },
      ]).then(async (roleGroups) => {
        const total = await User.countDocuments();
        const verifiedVendors = await User.countDocuments({ role: 'vendor', verified: true });
        const byRole = { client: 0, vendor: 0, admin: 0 };
        for (const rg of roleGroups) {
          if (byRole[rg._id] !== undefined) byRole[rg._id] = rg.count;
        }
        return { total, byRole, verifiedVendors };
      }),

      // 2. Active service count
      Service.countDocuments({ status: 'active' }),

      // 3. Booking totals and revenue
      Booking.aggregate([
        {
          $facet: {
            byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
            revenue: [
              { $match: { status: 'completed' } },
              { $group: { _id: null, total: { $sum: '$total_amount' } } },
            ],
            total: [{ $count: 'count' }],
          },
        },
      ]),

      // 4. Monthly data: last 6 months bookings count and revenue
      Booking.aggregate([
        {
          $match: {
            booking_date: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$booking_date' },
              month: { $month: '$booking_date' },
            },
            bookings: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, '$total_amount', 0],
              },
            },
          },
        },
      ]),

      // 5. Top 3 categories by booking count
      Booking.aggregate([
        {
          $lookup: {
            from: 'services',
            localField: 'service',
            foreignField: '_id',
            as: 'serviceData',
          },
        },
        { $unwind: '$serviceData' },
        {
          $group: {
            _id: '$serviceData.category',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 3 },
      ]),
    ]);

    // Process booking stats
    const bookingFacet = bookingStats[0];
    const totalBookings = bookingFacet.total.length > 0 ? bookingFacet.total[0].count : 0;
    const total_revenue = bookingFacet.revenue.length > 0 ? bookingFacet.revenue[0].total : 0;
    const status_breakdown = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    for (const bs of bookingFacet.byStatus) {
      if (status_breakdown[bs._id] !== undefined) status_breakdown[bs._id] = bs.count;
    }

    // Process monthly data
    const monthlyLookup = {};
    for (const item of monthlyRaw) {
      monthlyLookup[`${item._id.year}-${item._id.month}`] = item;
    }
    const monthly = lastSixMonths.map(({ year, month }) => {
      const key = `${year}-${month}`;
      const found = monthlyLookup[key];
      return {
        month: MONTH_NAMES[month - 1],
        bookings: found ? found.bookings : 0,
        revenue: found ? found.revenue : 0,
      };
    });

    // Top categories
    const top_categories = topCategoriesRaw.map((tc) => ({
      category: tc._id,
      count: tc.count,
    }));

    return res.status(200).json({
      success: true,
      message: 'Stats retrieved.',
      data: {
        overview: {
          total_users: userCounts.total,
          users_by_role: userCounts.byRole,
          verified_vendors: userCounts.verifiedVendors,
          active_services: activeServiceCount,
          total_bookings: totalBookings,
          total_revenue,
        },
        monthly,
        status_breakdown,
        top_categories,
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

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  getAdminProfile,
  getVendorRequests,
  acceptVendorRequest,
  rejectVendorRequest,
  getAllUsers,
  getAllBookings,
  getStats,
};
