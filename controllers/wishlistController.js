const Wishlist = require('../models/Wishlist');

// Get all items in the wishlist
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user.id }).populate('items.product');
    res.status(200).json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error.message);
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
};

// Add an item to the wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, items: [] });
    }

    if (wishlist.items.find(item => item.product.toString() === productId.toString())) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    wishlist.items.push({ product: productId });
    await wishlist.save();
    res.status(200).json(wishlist);
  } catch (error) {
    console.error('Error adding to wishlist:', error.message);
    res.status(500).json({ message: 'Error adding to wishlist' });
  }
};

// Remove an item from the wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { id: productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items = wishlist.items.filter(item => item.product.toString() !== productId.toString());
    await wishlist.save();
    res.status(200).json(wishlist);
  } catch (error) {
    console.error('Error removing from wishlist:', error.message);
    res.status(500).json({ message: 'Error removing from wishlist' });
  }
};
