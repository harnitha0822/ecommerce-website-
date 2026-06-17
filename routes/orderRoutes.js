const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get all orders (with User and Product data populated)
// @route   GET /orders
router.get('/', async (req, res) => {
  try {
    // .populate() replaces ObjectIds with actual documents from referenced collections
    const orders = await Order.find({})
      .populate('userId', 'name email') // Only retrieve name and email fields from User
      .populate('productId', 'name price'); // Only retrieve name and price from Product
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving orders', error: error.message });
  }
});

// @desc    Get a single order by ID
// @route   GET /orders/:id
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('productId', 'name price');
      
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving order details', error: error.message });
  }
});

// @desc    Create a new order (with stock validation and deduction)
// @route   POST /orders
router.post('/', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // 1. Validation: check if fields are provided
    if (!userId || !productId || !quantity) {
      return res.status(400).json({ message: 'Please provide userId, productId, and quantity' });
    }

    // 2. Validate User exists in database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'Invalid User ID. User does not exist.' });
    }

    // 3. Validate Product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ message: 'Invalid Product ID. Product does not exist.' });
    }

    // 4. Validate stock availability
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock. Only ${product.stock} units available, but ${quantity} were requested.` 
      });
    }

    // 5. Deduct product stock and save product update
    product.stock -= quantity;
    await product.save();

    // 6. Create and save new Order
    const newOrder = new Order({ userId, productId, quantity });
    const savedOrder = await newOrder.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Failed to place order', error: error.message });
  }
});

// @desc    Update an order's quantity (with stock adjustment logic)
// @route   PUT /orders/:id
router.put('/:id', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Find the original order
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify product exists
    const product = await Product.findById(productId || order.productId);
    if (!product) {
      return res.status(400).json({ message: 'Product linked to this order does not exist' });
    }

    // If product is the same, we check the difference in quantity
    if (order.productId.toString() === productId) {
      const difference = quantity - order.quantity; // positive if ordering more, negative if ordering less
      
      // If ordering more, check stock
      if (difference > 0 && product.stock < difference) {
        return res.status(400).json({ message: `Insufficient stock for updating order. Need ${difference} more but only have ${product.stock}.` });
      }

      // Adjust stock and save product
      product.stock -= difference;
      await product.save();
    } else {
      // If product has changed, we return stock to old product and deduct from new product
      const oldProduct = await Product.findById(order.productId);
      if (oldProduct) {
        oldProduct.stock += order.quantity; // Restock old product
        await oldProduct.save();
      }

      // Check stock on new product
      if (product.stock < quantity) {
        // Rollback old product restock if new one fails
        if (oldProduct) {
          oldProduct.stock -= order.quantity;
          await oldProduct.save();
        }
        return res.status(400).json({ message: `New product does not have enough stock (${product.stock} available).` });
      }

      product.stock -= quantity; // Deduct new product stock
      await product.save();
    }

    // Update order values
    order.userId = userId || order.userId;
    order.productId = productId || order.productId;
    order.quantity = quantity || order.quantity;

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update order details', error: error.message });
  }
});

// @desc    Delete an order by ID (with stock replenishment)
// @route   DELETE /orders/:id
router.delete('/:id', async (req, res) => {
  try {
    // Find the order first to know the details
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Replenish the product stock
    const product = await Product.findById(order.productId);
    if (product) {
      product.stock += order.quantity;
      await product.save();
    }

    // Delete the order record
    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Order successfully cancelled and deleted', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete order', error: error.message });
  }
});

module.exports = router;
