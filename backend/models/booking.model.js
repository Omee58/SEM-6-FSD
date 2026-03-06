const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  booking_date: {
    type: Date, required: true,
    validate: {
      validator: function (date) {
        if (!date || isNaN(date.getTime())) return false;
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return date > todayStart;
      },
      message: 'Booking date must be in the future'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  total_amount: { type: Number, min: 0 },
  notes: { type: String, trim: true, maxlength: 500, default: '' },
}, { timestamps: true });

bookingSchema.pre('save', function () {
  if (this.client.toString() === this.vendor.toString()) {
    throw new Error('Client and vendor cannot be the same user');
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
