const Product = require('../models/Product');

const fallbackImage = "http://localhost:5001/images/default-image.jpg";

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const updatedProducts = products.map(product => ({
      ...product._doc,
      imageUrl: product.imageUrl || fallbackImage
    }));

    res.status(200).json(updatedProducts);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.imageUrl = product.imageUrl || fallbackImage;

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { name, price, description, imageUrl } = req.body;

    if (!name || !price || !description) {
      return res.status(400).json({ message: 'Name, price, and description are required' });
    }

    const newProduct = new Product({
      name,
      price,
      description,
      imageUrl: imageUrl || fallbackImage
    });

    await newProduct.save();

    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a product by ID
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, price, description, imageUrl } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        price,
        description,
        imageUrl: imageUrl || fallbackImage
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a product by ID
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
