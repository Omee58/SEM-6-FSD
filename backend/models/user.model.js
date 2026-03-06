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
  // Vendor-specific fields
  business_name: { type: String, trim: true, default: '' },
  business_description: { type: String, trim: true, default: '' },
  years_experience: { type: Number, default: 0, min: 0 },
  blocked_dates: { type: [Date], default: [] },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
