const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Define order routes
router.get('/', orderController.getOrders); // Fetch all orders or by user ID
router.post('/create', orderController.createOrder); // Create a new order
router.patch('/cancel/:id', orderController.cancelOrder); // Cancel an order
router.patch('/status/:id', orderController.updateOrderStatus); // Update order status

module.exports = router;
