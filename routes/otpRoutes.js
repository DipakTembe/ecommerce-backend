const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp } = require('../controllers/otpController');

console.log('OTP Routes initialized');

// Route to send OTP
router.post('/send-otp', (req, res, next) => {
  console.log('Received request for sending OTP');
  sendOtp(req, res, next);
});

// Route to verify OTP
router.post('/verify-otp', (req, res, next) => {
  console.log('Received request for verifying OTP');
  verifyOtp(req, res, next);
});

module.exports = router;
