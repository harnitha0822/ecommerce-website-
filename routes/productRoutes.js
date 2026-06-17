const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving products', error: error.message });
  }
});

// @desc    Get a single product by ID
// @route   GET /products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving product details', error: error.message });
  }
});

// @desc    Create a new product
// @route   POST /products
router.post('/', async (req, res) => {
  try {
    const { name, price, stock } = req.body;

    // Validation
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ message: 'Please provide name, price, and stock' });
    }

    const newProduct = new Product({ name, price, stock });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct); // 201 Created
  } catch (error) {
    res.status(400).json({ message: 'Failed to create product', error: error.message });
  }
});

// @desc    Update a product by ID
// @route   PUT /products/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, price, stock } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, stock },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update product', error: error.message });
  }
});

// @desc    Delete a product by ID
// @route   DELETE /products/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product successfully deleted', product: deletedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
});

module.exports = router;
