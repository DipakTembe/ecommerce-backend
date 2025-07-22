const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        // Validate if URL is a valid URL (adjust regex as needed)
        return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
      },
      message: 'Invalid URL format for image URL.'
    },
   default: 'https://ecommerce-backend-1-gnq2.onrender.com/images/default-image.jpg'

  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  brand: {
    type: String,
    required: false,  // Optional field
    default: 'Unknown'  // Default value for brand if not provided
  },
  category: {
    type: String,
    required: false,  // Optional field
    default: 'Uncategorized'  // Default category if not provided
  },
  gender: {
    type: String,
    enum: ['Mens', 'Womens', 'Kids', 'Home'],  // Limit to these options
    required: true
  },
  type: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true, // Ensures stock is mandatory
    min: 0, // Ensures stock cannot be negative
    default: 0 // Default stock value
  }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
