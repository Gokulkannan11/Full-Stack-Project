const mongoose = require('mongoose');

const ProductOrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  shippingAddress: {
    fullName: String,
    email: String,
    address: String,
    city: String,
    state: String,
    zipCode: {
      type: String,
      match: [/^\d{6}$/, 'ZIP Code must be exactly 6 digits']
    }
  },
  paymentInfo: {
    cardNumber: String,
    expiryDate: String,
    cvv: String
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductOrder', ProductOrderSchema);