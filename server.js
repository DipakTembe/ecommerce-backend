// Load environment variables at the very top
const dotenv = require('dotenv');
dotenv.config(); // ✅ IMPORTANT: Must be before using process.env

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Utils and Middleware
const { logInfo, logError } = require('./utils/logger');
const authMiddleware = require('./middleware/authMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const otpRoutes = require('./routes/otpRoutes');
const testRoutes = require('./routes/testRoutes');
const productRoutes = require('./routes/productRoutes'); // includes /search route
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Validate required env vars
const requiredEnv = ['MONGO_URI', 'EMAIL_USER', 'EMAIL_PASS', 'JWT_SECRET', 'FRONTEND_URL'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Missing ${key} in .env`);
    process.exit(1);
  }
}

// Initialize Express app
const app = express();
app.use(express.json());

// Serve static images from /images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// 🌐 CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'https://dipakecommercewebsite.netlify.app', // Fallback if env var fails
];

app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// app.use(cors({
//   origin: function (origin, callback) {
//     console.log('🌐 CORS Request Origin:', origin);
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       console.warn(`❌ CORS blocked request from origin: ${origin}`);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
// }));

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the E-commerce Backend API!',
    status: 'Running',
  });
});

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/test', testRoutes);
app.use('/api/products', productRoutes); // includes /search

// Protected routes (require auth)
app.use(authMiddleware);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);

// 404 handler for unmatched routes
app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

// Global error handler
app.use((err, req, res, next) => {
  logError(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    logInfo('✅ MongoDB connected.');
    app.listen(PORT, () => logInfo(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    logError('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// app.listen(PORT, () => logInfo(`🚀 Server running on port ${PORT}`));

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logInfo(`${signal} received. Closing MongoDB connection.`);
  mongoose.connection.close(() => {
    logInfo('MongoDB connection closed. Exiting...');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
