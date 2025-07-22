require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product'); // Assuming your model is in models/Product.js

// Fetch the MongoDB URI from the environment
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('MongoDB URI is not defined. Please check your .env file.');
  process.exit(1); // Exit the script if the URI is not set
}

const backendURL = 'https://ecommerce-backend-1-gnq2.onrender.com';

const productData = [
  { image: "/images/casual-t-shirt.avif", brand: "Nike", type: "Casual T-Shirt", price: 2999, stock: 10, category: "Topwear", rating: 4.2, buyers: 6400, gender: "Mens", description: "A comfortable and stylish casual t-shirt." },
  { image: "/images/jeans.jpg", brand: "Levi's", type: "Jeans", price: 4999, stock: 15, category: "Bottomwear", rating: 4.0, buyers: 2200, gender: "Mens", description: "Durable and stylish jeans for everyday wear." },
  { image: "/images/sports-shoes.avif", brand: "Adidas", type: "Running Shoes", price: 7999, stock: "In Stock", category: "Sportswear", rating: 4.5, buyers: 5400, gender: "Mens", description: "High-performance running shoes designed for comfort." },
  { image: "/images/formal-shirt.jpg", brand: "Tommy Hilfiger", type: "Formal Shirt", price: 3999, stock: 4, category: "Topwear", rating: 4.1, buyers: 1800, gender: "Mens", description: "A sophisticated formal shirt for business occasions." },
  { image: "/images/shorts.jpg", brand: "H&M", type: "Shorts", price: 5999, stock: 6, category: "Bottomwear", rating: 4.3, buyers: 3500, gender: "Mens", description: "Comfortable shorts perfect for casual outings." },
  { image: "/images/denim-jacket.jpg", brand: "Wrangler", type: "Denim Jacket", price: 8999, stock: 8, category: "Topwear", rating: 4.7, buyers: 1200, gender: "Mens", description: "A classic denim jacket that never goes out of style." },
  { image: "/images/tracksuit.avif", brand: "Puma", type: "Tracksuit", price: 6999, stock: 7, category: "Sportswear", rating: 4.0, buyers: 2900, gender: "Mens", description: "A comfortable tracksuit for your workouts and leisure." },
  { image: "/images/hoodie.webp", brand: "Nike", type: "Hoodie", price: 6999, stock: 44, category: "Topwear", rating: 4.4, buyers: 3200, gender: "Mens", description: "A cozy hoodie for a relaxed, casual look." },
  { image: "/images/active-t-shirt.jpg", brand: "Reebok", type: "Active T-shirt", price: 6999, stock: 47, category: "Sportswear", rating: 4.2, buyers: 6000, gender: "Mens", description: "Breathable t-shirt perfect for active sports." },
  { image: "/images/casual-trouser.jpg", brand: "Uniqlo", type: "Casual Trouser", price: 6999, stock: 26, category: "Bottomwear", rating: 4.3, buyers: 4100, gender: "Mens", description: "Casual trousers that offer both style and comfort." },
  { image: "/images/watch2.jpg", brand: "Casio", type: "Sports Watch", price: 6999, stock: 53, category: "Sportswear", rating: 4.6, buyers: 3500, gender: "Mens", description: "A durable sports watch with all the essential features." },
  { image: "/images/formal-trouser.jpg", brand: "Van Heusen", type: "Formal Trouser", price: 6999, stock: 27, category: "Bottomwear", rating: 4.1, buyers: 2700, gender: "Mens", description: "Smart and stylish trousers for formal occasions." },
  { image: "/images/ethnic-wear1.jpg", brand: "Fabindia", type: "Embroidered Kurta", price: 2999, stock: 18, category: "EthnicWear", rating: 4.2, buyers: 6400, gender: "Womens", description: "A beautifully embroidered kurta for traditional wear." },
  { image: "/images/women-top.webp", brand: "Zara", type: "Latest Top", price: 4999, stock: 74, category: "WesternWear", rating: 4.0, buyers: 2200, gender: "Womens", description: "A trendy top that pairs well with any outfit." },
  { image: "/images/women-sports-shoes.webp", brand: "Asics", type: "Sports Shoes", price: 7999, stock: 34, category: "FootWear", rating: 4.5, buyers: 5400, gender: "Womens", description: "Lightweight sports shoes for maximum comfort." },
  { image: "/images/ethnic-wear2.jpg", brand: "Biba", type: "Stylish Kurta", price: 3999, stock: 25, category: "EthnicWear", rating: 4.1, buyers: 1800, gender: "Womens", description: "A stylish kurta for festive occasions." },
  { image: "/images/women-t-shirt.webp", brand: "H&M", type: "T-shirt", price: 5999, stock: 29, category: "WesternWear", rating: 4.3, buyers: 3500, gender: "Womens", description: "A versatile t-shirt for casual wear." },
  { image: "/images/ethnic-wear3.webp", brand: "W", type: "Designer Kurta", price: 8999, stock: 46, category: "EthnicWear", rating: 4.7, buyers: 1200, gender: "Womens", description: "A designer kurta for elegant traditional wear." },
  { image: "/images/women-casual-shoes.webp", brand: "Skechers", type: "Casual Shoe", price: 6999, stock: 37, category: "FootWear", rating: 4.0, buyers: 2900, gender: "Womens", description: "Comfortable shoes perfect for everyday wear." },
  { image: "/images/lehenga.webp", brand: "Sabyasachi", type: "Lehenga", price: 6999, stock: 16, category: "EthnicWear", rating: 4.4, buyers: 3200, gender: "Womens", description: "A beautiful lehenga for traditional occasions." },
  { image: "/images/women-heels.jpg", brand: "Louboutin", type: "Stylish Heels", price: 6999, stock: 24, category: "FootWear", rating: 4.2, buyers: 6000, gender: "Womens", description: "Elegant heels that add a touch of sophistication." },
  { image: "/images/women-jacket.jpg", brand: "Mango", type: "Black Jacket", price: 6999, stock: 39, category: "WesternWear", rating: 4.3, buyers: 4100, gender: "Womens", description: "A sleek black jacket for a stylish look." },
  { image: "/images/women-flats.webp", brand: "FitFlop", type: "New Flats", price: 6999, stock: 28, category: "FootWear", rating: 4.6, buyers: 3500, gender: "Womens", description: "New flats that combine comfort and style." },
  { image: "/images/women-jeans.webp", brand: "Lee", type: "Jeans", price: 6999, stock: 52, category: "WesternWear", rating: 4.1, buyers: 2700, gender: "Womens", description: "Stylish jeans that fit well and offer great comfort." },

  { image: "/images/Boys-Casual.jpg", brand: "Nike", type: "Casual Clothes", price: 3999, stock: 73, category: "Boy Clothing", rating: 4.1, buyers: 1800, gender: "Kids", description: "Comfortable casual wear for boys." },
  { image: "/images/Boys-formal.jpg", brand: "Adidas", type: "Formal Clothes", price: 5999, stock: 37, category: "Boy Clothing", rating: 4.3, buyers: 3500, gender: "Kids", description: "Elegant formal wear for boys." },
  { image: "/images/Boys-shoes.avif", brand: "Reebok", type: "Kids Shoes", price: 8999, stock: 24, category: "Boy Clothing", rating: 4.7, buyers: 1200, gender: "Kids", description: "Durable and stylish shoes for kids." },
  { image: "/images/Girls-casual.jpg", brand: "Puma", type: "Girls Clothes", price: 6999, stock: 63, category: "Girl Clothing", rating: 4.0, buyers: 2900, gender: "Kids", description: "Comfortable casual wear for girls." },
  { image: "/images/Girls-stylish.jpg", brand: "H&M", type: "Stylish Clothes", price: 7999, stock: 42, category: "Girl Clothing", rating: 4.4, buyers: 3200, gender: "Kids", description: "Stylish clothes for girls." },
  { image: "/images/Girls-shoes.jpg", brand: "Nike", type: "Shoes", price: 3999, stock: 14, category: "Girl Clothing", rating: 4.2, buyers: 6000, gender: "Kids", description: "Comfortable shoes for girls." },
  { image: "/images/Boys-Sunglasses.avif", brand: "Puma", type: "Shoes", price: 6999, stock: 58, category: "Accessories", rating: 4.0, buyers: 2900, gender: "Kids", description: "Stylish and comfortable shoes for boys." },
  { image: "/images/Kids-watch.jpg", brand: "H&M", type: "Watch", price: 7999, stock: 48, category: "Accessories", rating: 4.4, buyers: 3200, gender: "Kids", description: "Trendy and functional watch for kids." },
  { image: "/images/Girls-Sunglasses.jpg", brand: "Nike", type: "Shoes", price: 3999, stock: 62, category: "Accessories", rating: 4.2, buyers: 6000, gender: "Kids", description: "Durable and comfortable shoes for kids." },

  { image: "/images/black-sofa.jpg", brand: "Ikea", type: "Sofa", price: 29999, stock: 21, category: "Furniture", rating: 4.2, buyers: 6400, gender: "Home", description: "A modern black sofa with premium comfort." },
  { image: "/images/white-chair.jpg", brand: "Urban Ladder", type: "Chair", price: 4999, stock: 14, category: "Furniture", rating: 4.0, buyers: 2200, gender: "Home", description: "Elegant white chair suitable for any decor." },
  { image: "/images/teapoy.avif", brand: "HomeTown", type: "Teapoy", price: 7999, stock: 17, category: "Furniture", rating: 4.5, buyers: 5400, gender: "Home", description: "Stylish teapoy for modern interiors." },
  { image: "/images/bed.jpg", brand: "Pepperfry", type: "Bed", price: 39999, stock: 22, category: "Furniture", rating: 4.1, buyers: 1800, gender: "Home", description: "Comfortable and spacious double bed." },
  { image: "/images/white-cover.jpg", brand: "Home Centre", type: "Cushion Cover", price: 599, stock: 32, category: "Decor", rating: 4.3, buyers: 3500, gender: "Home", description: "Soft and elegant cushion covers." },
  { image: "/images/black-cover.avif", brand: "Spaces", type: "Cushion Cover", price: 699, stock: 34, category: "Decor", rating: 4.7, buyers: 1200, gender: "Home", description: "Premium black cushion covers." },
  { image: "/images/stylish-cover.jpg", brand: "FabIndia", type: "Cushion Cover", price: 799, stock: 25, category: "Decor", rating: 4.0, buyers: 2900, gender: "Home", description: "Stylish covers for contemporary decor." },
  { image: "/images/pillow.jpg", brand: "DDecor", type: "Pillow", price: 999, stock: 24, category: "Decor", rating: 4.4, buyers: 3200, gender: "Home", description: "Comfortable pillows for sound sleep." },
  { image: "/images/kitchen-set1.jpg", brand: "Prestige", type: "Kitchen Set", price: 6999, stock: 34, category: "Kitchenware", rating: 4.2, buyers: 6000, gender: "Home", description: "Comprehensive kitchen set for daily use." },
  { image: "/images/kitchen-set2.jpg", brand: "Wonderchef", type: "Cookware Set", price: 6999, stock: 13, category: "Kitchenware", rating: 4.3, buyers: 4100, gender: "Home", description: "Premium cookware set with non-stick features." },
  { image: "/images/kitchen-set3.webp", brand: "Cello", type: "Dinner Set", price: 6999, stock: 43, category: "Kitchenware", rating: 4.6, buyers: 3500, gender: "Home", description: "Elegant dinner set for formal dining." },
  { image: "/images/kitchen-set4.webp", brand: "Borosil", type: "Glassware Set", price: 6999, stock: 33, category: "Kitchenware", rating: 4.1, buyers: 2700, gender: "Home", description: "Stylish and durable glassware set." },
];


