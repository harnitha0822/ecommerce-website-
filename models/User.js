// Import mongoose to create a Schema and Model
const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'], // Required field validation
    trim: true // Remove whitespace from start and end
  },
  email: {
    type: String,
    required: [true, 'User email is required'], // Required field validation
    unique: true, // Email must be unique in the database
    trim: true,
    lowercase: true // Save email in lowercase to prevent duplicates due to casing
  }
}, {
  timestamps: true // Automatically creates 'createdAt' and 'updatedAt' fields
});

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;
