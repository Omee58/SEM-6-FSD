const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

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
  business_name: user.business_name,
  business_description: user.business_description,
  years_experience: user.years_experience,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
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
    const { full_name, phone, business_name, business_description, years_experience } = req.body;

    const updates = {};

    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;

    if (req.user.role === 'vendor') {
      if (business_name !== undefined) updates.business_name = business_name;
      if (business_description !== undefined) updates.business_description = business_description;
      if (years_experience !== undefined) updates.years_experience = years_experience;
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

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
};
