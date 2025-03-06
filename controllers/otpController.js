const sendEmail = require('../utils/sendEmail'); // Import sendEmail utility

const otpStore = {}; // For simplicity, use in-memory store. Replace with Redis for production.
const OTP_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes

const normalizeEmail = (email) => email.trim().toLowerCase();

const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
    otpStore[normalizedEmail] = { otp, timestamp: Date.now() };

    console.log(`Generated OTP for ${normalizedEmail}:`, otp);

    // Send OTP via email using sendEmail utility
    const emailSent = await sendEmail(normalizedEmail, otp);

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in sendOtp:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp, password, username } = req.body;

  // Log the incoming data to debug
  console.log("Received OTP Verification Request:", { email, otp, password, username });

  // Check for required fields
  if (!email || !otp || !password || !username) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    const storedOtpData = otpStore[normalizedEmail];

    if (!storedOtpData) {
      return res.status(400).json({ message: "OTP not found for this email" });
    }

    // Check if the OTP has expired
    if (Date.now() - storedOtpData.timestamp > OTP_EXPIRATION_TIME) {
      delete otpStore[normalizedEmail]; // Clean up expired OTP
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Check if the OTP matches
    if (parseInt(storedOtpData.otp, 10) !== parseInt(otp, 10)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Clean up OTP after successful verification
    delete otpStore[normalizedEmail];

    // Check if the user already exists
    const User = require("../models/User");
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password and create a new user
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(hashedPassword);

    const newUser = new User({
      email: normalizedEmail,
      password: hashedPassword,
      username,
      isVerified: true,
    });
    await newUser.save();

    // Generate JWT for the new user
    const jwt = require("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

module.exports = { sendOtp, verifyOtp };
