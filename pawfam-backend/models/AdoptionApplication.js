const mongoose = require('mongoose');

const AdoptionApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pet: {
    id: String,
    name: String,
    type: String,
    breed: String,
    age: String,
    shelter: String
  },
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    address: String
  },
  experience: {
    level: String,
    details: String,
    otherPets: String,
    otherPetsDetails: String
  },
  visitSchedule: {
    date: Date,
    time: String
  },
  adoptionReason: String,
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'scheduled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AdoptionApplication', AdoptionApplicationSchema);