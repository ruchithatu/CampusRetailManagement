const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  orderId: {
    type: Number
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
  orderType: {
    type: String,
    enum: ['rent', 'buy'],
    required: true
  },
  rentFrom: {
    type: Date
  },
  rentTo: {
    type: Date
  },
  pickupLocation: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'Online', 'N/A'],
    required: true
  },
  paymentDetails: {
    upiId: String,
    cardNumber: String
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'given', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  }
}, {
  timestamps: true
})

// Auto-increment orderId
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderId) {
    try {
      const lastOrder = await mongoose.model('Order').findOne().sort({ orderId: -1 }).exec()
      this.orderId = lastOrder ? lastOrder.orderId + 1 : 1
    } catch (error) {
      console.error('Error auto-incrementing orderId:', error)
      this.orderId = 1
    }
  }
  next()
})

module.exports = mongoose.model('Order', orderSchema)
