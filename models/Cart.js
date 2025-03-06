const mongoose = require('mongoose');

// Cart Schema
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Associating with the User model
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product', // Associating with the Product model
        },
        name: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Method to add a product to the cart
cartSchema.methods.addToCart = async function (productId, quantity) {
  try {
    const cartItemIndex = this.cartItems.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (cartItemIndex > -1) {
      // If product already exists in the cart, update its quantity
      this.cartItems[cartItemIndex].quantity += quantity;
    } else {
      // Fetch product details from the Product model
      const product = await mongoose.model('Product').findById(productId);

      if (!product) {
        throw new Error('Product not found');
      }

      // Add new product to the cart
      this.cartItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
      });
    }

    await this.save(); // Save the cart
    return this;
  } catch (error) {
    console.error('Error adding product to cart:', error.message);
    throw new Error('Error adding product to cart');
  }
};

// Method to remove a product from the cart
cartSchema.methods.removeFromCart = async function (productId) {
  try {
    // Filter out the product to be removed
    const initialLength = this.cartItems.length;
    this.cartItems = this.cartItems.filter(
      (item) => item.product.toString() !== productId.toString()
    );

    if (this.cartItems.length === initialLength) {
      throw new Error('Product not found in cart');
    }

    await this.save(); // Save the updated cart
    return this;
  } catch (error) {
    console.error('Error removing product from cart:', error.message);
    throw new Error('Error removing product from cart');
  }
};

// Export the Cart model
module.exports = mongoose.model('Cart', cartSchema);
