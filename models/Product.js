// Import mongoose
const mongoose = require('mongoose');

// Define the Product schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'] // Validation: price must be >= 0
  },
  stock: {
    type: Number,
    required: [true, 'Product stock quantity is required'],
    min: [0, 'Stock cannot be negative'], // Validation: stock count cannot be < 0
    default: 0
  }
}, {
  timestamps: true // Automatically creates 'createdAt' and 'updatedAt' fields
});

// Create and export the Product model
const Product = mongoose.model('Product', productSchema);
module.exports = Product;
