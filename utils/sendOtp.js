const nodemailer = require('nodemailer');
const crypto = require('crypto');
const moment = require('moment');
const { isEmail } = require('validator');
const OTP = require('../models/OTP'); // Assuming OTP model is in models folder
require('dotenv').config();

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function to generate OTP
const generateOtp = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); // Generates a secure 8-character OTP
};

// Send OTP function
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}. It is valid for 5 minutes.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email}. Response:`, info.response); // Debug log for success
    return { success: true, response: info.response }; // Return success response
  } catch (error) {
    console.error(`Error sending OTP email to ${email}:`, error.message); // Debug log for failure
    return { success: false, error: error.message }; // Return error response
  }
};

// Send OTP and store it in the database
const sendOtp = async (email) => {
  if (!email || !isEmail(email)) {
    throw new Error('A valid email is required');
  }

  const otp = generateOtp();

  // Save or update OTP in the database (upsert operation)
  await OTP.findOneAndUpdate(
    { email },
    { otp, createdAt: Date.now() },
    { upsert: true, new: true }
  );

  // Send the email and handle response
  const emailResult = await sendOtpEmail(email, otp);
  if (!emailResult.success) {
    throw new Error(`Failed to send OTP email: ${emailResult.error}`);
  }

  return `OTP sent successfully to ${email}. Please check your email.`;
};

// Verify OTP function
const verifyOtp = async (email, otp) => {
  if (!email || !otp) {
    throw new Error('Email and OTP are required');
  }

  const storedOtp = await OTP.findOne({ email });
  if (!storedOtp) {
    throw new Error('OTP not found for this email');
  }

  const otpExpiryTime = moment(storedOtp.createdAt).add(5, 'minutes');
  if (moment().isAfter(otpExpiryTime)) {
    await OTP.deleteOne({ email }); // Remove expired OTP
    throw new Error('OTP has expired');
  }

  if (storedOtp.otp !== otp) {
    throw new Error('Invalid OTP');
  }

  await OTP.deleteOne({ email }); // Remove OTP after successful verification
  return 'OTP verified successfully';
};

module.exports = {
  sendOtp,
  verifyOtp,
};
