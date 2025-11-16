const express = require('express')
const router = express.Router()
const Notification = require('../models/Notification')

// Get all notifications for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const notifications = await Notification.find({ userId })
      .populate('orderId', 'orderId productName orderType totalAmount')
      .sort({ createdAt: -1 })
      .limit(50)

    res.json({
      success: true,
      notifications
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    })
  }
})

// Get unread notification count
router.get('/unread/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const count = await Notification.countDocuments({ userId, isRead: false })

    res.json({
      success: true,
      count
    })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    })
  }
})

// Mark notification as read
router.put('/read/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    )

    res.json({
      success: true,
      notification
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    })
  }
})

// Mark all notifications as read for a user
router.put('/read-all/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    )

    res.json({
      success: true,
      message: 'All notifications marked as read'
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message
    })
  }
})

// Delete a notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params
    
    await Notification.findByIdAndDelete(notificationId)

    res.json({
      success: true,
      message: 'Notification deleted'
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    })
  }
})

module.exports = router
