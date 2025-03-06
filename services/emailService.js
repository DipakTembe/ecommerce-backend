const nodemailer = require('nodemailer');

// Create transporter for sending emails via Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email address (e.g., Gmail)
    pass: process.env.EMAIL_PASS, // App-specific password
  },
});

// Function to send OTP email
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: email, // Recipient address
    subject: 'Your OTP for Registration',
    text: `Your OTP is: ${otp}`, // OTP message in plain text
    // Optional: HTML formatted OTP email
    // html: `<p>Your OTP for registration is: <strong>${otp}</strong></p>`,
  };

  try {
    // Send OTP email
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error.message);
    throw new Error('Failed to send OTP email'); // Propagate error with a clear message
  }
};

// Optionally, you can add other email functions for password resets, notifications, etc.

module.exports = { sendOtpEmail };
