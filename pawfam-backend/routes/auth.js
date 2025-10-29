const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Register user (customer)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Please provide username, email, and password'
      });
    }

    // Check if user exists with email
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        message: 'User already exists with this email'
      });
    }

    // Check if user exists with username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        message: 'Username is already taken'
      });
    }

    // Create new user (password will be hashed by the User model pre-save hook)
    const user = new User({
      username,
      email: email.toLowerCase(),
      password,
      role: 'customer'
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `This ${field} is already registered`
      });
    }

    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Register vendor
router.post('/vendor/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Please provide username, email, and password'
      });
    }

    // Check if user exists with email
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        message: 'User already exists with this email'
      });
    }

    // Check if user exists with username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        message: 'Username is already taken'
      });
    }

    // Create new vendor
    const vendor = new User({
      username,
      email: email.toLowerCase(),
      password,
      role: 'vendor'
    });

    await vendor.save();

    // Generate token
    const token = jwt.sign(
      { userId: vendor._id, role: vendor.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: vendor._id,
        username: vendor.username,
        email: vendor.email,
        role: vendor.role
      },
      message: 'Vendor registered successfully'
    });
  } catch (error) {
    console.error('Vendor registration error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `This ${field} is already registered`
      });
    }

    res.status(500).json({ message: 'Server error during vendor registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user (case-insensitive email)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Login vendor
router.post('/vendor/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find vendor (case-insensitive email and role check)
    const vendor = await User.findOne({
      email: email.toLowerCase(),
      role: 'vendor'
    });

    if (!vendor) {
      return res.status(400).json({ message: 'Invalid credentials or not a vendor account' });
    }

    // Check password
    const isMatch = await vendor.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: vendor._id, role: vendor.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: vendor._id,
        username: vendor.username,
        email: vendor.email,
        role: vendor.role
      },
      message: 'Vendor login successful'
    });
  } catch (error) {
    console.error('Vendor login error:', error);
    res.status(500).json({ message: 'Server error during vendor login' });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // In a real application, you would send an email with a reset link
    // For now, we'll just return a success message
    res.json({
      message: 'Password reset instructions have been sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;