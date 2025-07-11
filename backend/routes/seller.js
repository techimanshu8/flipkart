const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is a seller
const sellerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'seller') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Seller only.' });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// @route   GET /api/seller/dashboard
// @desc    Get seller dashboard data
// @access  Private/Seller
router.get('/dashboard', protect, sellerOnly, async (req, res) => {
  try {
    const sellerId = req.user.id;
    
    // Get total products
    const totalProducts = await Product.countDocuments({ seller: sellerId });
    
    // Get total orders for seller's products
    const totalOrders = await Order.countDocuments({
      'orderItems.product': { $in: await Product.find({ seller: sellerId }).distinct('_id') }
    });
    
    // Get total revenue
    const revenueData = await Order.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $match: {
          'productDetails.seller': sellerId,
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    
    // Get recent orders
    const recentOrders = await Order.find({
      'orderItems.product': { $in: await Product.find({ seller: sellerId }).distinct('_id') }
    })
    .populate('orderItems.product', 'name images')
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);
    
    // Get low stock products
    const lowStockProducts = await Product.find({
      seller: sellerId,
      stock: { $lt: 10 }
    }).select('name stock').limit(10);
    
    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalRevenue,
        recentOrders,
        lowStockProducts
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/seller/products
// @desc    Get seller's products
// @access  Private/Seller
router.get('/products', protect, sellerOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const products = await Product.find({ seller: req.user.id })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalProducts = await Product.countDocuments({ seller: req.user.id });
    
    res.json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/seller/products
// @desc    Create new product
// @access  Private/Seller
router.post('/products', protect, sellerOnly, upload.array('images', 5), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      brand,
      stock,
      specifications,
      features,
      warranty,
      returnPolicy,
      deliveryTime
    } = req.body;

    // Generate unique SKU
    const sku = `${req.user.id.slice(-6)}-${Date.now()}`;

    // Process uploaded images
    const images = req.files ? req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      alt: name
    })) : [];

    // Parse specifications and features if they're strings
    let parsedSpecifications = [];
    let parsedFeatures = [];
    
    if (specifications) {
      parsedSpecifications = typeof specifications === 'string' 
        ? JSON.parse(specifications) 
        : specifications;
    }
    
    if (features) {
      parsedFeatures = typeof features === 'string' 
        ? JSON.parse(features) 
        : features;
    }

    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      category,
      brand,
      stock,
      sku,
      images,
      specifications: parsedSpecifications,
      features: parsedFeatures,
      seller: req.user.id,
      warranty: warranty || 'No warranty',
      returnPolicy: returnPolicy || '7 days return policy',
      deliveryTime: deliveryTime || '3-5 days'
    });

    const savedProduct = await product.save();
    await savedProduct.populate('category', 'name');

    res.status(201).json({
      success: true,
      product: savedProduct
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/seller/products/:id
// @desc    Update product
// @access  Private/Seller
router.put('/products/:id', protect, sellerOnly, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if product belongs to seller
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      name,
      description,
      price,
      originalPrice,
      category,
      brand,
      stock,
      specifications,
      features,
      warranty,
      returnPolicy,
      deliveryTime
    } = req.body;

    // Process new images if uploaded
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        alt: name || product.name
      }));
    }

    // Parse specifications and features if they're strings
    let parsedSpecifications = product.specifications;
    let parsedFeatures = product.features;
    
    if (specifications) {
      parsedSpecifications = typeof specifications === 'string' 
        ? JSON.parse(specifications) 
        : specifications;
    }
    
    if (features) {
      parsedFeatures = typeof features === 'string' 
        ? JSON.parse(features) 
        : features;
    }

    // Update product
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.originalPrice = originalPrice || product.originalPrice;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.stock = stock !== undefined ? stock : product.stock;
    product.specifications = parsedSpecifications;
    product.features = parsedFeatures;
    product.warranty = warranty || product.warranty;
    product.returnPolicy = returnPolicy || product.returnPolicy;
    product.deliveryTime = deliveryTime || product.deliveryTime;
    
    if (newImages.length > 0) {
      product.images = newImages;
    }

    const updatedProduct = await product.save();
    await updatedProduct.populate('category', 'name');

    res.json({
      success: true,
      product: updatedProduct
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/seller/products/:id
// @desc    Delete product
// @access  Private/Seller
router.delete('/products/:id', protect, sellerOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if product belongs to seller
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/seller/orders
// @desc    Get orders for seller's products
// @access  Private/Seller
router.get('/orders', protect, sellerOnly, async (req, res) => {
  try {
    const sellerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get seller's product IDs
    const sellerProductIds = await Product.find({ seller: sellerId }).distinct('_id');
    
    // Find orders containing seller's products
    const orders = await Order.find({
      'orderItems.product': { $in: sellerProductIds }
    })
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images seller')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    // Filter orders to only include seller's products
    const filteredOrders = orders.map(order => {
      const sellerItems = order.orderItems.filter(item => 
        item.product.seller.toString() === sellerId
      );
      
      return {
        ...order.toObject(),
        orderItems: sellerItems
      };
    }).filter(order => order.orderItems.length > 0);
    
    const totalOrders = await Order.countDocuments({
      'orderItems.product': { $in: sellerProductIds }
    });
    
    res.json({
      success: true,
      orders: filteredOrders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/seller/orders/:id/accept
// @desc    Accept order
// @access  Private/Seller
router.put('/orders/:id/accept', protect, sellerOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order contains seller's products
    const sellerProducts = await Product.find({ seller: req.user.id }).distinct('_id');
    const hasSellerProducts = order.orderItems.some(item => 
      sellerProducts.some(productId => productId.toString() === item.product.toString())
    );
    
    if (!hasSellerProducts) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update order status
    order.status = 'confirmed';
    await order.save();
    
    res.json({
      success: true,
      message: 'Order accepted successfully',
      order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/seller/orders/:id/ship
// @desc    Mark order as shipped
// @access  Private/Seller
router.put('/orders/:id/ship', protect, sellerOnly, async (req, res) => {
  try {
    const { trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order contains seller's products
    const sellerProducts = await Product.find({ seller: req.user.id }).distinct('_id');
    const hasSellerProducts = order.orderItems.some(item => 
      sellerProducts.some(productId => productId.toString() === item.product.toString())
    );
    
    if (!hasSellerProducts) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update order status
    order.status = 'shipped';
    order.trackingNumber = trackingNumber;
    await order.save();
    
    res.json({
      success: true,
      message: 'Order marked as shipped',
      order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/seller/orders/:id/cancel
// @desc    Cancel order
// @access  Private/Seller
router.put('/orders/:id/cancel', protect, sellerOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order contains seller's products
    const sellerProducts = await Product.find({ seller: req.user.id }).distinct('_id');
    const hasSellerProducts = order.orderItems.some(item => 
      sellerProducts.some(productId => productId.toString() === item.product.toString())
    );
    
    if (!hasSellerProducts) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Only allow cancellation if order is pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }
    
    // Update order status
    order.status = 'cancelled';
    order.notes = reason || 'Cancelled by seller';
    await order.save();
    
    // Restore stock for seller's products
    for (let item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product && product.seller.toString() === req.user.id) {
        product.stock += item.quantity;
        await product.save();
      }
    }
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
