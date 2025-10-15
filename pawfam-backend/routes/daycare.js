const express = require('express');
const DaycareBooking = require('../models/DaycareBooking');
const auth = require('../middleware/auth');
const router = express.Router();

// Create daycare booking
router.post('/bookings', auth, async (req, res) => {
  try {
    const {
      daycareCenter,
      petName,
      petType,
      petAge,
      startDate,
      endDate,
      specialInstructions,
      totalAmount
    } = req.body;

    const booking = new DaycareBooking({
      user: req.user._id,
      daycareCenter,
      petName,
      petType,
      petAge,
      startDate,
      endDate,
      specialInstructions,
      totalAmount
    });

    await booking.save();

    res.status(201).json({
      message: 'Daycare booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ message: 'Server error creating booking' });
  }
});

// Get user's daycare bookings
router.get('/bookings', auth, async (req, res) => {
  try {
    const bookings = await DaycareBooking.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
});

module.exports = router;