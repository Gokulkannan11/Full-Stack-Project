const express = require('express');
const AdoptionApplication = require('../models/AdoptionApplication');
const auth = require('../middleware/auth');
const router = express.Router();

// Create adoption application
router.post('/applications', auth, async (req, res) => {
  try {
    const {
      pet,
      personalInfo,
      experience,
      visitSchedule,
      adoptionReason
    } = req.body;

    const application = new AdoptionApplication({
      user: req.user._id,
      pet,
      personalInfo,
      experience,
      visitSchedule,
      adoptionReason
    });

    await application.save();

    res.status(201).json({
      message: 'Adoption application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Application creation error:', error);
    res.status(500).json({ message: 'Server error submitting application' });
  }
});

// Get user's adoption applications
router.get('/applications', auth, async (req, res) => {
  try {
    const applications = await AdoptionApplication.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
});

module.exports = router;