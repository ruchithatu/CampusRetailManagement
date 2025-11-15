const mongoose = require('mongoose')

const productHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  productName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['added', 'edited', 'deleted']
  },
  details: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('ProductHistory', productHistorySchema)
