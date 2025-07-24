const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { logInfo, logError } = require('./utils/logger');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const otpRoutes = require('./routes/otpRoutes');
const authMiddleware = require('./middleware/authMiddleware');

// Load environment variables
dotenv.config();

// Validate environment variables
if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI in .env file');
  process.exit(1);
}
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Missing email credentials (EMAIL_USER or EMAIL_PASS) in .env file');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in .env file');
  process.exit(1);
}

// Initialize app
const app = express();
app.use(express.json());

// Favicon handling
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Serve static image files
app.use('/images', express.static(path.join(__dirname, 'images')));

// ✅ Updated CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://dipakecommercewebsite.netlify.app',
  'http://localhost:3000',
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => logInfo('Connected to MongoDB'))
  .catch((err) => {
    logError('Error connecting to MongoDB: ' + err.message);
    process.exit(1);
  });

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the e-commerce backend!',
    status: 'Running',
  });
});

// Public Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/test', testRoutes);
app.use('/api/otp', otpRoutes);

// Protected Routes
app.use(authMiddleware);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);

// Catch-All Route
app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

// Global Error Handler
app.use((err, req, res, next) => {
  logError(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : {},
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => logInfo(`Server is running on port ${PORT}`));

// Graceful Shutdown
const gracefulShutdown = (signal) => {
  logInfo(`${signal} received. Closing MongoDB connection.`);
  mongoose.connection.close(() => {
    logInfo('MongoDB connection closed. Exiting application.');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
