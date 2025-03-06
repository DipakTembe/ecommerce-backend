const mongoose = require('mongoose');

// OTP Schema
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // TTL Index: Document expires after 5 minutes (300 seconds)
  },
});

module.exports = mongoose.model('OTP', otpSchema);
