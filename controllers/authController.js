const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Secrets for JWT tokens
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_jt_secret';

// **Register User** (Hash the password before saving)
const register = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    // Validate input fields
    if (!email || !password || !username) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Trim and hash the password
    const trimmedPassword = password.trim();
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(trimmedPassword, saltRounds);

    // Create new user
    const newUser = new User({ email, password: hashedPassword, username });
    await newUser.save();

    // Log the user data for debugging
    console.log("New user created:", newUser);

    // Generate JWT token (short-lived)
    const token = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: '15m' });

    // Generate JWT refresh token (long-lived)
    const refreshToken = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Store the refresh token securely (in cookie, HTTP-only)
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });

    res.status(201).json({ message: 'User created successfully', token }); // Returning token instead of accessToken
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// **Login User**
const login = async (req, res) => {
  const { email, password } = req.body;
  // Secrets for JWT tokens
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_jt_secret';

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Incorrect email or password' });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect email or password' });
    }

    // Log the logged-in user for debugging
    // console.log("Logged-in user:", user);

   // Generate JWT token (short-lived)
   const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });

   // Generate JWT refresh token (long-lived)
   const refreshToken = jwt.sign({ id: user._id, username: user.username }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Store the refresh token securely (in cookie, HTTP-only)
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });

    res.status(200).json({ message: 'Login successful', token }); // Returning token instead of accessToken
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// **Get User Info**
const getUser = async (req, res) => {
  try {
    const user = req.user;  // Directly use req.user populated by authMiddleware

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// **Refresh Token Endpoint**
const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(403).json({ message: 'Refresh token is required' });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Generate a new token (accessToken) from the refresh token's payload
    const newToken = jwt.sign({ id: decoded.id, username: decoded.username }, JWT_SECRET, { expiresIn: '15m' });

    res.status(200).json({ token: newToken }); // Returning the new token instead of accessToken
  } catch (error) {
    console.error('Refresh token error:', error.message);
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

// **Logout User** (Clear the refresh token cookie)
const logout = (req, res) => {
  res.clearCookie('refreshToken'); // Clear the HTTP-only cookie
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { register, login, getUser, refreshToken, logout };
