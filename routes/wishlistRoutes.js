const express = require('express');
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you use authentication
const router = express.Router();

// Define routes
router.get('/', authMiddleware, getWishlist); // Ensure getWishlist is properly imported
router.post('/add', authMiddleware, addToWishlist); // Ensure addToWishlist is properly imported
router.delete('/remove/:id', authMiddleware, removeFromWishlist); // Ensure removeFromWishlist is properly imported

module.exports = router;
