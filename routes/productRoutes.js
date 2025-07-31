const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// 🔍 Search products by name, brand, or category (Unauthenticated)
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const regex = new RegExp(query, 'i'); // Case-insensitive search
    const products = await Product.find({
      $or: [
        { name: regex },
        { brand: regex },
        { category: regex }
      ]
    });

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found matching your query.' });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('🔍 Search error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 📦 Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('📦 Error fetching all products:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 📦 Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('📦 Error fetching product by ID:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
