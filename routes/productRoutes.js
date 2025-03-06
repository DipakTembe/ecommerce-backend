const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Import the Product model

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products from the database
    res.status(200).json(products); // Return the array of products
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await Product.findById(productId); // Fetch product by ID from the database
    if (!product) {
      return res.status(404).json({ message: 'Product not found' }); // Handle case where product doesn't exist
    }
    res.status(200).json(product); // Return the product
  } catch (error) {
    console.error('Error fetching product by ID:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
