const mongoose = require('mongoose');

// MongoDB Atlas connection string
const mongoURI = process.env.MONGO_URI; // It's better to store this in a .env file

const connectDB = async () => {
  try {
    // Connect to MongoDB (Atlas cloud database)
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);  // Exit process with failure
  }
};

module.exports = connectDB;
