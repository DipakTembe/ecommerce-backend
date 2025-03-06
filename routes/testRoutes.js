const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Test JWT generation endpoint
router.post('/generate-token', (req, res) => {
  const { payload } = req.body; // Example payload to encode
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate JWT token.' });
  }
});

// Test endpoint for health check
router.get('/health', (req, res) => {
  res.status(200).json({ message: 'API is running and healthy!' });
});

// Test route for verifying environment variables
router.get('/env-check', (req, res) => {
  const requiredEnvVars = ['MONGO_URI', 'PORT', 'FRONTEND_URL', 'EMAIL_USER', 'EMAIL_PASS', 'JWT_SECRET'];
  const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingEnvVars.length > 0) {
    return res.status(500).json({
      status: 'failure',
      missingEnvVars,
      message: 'One or more required environment variables are missing.',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'All required environment variables are set correctly!',
  });
});

module.exports = router;
