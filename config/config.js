require('dotenv').config(); // Load environment variables from .env file

module.exports = {
  // MongoDB URI for database connection
  MONGO_URI: process.env.MONGO_URI,

  // Port the server will run on
  PORT: process.env.PORT || 5000,

  // JWT Secret for authentication (for generating tokens)
  JWT_SECRET: process.env.JWT_SECRET,

  // Any other configuration variables can be added here (e.g., email, API keys)
};
