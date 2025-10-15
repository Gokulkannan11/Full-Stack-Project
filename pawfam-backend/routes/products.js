const express = require('express');
const ProductOrder = require('../models/ProductOrder');
const auth = require('../middleware/auth');
const router = express.Router();

// Create product order
router.post('/orders', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentInfo, totalAmount } = req.body;

    const order = new ProductOrder({
      user: req.user._id,
      items,
      shippingAddress,
      paymentInfo,
      totalAmount
    });

    await order.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

// Get user's product orders
router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await ProductOrder.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

module.exports = router;