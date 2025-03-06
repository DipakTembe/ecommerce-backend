const express = require('express');
const jwt = require('jsonwebtoken'); // Import JWT for token generation
const app = express();

// Use JSON middleware to parse request body
app.use(express.json()); 

// Generate token function
const generateToken = (userId) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';  // Use a secret key for signing tokens

  // Sign a JWT token with userId and a short expiration time
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30m' });

  return token;
};

// Example route to login or authenticate a user
app.post('/login', (req, res) => {
  const { userId } = req.body; // Assuming the user sends userId in the body

  // Check if userId exists
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Generate the JWT token
    const token = generateToken(userId);

    // Send the token back in the response
    res.status(200).json({ token });

  } catch (error) {
    console.error('Error generating JWT:', error);
    res.status(500).json({ message: 'Failed to generate token' });
  }
});

// General error handling middleware (Optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
app.listen(5001, () => {
  console.log('Server running on port 5001');
});
