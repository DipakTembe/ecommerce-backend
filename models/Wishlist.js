const mongoose = require('mongoose');

// Wishlist Schema
const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Reference to User model
  },
  wishlistItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
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
            return !v || /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
          },
          message: 'Invalid URL format for image URL.'
        },
        default: `${process.env.FRONTEND_URL || 'http://localhost:5001'}/images/default-image.jpg`
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

// Method to add product to wishlist
wishlistSchema.methods.addToWishlist = async function (productId) {
  const productExists = this.wishlistItems.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (!productExists) {
    const Product = mongoose.model('Product');
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    this.wishlistItems.push({
      product: product._id,
      name: product.name,
      imageUrl: product.imageUrl || `${process.env.FRONTEND_URL || 'http://localhost:5001'}/images/default-image.jpg`,
      price: product.price
    });

    await this.save();
  }

  return this;
};

// Method to remove product from wishlist
wishlistSchema.methods.removeFromWishlist = async function (productId) {
  this.wishlistItems = this.wishlistItems.filter(
    (item) => item.product.toString() !== productId.toString()
  );

  await this.save();
  return this;
};

module.exports = mongoose.model('Wishlist', wishlistSchema);
