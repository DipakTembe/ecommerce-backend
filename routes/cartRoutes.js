const express = require('express');
const { getCart, addToCart, removeFromCart } = require('../controllers/cartController'); // Updated names
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Ensure authentication

// Use authentication middleware to protect cart routes
router.use(authMiddleware);

// Define routes
router.get('/', getCart); // Get cart items
router.post('/add', addToCart); // Add item to cart
router.delete('/remove/:productId', removeFromCart); // Remove item from cart

module.exports = router;
