const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  full_name: { type: String, required: true, trim: true },
  email: {
    type: String, required: true, unique: true,
    lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email']
  },
  phone: {
    type: String, required: true, trim: true,
    match: [/^\d{10,15}$/, 'Phone must be 10-15 digits']
  },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['client', 'vendor', 'admin'], default: 'client' },
  verified: {
    type: Boolean,
    default: function () { return this.role !== 'vendor'; }
  },
  // Shared photo field
  profile_photo: { type: String, default: '' },

  // Client-specific fields
  wedding_date: { type: Date },
  partner_name: { type: String, trim: true, default: '' },
  city: { type: String, trim: true, default: '' },
  budget: { type: Number, default: 0 },
  wedding_type: { type: String, enum: ['traditional', 'modern', 'destination', 'court', 'other'], default: 'traditional' },
  whatsapp: { type: String, trim: true, default: '' },
  preferred_categories: { type: [String], default: [] },

  // Vendor-specific fields
  business_name: { type: String, trim: true, default: '' },
  business_description: { type: String, trim: true, default: '' },
  years_experience: { type: Number, default: 0, min: 0 },
  blocked_dates: { type: [Date], default: [] },
  cover_image: { type: String, default: '' },
  service_cities: { type: [String], default: [] },
  instagram_url: {
    type: String, default: '',
    validate: { validator: v => !v || /^https?:\/\/.+/.test(v), message: 'instagram_url must be a valid URL' },
  },
  portfolio_url: {
    type: String, default: '',
    validate: { validator: v => !v || /^https?:\/\/.+/.test(v), message: 'portfolio_url must be a valid URL' },
  },
  languages: { type: [String], default: [] },
  gst_number: { type: String, default: '' },
  min_price: { type: Number, default: 0 },
  max_price: { type: Number, default: 0 },
  certifications: { type: [String], default: [] },
  avg_response_time: { type: String, default: '' },
  category_specialization: { type: String, default: '' },

  // Admin-specific fields
  admin_level: { type: String, enum: ['super_admin', 'moderator'], default: 'moderator' },
  last_login: { type: Date },

  // Password reset
  reset_token:         { type: String, default: null },
  reset_token_expires: { type: Date,   default: null },

  // Wishlist (client)
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
