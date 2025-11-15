const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../config/email');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, program, course, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      program,
      course,
      phoneNumber
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        program: user.program,
        course: user.course,
        phoneNumber: user.phoneNumber
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: errors.join(', ') 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        program: user.program,
        course: user.course,
        phoneNumber: user.phoneNumber
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide an email address' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ 
        success: true,
        message: 'If an account exists with this email, a reset link will be sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expire time (1 hour)
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    
    await user.save();

    // Send email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
      
      res.json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } catch (emailError) {
      // Remove reset token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      
      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please check email configuration.'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during password reset request' 
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset user password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide token and new password' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    // Hash the token from URL
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by token and check if token is not expired
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired reset token' 
      });
    }

    // Set new password (will be hashed by pre-save middleware)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during password reset' 
    });
  }
});

// @route   GET /api/auth/users
// @desc    Get all registered users (for testing/admin purposes)
// @access  Public
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Exclude password field
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching users' 
    });
  }
});

module.exports = router;
