// Import core dependencies
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import route handlers
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Load environment variables from .env file
dotenv.config();

// Create Express application instance
const app = express();

// Connect to MongoDB local instance
connectDB();

// Configure Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing (helps frontend connect)
app.use(express.json()); // Middleware to parse incoming JSON request bodies

// Serve static frontend files from the "public" folder
app.use(express.static('public'));

// Mount API Routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

// Define server PORT (default to 5000 if not specified in .env)
const PORT = process.env.PORT || 5000;

// Start listening for requests on the specified port
app.listen(PORT, () => {
  console.log(`🚀 Server running in production mode on port ${PORT}`);
  console.log(`🌍 Click here to open frontend: http://localhost:${PORT}`);
});
