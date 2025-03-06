const Cart = require('../models/Cart');

// Get all items in the cart
exports.getCart = async (req, res) => {
  try {
    // Find the user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('cartItems.product');

    if (!cart) {
      return res.status(200).json({ message: 'Cart is empty', cartItems: [] });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
};

// Add a product to the cart
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body; // Expecting productId and quantity in the body

  try {
    // Find the user's cart
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      // If cart doesn't exist, create one
      cart = new Cart({
        user: req.user.id,
        cartItems: []
      });
    }

    // Add product to cart using the model method
    await cart.addToCart(productId, quantity);

    // Return the updated cart
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding product to cart' });
  }
};

// Remove a product from the cart
exports.removeFromCart = async (req, res) => {
  const { productId } = req.params; // Get productId from URL params

  try {
    // Find the user's cart
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove product from the cart using the model method
    await cart.removeFromCart(productId);

    // Return the updated cart
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing product from cart' });
  }
};
