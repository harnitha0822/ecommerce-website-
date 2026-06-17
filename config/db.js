// Import Mongoose library
const mongoose = require('mongoose');

// Async function to connect to MongoDB local database
const connectDB = async () => {
  try {
    // Connect to database using URI from environment variable
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit server process with failure code (1) if connection fails
    process.exit(1);
  }
};

// Export the connectDB function for use in server.js
module.exports = connectDB;
