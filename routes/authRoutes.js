const express = require('express');
const { register, login, getUser } = require('../controllers/authController'); // Import controllers
const authMiddleware = require('../middleware/authMiddleware'); // Import the authMiddleware
const router = express.Router();

// Register Route - Handles user registration
router.post('/register', register);

// Login Route - Handles user login and token generation
router.post('/login', login);

// Protected Route - Fetch logged-in user's details (requires valid JWT token)
router.get('/me', authMiddleware, getUser);  // Apply the authMiddleware to protect this route

module.exports = router;
