const mongoose = require('mongoose')

const complaintSchema = new mongoose.Schema({
  tokenNumber: {
    type: Number,
    required: true,
    unique: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  complaintText: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'rejected'],
    default: 'pending'
  },
  resolution: {
    type: String
  }
}, {
  timestamps: true
})

// Auto-increment tokenNumber
complaintSchema.pre('save', async function(next) {
  if (this.isNew && !this.tokenNumber) {
    try {
      const lastComplaint = await mongoose.model('Complaint').findOne().sort({ tokenNumber: -1 }).exec()
      this.tokenNumber = lastComplaint ? lastComplaint.tokenNumber + 1 : 1001
    } catch (error) {
      console.error('Error auto-incrementing tokenNumber:', error)
      this.tokenNumber = 1001
    }
  }
  next()
})

module.exports = mongoose.model('Complaint', complaintSchema)
