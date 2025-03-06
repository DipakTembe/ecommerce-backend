const mongoose = require('mongoose');

// Wishlist Schema
const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'  // Associating with the User model
  },
  wishlistItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'  // Associating with the Product model
      },
      name: {
        type: String,
        required: true
      },
      imageUrl: {
        type: String,
        required: false,
        validate: {
          validator: function (v) {
            // Validate if URL is a valid URL (adjust regex as needed)
            return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
          },
          message: 'Invalid URL format for image URL.'
        },
        default: 'http://localhost:5001/images/default-image.jpg' // Default image URL if not provided
      },
      price: {
        type: Number,
        required: true
      }
    }
  ]
}, {
  timestamps: true
});

// Method to add product to the wishlist
wishlistSchema.methods.addToWishlist = async function (productId) {
  const productExists = this.wishlistItems.find(item => item.product.toString() === productId.toString());

  if (!productExists) {
    const product = await mongoose.model('Product').findById(productId);  // Get product details
    if (product) {
      this.wishlistItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price
      });
      await this.save();
    } else {
      throw new Error('Product not found');
    }
  }

  return this;
};

// Method to remove product from the wishlist
wishlistSchema.methods.removeFromWishlist = async function (productId) {
  this.wishlistItems = this.wishlistItems.filter(item => item.product.toString() !== productId.toString());
  await this.save();
  return this;
};

module.exports = mongoose.model('Wishlist', wishlistSchema);
