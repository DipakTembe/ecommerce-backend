const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model

const authMiddleware = async (req, res, next) => {
  try {
    // Check if Authorization header exists and starts with 'Bearer '
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No Authorization header or invalid format');
      return res.status(401).json({ message: 'Unauthorized: Token is required in Bearer format' });
    }

    // Extract the token from the Authorization header (we're assuming 'token' here)
    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      // Verify the token using the JWT secret from environment variables
      decoded = jwt.verify(token, process.env.JWT_SECRET);  
    } catch (err) {
      console.error('Token verification failed:', err.message);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired. Please login again to refresh the token.' });
      }
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    // Log the decoded token ID for debugging (Ensure no sensitive info is logged)
    console.log('Decoded Token ID:', decoded.id);

    // Fetch the user from the database using the user ID from the decoded token
    const user = await User.findById(decoded.id);  // Assuming user ID is saved in the token

    if (!user) {
      console.error('User not found in database for token ID:', decoded.id);
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    // Log the user details (Be cautious with logging sensitive info)
    console.log('Authenticated User:', user.username);

    // Attach the user details to the req.user object for use in the route handler
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Unexpected error during authentication:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = authMiddleware;
