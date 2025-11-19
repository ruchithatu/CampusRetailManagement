const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronic', 'Non-Electronic']
  },
  price: {
    type: Number,
    default: null
  },
  dept: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: null
  },
  availabilityFrom: {
    type: Date,
    default: null
  },
  availabilityTo: {
    type: Date,
    default: null
  },
  damageLeft: {
    type: String,
    default: ''
  },
  damageRight: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Product', productSchema)
