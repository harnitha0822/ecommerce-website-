const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Get all users
// @route   GET /users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving users', error: error.message });
  }
});

// @desc    Get a single user by ID
// @route   GET /users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user details', error: error.message });
  }
});

// @desc    Create a new user
// @route   POST /users
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ message: 'Please provide both name and email' });
    }

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const newUser = new User({ name, email });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser); // 201 means "Created"
  } catch (error) {
    res.status(400).json({ message: 'Failed to create user', error: error.message });
  }
});

// @desc    Update a user's details by ID
// @route   PUT /users/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Find and update the user; {new: true} returns the updated document, {runValidators: true} runs schema validation
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update user', error: error.message });
  }
});

// @desc    Delete a user by ID
// @route   DELETE /users/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User successfully deleted', user: deletedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

module.exports = router;
