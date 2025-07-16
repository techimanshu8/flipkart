const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const generateInvoice = require('../utils/generateInvoice');
const path = require('path');
const fs = require('fs');

// @route   GET /api/orders/:orderId/invoice
// @desc    Generate and download invoice
// @access  Private
router.get('/:orderId/invoice', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price description brand seller warrenty');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Invoice is only available for delivered orders' });
    }

    // Check if user owns this order or is the seller
    if (order.user._id.toString() !== req.user.id && order.orderItems[0].seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Generate invoice
    const invoicePath = await generateInvoice(order);

    // Send file
    res.download(invoicePath, `invoice-${order.orderNumber}.pdf`, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ message: 'Error downloading invoice' });
      }
      
      // Clean up - delete the file after sending
      fs.unlink(invoicePath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting invoice file:', unlinkErr);
      });
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Failed to generate invoice' });
  }
});