// Utility function to ensure stock is a number
function normalizeStock(stock) {
  if (typeof stock === 'string') {
    switch (stock.toLowerCase()) {
      case 'in stock':
        return 1; // Treat "In Stock" as 1 (available)
      case 'out of stock':
        return 0; // Treat "Out of Stock" as 0 (not available)
      default:
        return 0; // Default to 0 if the stock is undefined or has another string
    }
  }
  return Number(stock); // If it's already a number, return it
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB connected.');

    // Clear existing products
    const deletedProducts = await Product.deleteMany({});
    console.log(`${deletedProducts.deletedCount} existing products removed.`);

    // Prepare new product data with updated image URLs and normalized stock
    const updatedProductData = productData.map(item => ({
      ...item,
      stock: normalizeStock(item.stock), // Normalize stock to ensure it's a number
      imageUrl: `http://localhost:5001${item.image}` // Generate absolute image URL
    }));

    // Insert updated product data
    const insertedProducts = await Product.insertMany(updatedProductData);
    console.log(`${insertedProducts.length} new products inserted successfully.`);

    // Close the connection
    mongoose.connection.close();
    console.log('Database connection closed.');
  })
  .catch(error => {
    console.error('Error during database operation:', error);

    // Ensure database connection is closed on error
    mongoose.connection.close();
    process.exit(1);
  });
