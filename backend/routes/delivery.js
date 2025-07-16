const express = require('express');
const router = express.Router();
const DeliveryAgent = require('../models/DeliveryAgent');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect} = require('../middleware/auth');
const crypto = require('crypto');
// const sendEmail = require('../utils/sendEmail');

const authorize = (req, res, next) => {
  if (req.user && req.user.role === 'delivery') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Delivery only.' });
  }
};




// @route   POST /api/delivery/register
// @desc    Register delivery agent
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      vehicleType,
      vehicleNumber,
      licenseNumber,
      aadharNumber,
      area
    } = req.body;

    // Create user with delivery role
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'delivery', 
      deliveryInfo: {
        isAvailable: true,
        vehicleType,
        vehicleNumber}
    });

    // Create delivery agent profile
    const deliveryAgent = await DeliveryAgent.create({
      user: user._id,
      vehicleType,
      vehicleNumber,
      licenseNumber,
      aadharNumber,
      area
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please wait for admin verification.'
    });
  } catch (error) {
    console.error(error);
    console.error(req.body);
    res.status(500).json({ message: 'Registration failed from server' });
  }
});

// @route   POST /api/delivery/orders/:orderId/accept
// @desc    Accept order for delivery
// @access  Private/Delivery
router.post('/orders/:orderId/generateotp', protect, authorize, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const deliveryAgent = await DeliveryAgent.findOne({ user: req.user.id });
    if (!deliveryAgent) {
      return res.status(404).json({ message: 'Delivery agent not found' });
    }

    if (order.status !== 'out_for_delivery') {
      return res.status(400).json({ message: 'Order is not ready for delivery' });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    order.deliveryOTP = otp;
    await order.save();

    res.json({
      success: true,
      message: 'Order accepted for delivery'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to accept order' });
  }
});

// @route   POST /api/delivery/orders/:orderId/complete
// @desc    Complete delivery with OTP verification
// @access  Private/Delivery
router.post('/orders/:orderId/complete', protect, authorize, async (req, res) => {
  try {
    const { otp } = req.body;
    
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.deliveryOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    order.status = 'delivered';
    order.deliveredAt = Date.now();
    order.isDelivered = true;
    order.deliveryOTP = null; // Clear OTP after successful delivery
    order.deliveryAttempts.push({
      attemptedAt: Date.now(),
      status: 'success',
      notes: 'Delivery completed successfully'
    });
    await order.save();

    // Update delivery agent stats
    const deliveryAgent = await DeliveryAgent.findOne({ user: req.user.id });
    deliveryAgent.totalDeliveries += 1;
    deliveryAgent.activeOrder = null;
    await deliveryAgent.save();

    res.json({
      success: true,
      message: 'Delivery completed successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to complete delivery' });
  }
});

// @route   GET /api/delivery/orders/available
// @desc    Get available orders for delivery
// @access  Private/Delivery
router.get('/orders/available', protect, authorize, async (req, res) => {
  try {
    // check if the delivery agent is available
    const deliveryUser = await DeliveryAgent.findOne({ user: req.user.id, isAvailable: true });
    if (!deliveryUser) {
      return res.status(403).json({ message: 'You are not eligible for delivery'
    });
    }
    // Fetch orders that are ready for delivery
    const orders = await Order.find({
      status: 'out_for_delivery',
      deliveryAgent: deliveryUser._id
    });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// @route   PUT /api/delivery/location
// @desc    Update delivery agent location
// @access  Private/Delivery
router.put('/location', protect, authorize, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const deliveryAgent = await DeliveryAgent.findOne({ user: req.user.id });
    if (!deliveryAgent) {
      return res.status(404).json({ message: 'Delivery agent not found' });
    }

    deliveryAgent.currentLocation = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
    await deliveryAgent.save();

    res.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update location' });
  }
});

// @route get /api/delivery/agents
// @desc Get Avaialbles delivery agents for delivery
// @access Private/Delivery
router.get('/agents', protect,async (req, res) => {
  try {
    const deliveryAgents = await DeliveryAgent.find({ isAvailable: true })
      .populate('user', 'name email phone');
    if (!deliveryAgents || deliveryAgents.length === 0) {
      return res.status(404).json({ message: 'No available delivery agents found' });
    }
    res.json({
      success: true,
      deliveryAgents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch delivery agents' });
  }
});

module.exports = router;
