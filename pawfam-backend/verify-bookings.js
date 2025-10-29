// verify-bookings.js
// Run this script to verify MongoDB connection and data
// Usage: node verify-bookings.js

const mongoose = require('mongoose');
require('dotenv').config();

const DaycareBooking = require('./models/DaycareBooking');
const ProductOrder = require('./models/ProductOrder');
const AdoptionApplication = require('./models/AdoptionApplication');
const User = require('./models/User');

async function verifyBookings() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Check Users
    const userCount = await User.countDocuments();
    console.log(Users in database: ${userCount});
    if (userCount > 0) {
      const sampleUser = await User.findOne().select('username email role');
      console.log('Sample user:', sampleUser);
    }
    console.log('');

    // Check Daycare Bookings
    const daycareCount = await DaycareBooking.countDocuments();
    console.log(Daycare bookings: ${daycareCount});
    if (daycareCount > 0) {
      const recentDaycare = await DaycareBooking.findOne()
        .sort({ createdAt: -1 })
        .populate('user', 'username email');
      console.log('Most recent daycare booking:');
      console.log({
        id: recentDaycare._id,
        user: recentDaycare.user?.username,
        petName: recentDaycare.petName,
        center: recentDaycare.daycareCenter?.name,
        status: recentDaycare.status,
        createdAt: recentDaycare.createdAt
      });
    }
    console.log('');

    // Check Product Orders
    const orderCount = await ProductOrder.countDocuments();
    console.log(Product orders: ${orderCount});
    if (orderCount > 0) {
      const recentOrder = await ProductOrder.findOne()
        .sort({ createdAt: -1 })
        .populate('user', 'username email');
      console.log('Most recent product order:');
      console.log({
        id: recentOrder._id,
        user: recentOrder.user?.username,
        items: recentOrder.items?.length,
        totalAmount: recentOrder.totalAmount,
        status: recentOrder.status,
        createdAt: recentOrder.createdAt
      });
    }
    console.log('');

    // Check Adoption Applications
    const adoptionCount = await AdoptionApplication.countDocuments();
    console.log(Adoption applications: ${adoptionCount});
    if (adoptionCount > 0) {
      const recentAdoption = await AdoptionApplication.findOne()
        .sort({ createdAt: -1 })
        .populate('user', 'username email');
      console.log('Most recent adoption application:');
      console.log({
        id: recentAdoption._id,
        user: recentAdoption.user?.username,
        petName: recentAdoption.pet?.name,
        petType: recentAdoption.pet?.type,
        status: recentAdoption.status,
        createdAt: recentAdoption.createdAt
      });
    }
    console.log('');

    // Summary
    console.log('=== SUMMARY ===');
    console.log(Total Users: ${userCount});
    console.log(Total Daycare Bookings: ${daycareCount});
    console.log(Total Product Orders: ${orderCount});
    console.log(Total Adoption Applications: ${adoptionCount});
    console.log(Total Bookings: ${daycareCount + orderCount + adoptionCount});

    // Test data suggestion
    if (daycareCount === 0 && orderCount === 0 && adoptionCount === 0) {
      console.log('\n⚠  No bookings found!');
      console.log('Suggestions:');
      console.log('1. Create test bookings through the frontend application');
      console.log('2. Use the API endpoints to create test data');
      console.log('3. Run: npm run seed (if seed script exists)');
    } else {
      console.log('\n✓ Bookings data exists!');
      console.log('The BookingsPage should display data correctly.');
    }

  } catch (error) {
    console.error('Error verifying bookings:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed.');
    process.exit(0);
  }
}

// Run verification
verifyBookings();