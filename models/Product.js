const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
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
    default: 'Unknown'
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  gender: {
    type: String,
    enum: ['Mens', 'Womens', 'Kids', 'Home'],
    required: true
  },
  type: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
