const Order = require('../models/Order');
const Product = require('../models/Product'); // Assuming a Product model exists for stock management

// Function to retrieve all orders (with optional filtering based on user)
exports.getOrders = async (req, res) => {
  try {
    const userId = req.query.userId;
    const orders = userId
      ? await Order.find({ user: userId }) // Fetch orders for a specific user
      : await Order.find(); // Get all orders

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

// Function to create a new order
exports.createOrder = async (req, res) => {
  const { userId, items, totalPrice, shippingDetails } = req.body;

  try {
    // Validate required fields
    if (!userId || !items || !totalPrice || !shippingDetails) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check product stock availability and update stock if necessary
    for (const item of items) {
      const product = await Product.findById(item._id);
      
      // Check if the product exists
      if (!product) {
        return res.status(400).json({ message: `Product not found for ID: ${item._id}` });
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for product: ${product.description}` });
      }

      // Update the stock of the product
      product.stock -= item.quantity;
      await product.save();
    }

    // Create a new order
    const newOrder = new Order({
      user: userId,
      items,
      totalPrice,
      shippingDetails,
      status: 'Pending', // New order is always 'Pending' by default
    });

    // Save the order to the database
    await newOrder.save();
    res.status(201).json(newOrder); // Return the created order
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error creating order', error });
  }
};

// Function to cancel an order
exports.cancelOrder = async (req, res) => {
  const orderId = req.params.id;

  try {
    // Find the order by its ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order is already completed or cancelled
    if (order.status === 'Completed' || order.status === 'Cancelled') {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }

    // Update the order status to 'Cancelled'
    order.status = 'Cancelled';
    await order.save(); // Save the updated order

    // Restore product stock if the order is canceled
    for (const item of order.items) {
      const product = await Product.findById(item._id);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    res.status(200).json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order', error });
  }
};

// Function to update the status of an order
exports.updateOrderStatus = async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body; // Status could be 'Shipped', 'Completed', etc.

  try {
    // Find the order by its ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow status updates to certain values (e.g., 'Shipped' or 'Completed')
    const allowedStatuses = ['Pending', 'Shipped', 'Cancelled', 'Completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Update the order status
    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error });
  }
};