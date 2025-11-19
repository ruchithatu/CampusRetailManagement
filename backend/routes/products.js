const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const ProductHistory = require('../models/ProductHistory')
const multer = require('multer')
const path = require('path')

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'))
    }
  }
})

// Add new product
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { userId, name, category, price, dept, availabilityFrom, availabilityTo, damageLeft, damageRight, description } = req.body
    
    const productData = {
      userId,
      name,
      category,
      price,
      dept,
      availabilityFrom,
      availabilityTo,
      damageLeft,
      damageRight,
      description
    }
    
    // Add image filename if uploaded
    if (req.file) {
      productData.image = req.file.filename
    }

    const newProduct = new Product(productData)

    const savedProduct = await newProduct.save()

    // Create history entry
    await ProductHistory.create({
      userId: savedProduct.userId,
      productId: savedProduct._id,
      productName: savedProduct.name,
      action: 'added',
      details: `Product "${savedProduct.name}" was added`
    })

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product: savedProduct
    })
  } catch (error) {
    console.error('Error adding product:', error)
    res.status(500).json({
      success: false,
      message: 'Error adding product',
      error: error.message
    })
  }
})

// Get all products for a specific user (for management)
router.get('/list/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const products = await Product.find({ userId }).sort({ createdAt: -1 })
    res.json({
      success: true,
      products
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    })
  }
})

// Get all products from all users (for marketplace/dashboard)
router.get('/all', async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
    res.json({
      success: true,
      products
    })
  } catch (error) {
    console.error('Error fetching all products:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching all products',
      error: error.message
    })
  }
})

// Update product
router.put('/edit/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params
    const { name, category, price, dept, availabilityFrom, availabilityTo, damageLeft, damageRight, description } = req.body

    const updateData = {
      name,
      category,
      price,
      dept,
      availabilityFrom,
      availabilityTo,
      damageLeft,
      damageRight,
      description
    }
    
    // Add new image filename if uploaded
    if (req.file) {
      updateData.image = req.file.filename
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    // Create history entry
    await ProductHistory.create({
      userId: updatedProduct.userId,
      productId: updatedProduct._id,
      productName: updatedProduct.name,
      action: 'edited',
      details: `Product "${updatedProduct.name}" was edited`
    })

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    })
  } catch (error) {
    console.error('Error updating product:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    })
  }
})

// Delete product
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params
    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    const productName = product.name
    const productUserId = product.userId

    await Product.findByIdAndDelete(id)

    // Create history entry
    await ProductHistory.create({
      userId: productUserId,
      productId: null,
      productName: productName,
      action: 'deleted',
      details: `Product "${productName}" was deleted`
    })

    res.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    })
  }
})

// Get product history for a specific user
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    // Get all products for this user to filter history
    const userProducts = await Product.find({ userId }).select('_id')
    const productIds = userProducts.map(p => p._id)
    
    // Get history for user's products or where productId is null (deleted items) and matches user
    const history = await ProductHistory.find({
      $or: [
        { productId: { $in: productIds } },
        { productId: null, userId: userId }
      ]
    }).sort({ timestamp: -1 })
    
    res.json({
      success: true,
      history
    })
  } catch (error) {
    console.error('Error fetching history:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching history',
      error: error.message
    })
  }
})

module.exports = router
