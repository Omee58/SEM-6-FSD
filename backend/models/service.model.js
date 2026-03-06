const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String, required: true, lowercase: true,
    enum: ['photography', 'catering', 'venue', 'decoration', 'mehendi', 'music', 'makeup', 'transport', 'other']
  },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String, default: '', trim: true },
  images: { type: [String], default: [] },
  avg_rating: { type: Number, default: 0, min: 0, max: 5 },
  review_count: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
