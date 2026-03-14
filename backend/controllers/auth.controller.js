const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const sendEmail = require('../utils/email.js');
const emailTemplates = require('../utils/emailTemplates.js');

// ─── Helper ──────────────────────────────────────────────────────────────────

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const safeUser = (user) => ({
  _id: user._id,
  full_name: user.full_name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  verified: user.verified,
  profile_photo: user.profile_photo,
  // Client fields
  wedding_date: user.wedding_date,
  partner_name: user.partner_name,
  city: user.city,
  budget: user.budget,
  wedding_type: user.wedding_type,
  whatsapp: user.whatsapp,
  preferred_categories: user.preferred_categories,
  // Vendor fields
  business_name: user.business_name,
  business_description: user.business_description,
  years_experience: user.years_experience,
  cover_image: user.cover_image,
  service_cities: user.service_cities,
  instagram_url: user.instagram_url,
  portfolio_url: user.portfolio_url,
  languages: user.languages,
  gst_number: user.gst_number,
  min_price: user.min_price,
  max_price: user.max_price,
  certifications: user.certifications,
  avg_response_time: user.avg_response_time,
  category_specialization: user.category_specialization,
  // Admin fields
  admin_level: user.admin_level,
  last_login: user.last_login,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  // Wishlist IDs
  wishlist: (user.wishlist || []).map(id => id.toString()),
});

// ─── POST /auth/register ──────────────────────────────────────────────────────

const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    if (!full_name || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: full_name, email, phone, password, role',
        data: {},
      });
    }

    if (!['client', 'vendor'].includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Invalid role. Only "client" or "vendor" registration is allowed.',
        data: {},
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
        data: {},
      });
    }

    const user = await User.create({ full_name, email, phone, password, role });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: safeUser(user),
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
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error during registration.',
      data: {},
    });
  }
};

// ─── POST /auth/login ─────────────────────────────────────────────────────────

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
        data: {},
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        data: {},
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        data: {},
      });
    }

    const token = generateToken(user._id);

    user.last_login = new Date();
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: safeUser(user),
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error during login.',
      data: {},
    });
  }
};

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully.',
      data: {
        user: safeUser(req.user),
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error retrieving profile.',
      data: {},
    });
  }
};

// ─── PUT /auth/profile ────────────────────────────────────────────────────────

const updateProfile = async (req, res) => {
  try {
    const {
      full_name, phone,
      // Client fields
      wedding_date, partner_name, city, budget, wedding_type, whatsapp, preferred_categories,
      // Vendor fields
      business_name, business_description, years_experience,
      service_cities, instagram_url, portfolio_url, languages,
      gst_number, min_price, max_price, certifications, avg_response_time, category_specialization,
    } = req.body;

    const updates = {};

    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;

    if (req.user.role === 'client') {
      if (wedding_date !== undefined) updates.wedding_date = wedding_date || null;
      if (partner_name !== undefined) updates.partner_name = partner_name;
      if (city !== undefined) updates.city = city;
      if (budget !== undefined) updates.budget = budget;
      if (wedding_type !== undefined) updates.wedding_type = wedding_type;
      if (whatsapp !== undefined) updates.whatsapp = whatsapp;
      if (preferred_categories !== undefined) updates.preferred_categories = preferred_categories;
    }

    if (req.user.role === 'vendor') {
      if (business_name !== undefined) updates.business_name = business_name;
      if (business_description !== undefined) updates.business_description = business_description;
      if (years_experience !== undefined) updates.years_experience = years_experience;
      if (service_cities !== undefined) updates.service_cities = service_cities;
      if (instagram_url !== undefined) updates.instagram_url = instagram_url;
      if (portfolio_url !== undefined) updates.portfolio_url = portfolio_url;
      if (languages !== undefined) updates.languages = languages;
      if (gst_number !== undefined) updates.gst_number = gst_number;
      if (min_price !== undefined) updates.min_price = min_price;
      if (max_price !== undefined) updates.max_price = max_price;
      if (certifications !== undefined) updates.certifications = certifications;
      if (avg_response_time !== undefined) updates.avg_response_time = avg_response_time;
      if (category_specialization !== undefined) updates.category_specialization = category_specialization;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update.',
        data: {},
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        data: {},
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: safeUser(updatedUser),
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
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error updating profile.',
      data: {},
    });
  }
};

// ─── PUT /auth/password ───────────────────────────────────────────────────────

const updatePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Both old_password and new_password are required.',
        data: {},
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        data: {},
      });
    }

    const isMatch = await user.comparePassword(old_password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect.',
        data: {},
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
        data: {},
      });
    }

    user.password = new_password;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
      data: {},
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error updating password.',
      data: {},
    });
  }
};

// ─── PUT /auth/profile-photo ──────────────────────────────────────────────────

const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.', data: {} });
    }
    const photoPath = req.file.path; // Cloudinary secure URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profile_photo: photoPath } },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: 'Profile photo updated.',
      data: { user: safeUser(updatedUser) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Server error.', data: {} });
  }
};

// ─── PUT /auth/cover-image ────────────────────────────────────────────────────

const uploadCoverImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.', data: {} });
    }
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, message: 'Only vendors can upload a cover image.', data: {} });
    }
    const coverPath = req.file.path; // Cloudinary secure URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { cover_image: coverPath } },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: 'Cover image updated.',
      data: { user: safeUser(updatedUser) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Server error.', data: {} });
  }
};

// ─── POST /auth/forgot-password ───────────────────────────────────────────────

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.', data: {} });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Always return success to avoid email enumeration
    if (!user) {
      return res.status(200).json({ success: true, message: 'If that email is registered, a reset link has been sent.', data: {} });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.reset_token = token;
    user.reset_token_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
    await sendEmail(user.email, 'Reset Your ShadiSeva Password', emailTemplates.passwordResetEmail(user.full_name, resetUrl));

    return res.status(200).json({ success: true, message: 'If that email is registered, a reset link has been sent.', data: {} });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Server error.', data: {} });
  }
};

// ─── POST /auth/reset-password/:token ─────────────────────────────────────────

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { new_password } = req.body;

    if (!new_password) return res.status(400).json({ success: false, message: 'New password is required.', data: {} });
    if (new_password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.', data: {} });

    const user = await User.findOne({
      reset_token: token,
      reset_token_expires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset link. Please request a new one.', data: {} });
    }

    user.password = new_password;
    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in.', data: {} });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Server error.', data: {} });
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  uploadProfilePhoto,
  uploadCoverImage,
  forgotPassword,
  resetPassword,
};
