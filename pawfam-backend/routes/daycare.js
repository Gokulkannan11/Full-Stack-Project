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

    // Validate required fields
    if (!daycareCenter || !petName || !petType || !petAge || !startDate || !endDate || !totalAmount) {
      return res.status(400).json({
        message: 'Please provide all required fields'
      });
    }

    const booking = new DaycareBooking({
      user: req.user._id,
      daycareCenter,
      petName,
      petType,
      petAge,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      specialInstructions: specialInstructions || '',
      totalAmount,
      status: 'pending'
    });

    await booking.save();

    res.status(201).json({
      message: 'Daycare booking created successfully',
      booking: {
        _id: booking._id,
        daycareCenter: booking.daycareCenter,
        petName: booking.petName,
        petType: booking.petType,
        petAge: booking.petAge,
        startDate: booking.startDate,
        endDate: booking.endDate,
        specialInstructions: booking.specialInstructions,
        totalAmount: booking.totalAmount,
        status: booking.status,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      message: 'Server error creating booking',
      error: error.message
    });
  }
});

// Get user's daycare bookings
router.get('/bookings', auth, async (req, res) => {
  try {
    const { search } = req.query;

    let query = { user: req.user._id };

    // If search keyword is provided, add search criteria
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive search

      query.$or = [
        { petName: searchRegex },
        { petType: searchRegex },
        { 'daycareCenter.name': searchRegex },
        { 'daycareCenter.location': searchRegex },
        { specialInstructions: searchRegex },
        { status: searchRegex }
      ];
    }

    const bookings = await DaycareBooking.find(query)
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      message: 'Server error fetching bookings',
      error: error.message
    });
  }
});

// Get single booking by ID
router.get('/bookings/:id', auth, async (req, res) => {
  try {
    const booking = await DaycareBooking.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      message: 'Server error fetching booking',
      error: error.message
    });
  }
});

// Update booking status (for admin/vendor)
router.patch('/bookings/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await DaycareBooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      message: 'Booking status updated',
      booking
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      message: 'Server error updating status',
      error: error.message
    });
  }
});

// Cancel booking
router.patch('/bookings/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await DaycareBooking.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        message: 'Cannot cancel a booking that is already completed or cancelled'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      message: 'Server error cancelling booking',
      error: error.message
    });
  }
});

// Delete booking
router.delete('/bookings/:id', auth, async (req, res) => {
  try {
    const booking = await DaycareBooking.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      message: 'Booking deleted successfully',
      deletedBooking: {
        id: booking._id,
        petName: booking.petName
      }
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      message: 'Server error deleting booking',
      error: error.message
    });
  }
});

module.exports = router;