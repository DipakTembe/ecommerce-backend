const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); // Add path module to handle file paths
const { logInfo, logError } = require('./utils/logger'); // Custom logging utilities
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const otpRoutes = require('./routes/otpRoutes');
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/authMiddleware');

// Load environment variables
dotenv.config();

// Ensure required environment variables are present
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

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.get('/favicon.ico', (req, res) => res.status(204).end()); // No Content

// Serve static files for images from backend folder
app.use('/images', express.static(path.join(__dirname, 'images'))); // Serve images from the 'images' folder in backend

const allowedOrigins = [
  process.env.FRONTEND_URL,   // Netlify frontend (already set in Render env)
  'https://dipakecommercewebsite.netlify.app',
  'http://localhost:3000',
  'http://localhost:5001',
  'http://localhost:5001/images',
  'https://ecommerce-backend-1-gnq2.onrender.com',  // Your Render backend URL
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logInfo('Connected to MongoDB'))
  .catch((err) => {
    logError('Error connecting to MongoDB: ' + err.message);
    process.exit(1); // Exit the application if the database connection fails
  });

// Default Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the e-commerce backend!',
    status: 'Running',
  });
});

// Unauthorised routes
app.use('/api/auth', authRoutes);

// Define Routes
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/products', productRoutes);
app.use('/api/test', testRoutes);
app.use('/api/otp', otpRoutes);

// Use authenticated Routes
app.use(authMiddleware);
app.use('/api/orders', orderRoutes);

// Catch-All Route for Undefined Endpoints
app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  logError(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}, // Show stack trace in development
  });
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => logInfo(`Server is running on port ${PORT}`));

// Graceful Shutdown Handlers
const gracefulShutdown = (signal) => {
  logInfo(`${signal} received. Closing MongoDB connection.`);
  mongoose.connection.close(() => {
    logInfo('MongoDB connection closed. Exiting application.');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
