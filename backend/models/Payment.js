const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'Online'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true
  },
  transactionId: {
    type: String
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Payment', paymentSchema)
