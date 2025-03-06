const nodemailer = require('nodemailer');
require('dotenv').config(); // Ensure environment variables are loaded

// Create a transporter with Gmail SMTP service and additional TLS configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Gmail SMTP service
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address (from environment variable)
    pass: process.env.EMAIL_PASS,  // App-specific password (from environment variable)
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV !== 'production', // Disable for production environments (useful for local testing with self-signed certs)
  },
});

// Function to send an OTP email
const sendEmail = async (recipientEmail, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender's email (from environment variable)
    to: recipientEmail, // Recipient's email
    subject: 'Your OTP for Registration', // Specific subject for OTP email
    text: `Your OTP code is: ${otp}. It is valid for the next 10 minutes.`,
    html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>It is valid for the next 10 minutes.</p>`, // HTML content for better formatting
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response); // Log success response for debugging
    return true;
  } catch (error) {
    // Log full error for better debugging
    console.error('Error sending email:', error.message);
    return false;
  }
};

module.exports = sendEmail;
