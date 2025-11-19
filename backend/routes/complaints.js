const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// @route   POST /api/complaints/create
// @desc    Create a complaint/token after product return
// @access  Private
router.post('/create', async (req, res) => {
  try {
    const { orderId, customerId, sellerId, productId, productName, complaintText } = req.body;

    // Verify order exists and is in 'given' status (returned)
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'returned') {
      return res.status(400).json({
        success: false,
        message: 'Can only raise complaint for returned products'
      });
    }

    // Check if complaint already exists for this order
    const existingComplaint = await Complaint.findOne({ orderId });
    if (existingComplaint) {
      return res.status(400).json({
        success: false,
        message: 'Complaint already exists for this order'
      });
    }

    // Create new complaint
    const complaint = new Complaint({
      orderId,
      customerId,
      sellerId,
      productId,
      productName,
      complaintText
    });

    await complaint.save();

    // Create notification for seller
    await Notification.create({
      userId: sellerId,
      type: 'complaint_raised',
      orderId: orderId,
      message: `New complaint (Token #${complaint.tokenNumber}) raised for ${productName}`
    });

    res.status(201).json({
      success: true,
      message: 'Complaint registered successfully',
      complaint: complaint
    });

  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating complaint'
    });
  }
});

// @route   GET /api/complaints/customer/:customerId
// @desc    Get all complaints by customer
// @access  Private
router.get('/customer/:customerId', async (req, res) => {
  try {
    const complaints = await Complaint.find({ customerId: req.params.customerId })
      .populate('productId', 'name category')
      .populate('sellerId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      complaints: complaints
    });

  } catch (error) {
    console.error('Error fetching customer complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching complaints'
    });
  }
});

// @route   GET /api/complaints/seller/:sellerId
// @desc    Get all complaints for seller's products
// @access  Private
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const complaints = await Complaint.find({ sellerId: req.params.sellerId })
      .populate('productId', 'name category')
      .populate('customerId', 'firstName lastName email phoneNumber')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      complaints: complaints
    });

  } catch (error) {
    console.error('Error fetching seller complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching complaints'
    });
  }
});

// @route   PUT /api/complaints/resolve/:complaintId
// @desc    Resolve a complaint
// @access  Private
router.put('/resolve/:complaintId', async (req, res) => {
  try {
    const { resolution } = req.body;

    const complaint = await Complaint.findById(req.params.complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.status = 'resolved';
    complaint.resolution = resolution;
    await complaint.save();

    // Notify customer
    await Notification.create({
      userId: complaint.customerId,
      type: 'complaint_resolved',
      orderId: complaint.orderId,
      message: `Your complaint (Token #${complaint.tokenNumber}) has been resolved`
    });

    res.json({
      success: true,
      message: 'Complaint resolved successfully',
      complaint: complaint
    });

  } catch (error) {
    console.error('Error resolving complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resolving complaint'
    });
  }
});

// @route   GET /api/complaints/order/:orderId
// @desc    Check if complaint exists for order
// @access  Private
router.get('/order/:orderId', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ orderId: req.params.orderId });

    res.json({
      success: true,
      hasComplaint: !!complaint,
      complaint: complaint
    });

  } catch (error) {
    console.error('Error checking complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking complaint'
    });
  }
});

module.exports = router;
