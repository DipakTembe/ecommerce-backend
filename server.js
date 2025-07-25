const dotenv = require('dotenv');
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
const productRoutes = require('./routes/productRoutes'); // search is handled here
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Load .env variables
dotenv.config();

// ✅ Validate Required Environment Variables
const requiredEnv = ['MONGO_URI', 'EMAIL_USER', 'EMAIL_PASS', 'JWT_SECRET'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing ${key} in .env`);
    process.exit(1);
  }
}

// ✅ Initialize Express App
const app = express();
app.use(express.json());

// ✅ Serve static image files (public images)
app.use('/images', express.static(path.join(__dirname, 'images')));

// ✅ Handle favicon.ico
app.get('/favicon.ico', (req, res) => res.status(204).end());

// ✅ CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'https://dipakecommercewebsite.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => logInfo('✅ Connected to MongoDB'))
  .catch(err => {
    logError('❌ MongoDB connection error: ' + err.message);
    process.exit(1);
  });

// ✅ Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the E-commerce Backend API!',
    status: 'Running'
  });
});

// ✅ Public Routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/test', testRoutes);
app.use('/api/products', productRoutes); // Includes search endpoint

// ✅ Protected Routes (Apply authMiddleware)
app.use(authMiddleware);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);

// ✅ 404 Catch-All
app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  logError(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => logInfo(`🚀 Server running on port ${PORT}`));

// ✅ Graceful Shutdown
const gracefulShutdown = (signal) => {
  logInfo(`${signal} received. Closing MongoDB connection.`);
  mongoose.connection.close(() => {
    logInfo('MongoDB connection closed. Exiting...');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
