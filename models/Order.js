// Import mongoose
const mongoose = require('mongoose');

// Define the Order schema
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Defines a reference (relationship) to the Users collection
    ref: 'User', // Reference target model
    required: [true, 'Order must be linked to a User']
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Products collection
    ref: 'Product', // Reference target model
    required: [true, 'Order must contain a Product']
  },
  quantity: {
    type: Number,
    required: [true, 'Order quantity is required'],
    min: [1, 'Quantity must be at least 1'] // Order must specify at least 1 item
  }
}, {
  timestamps: true // Automatically creates 'createdAt' and 'updatedAt' fields
});

// Create and export the Order model
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
