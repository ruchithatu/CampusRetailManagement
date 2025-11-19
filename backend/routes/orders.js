const express = require('express')
const router = express.Router()
const Order = require('../models/Order')
const Payment = require('../models/Payment')
const Product = require('../models/Product')
const User = require('../models/User')
const Notification = require('../models/Notification')

// Check availability for rent
router.post('/check-availability', async (req, res) => {
  try {
    const { productId, rentFrom, rentTo } = req.body

    // Find overlapping orders
    const overlappingOrders = await Order.find({
      productId,
      orderType: 'rent',
      status: { $in: ['approved', 'given'] },
      $or: [
        {
          rentFrom: { $lte: new Date(rentTo) },
          rentTo: { $gte: new Date(rentFrom) }
        }
      ]
    })

    res.json({
      success: true,
      available: overlappingOrders.length === 0,
      message: overlappingOrders.length > 0 ? 'Product not available for selected dates' : 'Product available'
    })
  } catch (error) {
    console.error('Error checking availability:', error)
    res.status(500).json({
      success: false,
      message: 'Error checking availability',
      error: error.message
    })
  }
})

// Create new order
router.post('/create', async (req, res) => {
  try {
    const {
      customerId,
      sellerId,
      productId,
      productName,
      orderType,
      rentFrom,
      rentTo,
      pickupLocation,
      paymentMethod,
      paymentDetails,
      totalAmount
    } = req.body

    // Create order
    const newOrder = new Order({
      customerId,
      sellerId,
      productId,
      productName,
      orderType,
      rentFrom: orderType === 'rent' ? rentFrom : undefined,
      rentTo: orderType === 'rent' ? rentTo : undefined,
      pickupLocation,
      paymentMethod,
      paymentDetails: paymentMethod === 'Online' ? paymentDetails : undefined,
      totalAmount,
      status: 'pending',
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'paid' : 'pending'
    })

    const savedOrder = await newOrder.save()

    // Create payment record
    const newPayment = new Payment({
      orderId: savedOrder._id,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'paid' : 'pending',
      amount: totalAmount
    })

    await newPayment.save()

    // If product is bought (non-electronic), mark it as unavailable
    if (orderType === 'buy') {
      await Product.findByIdAndUpdate(productId, {
        isAvailable: false
      })
    }

    // If product availability needs to be updated for rent
    if (orderType === 'rent') {
      await Product.findByIdAndUpdate(productId, {
        availabilityFrom: rentFrom,
        availabilityTo: rentTo
      })
    }

    // Create notification for seller
    const seller = await User.findById(sellerId)
    if (seller) {
      const notificationMessage = `New ${orderType} order received for ${productName} - Order #${savedOrder.orderId}`
      
      await Notification.create({
        userId: sellerId,
        type: 'order_placed',
        orderId: savedOrder._id,
        message: notificationMessage
      })
    }

    res.json({
      success: true,
      message: 'Order created successfully',
      order: savedOrder
    })
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    })
  }
})

// Get orders for a seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params
    const orders = await Order.find({ sellerId })
      .populate('customerId', 'firstName lastName email')
      .populate('productId', 'name image')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      orders
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    })
  }
})

// Get orders for a customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params
    const orders = await Order.find({ customerId })
      .populate('sellerId', 'firstName lastName email')
      .populate('productId', 'name image')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      orders
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    })
  }
})

// Approve order
router.put('/approve/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: 'approved' },
      { new: true }
    ).populate('customerId', 'firstName lastName email phoneNumber')
     .populate('productId', 'name')

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    // Create notification for buyer
    const notificationMessage = `Your order #${order.orderId} for ${order.productName} has been approved by the seller`
    
    await Notification.create({
      userId: order.customerId._id,
      type: 'order_approved',
      orderId: order._id,
      message: notificationMessage
    })

    res.json({
      success: true,
      message: 'Order approved',
      order
    })
  } catch (error) {
    console.error('Error approving order:', error)
    res.status(500).json({
      success: false,
      message: 'Error approving order',
      error: error.message
    })
  }
})

// Mark order as given (handed over to customer)
router.put('/given/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: 'given' },
      { new: true }
    )

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    res.json({
      success: true,
      message: 'Order marked as given',
      order
    })
  } catch (error) {
    console.error('Error updating order:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message
    })
  }
})

// Return order (customer returns the product)
router.put('/return/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: 'returned' },
      { new: true }
    ).populate('productId').populate('customerId', 'firstName lastName')

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    // If it's a purchased product, mark it as available again
    if (order.orderType === 'buy' && order.productId) {
      await Product.findByIdAndUpdate(order.productId._id, {
        isAvailable: true
      })
    }

    // Create notification for seller about the return
    const notificationMessage = `${order.customerId.firstName} ${order.customerId.lastName} has returned ${order.productName} - Order #${order.orderId}`
    
    await Notification.create({
      userId: order.sellerId,
      type: 'order_returned',
      orderId: order._id,
      message: notificationMessage
    })

    res.json({
      success: true,
      message: 'Product returned successfully',
      order
    })
  } catch (error) {
    console.error('Error returning product:', error)
    res.status(500).json({
      success: false,
      message: 'Error returning product',
      error: error.message
    })
  }
})

module.exports = router
