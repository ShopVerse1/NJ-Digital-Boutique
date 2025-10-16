const express = require('express');
const crypto = require('crypto');
const Order = require('../models/Order');
const router = express.Router();

// Initialize Razorpay only if keys are provided
let razorpay;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = require('razorpay')({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('✅ Razorpay initialized successfully');
  } else {
    console.log('ℹ️  Razorpay keys not provided - payment features disabled');
  }
} catch (error) {
  console.log('⚠️  Razorpay initialization failed - payment features disabled');
}

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    // Check if Razorpay is available
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        error: 'Payment service is currently unavailable. Please try cash on delivery.'
      });
    }

    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      }
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order'
    });
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    // Check if Razorpay is available
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        error: 'Payment verification service unavailable'
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id
    } = req.body;

    // Verify payment signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }

    // Update order payment status
    const order = await Order.findById(order_id);
    if (order) {
      order.payment.status = 'completed';
      order.payment.transactionId = razorpay_payment_id;
      order.status = 'confirmed';
      await order.save();
    }

    res.json({
      success: true,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed'
    });
  }
});

// Demo payment for testing (works without Razorpay keys)
router.post('/demo-payment', async (req, res) => {
  try {
    const { amount, order_id } = req.body;

    // Simulate successful payment
    const order = await Order.findById(order_id);
    if (order) {
      order.payment.status = 'completed';
      order.payment.method = 'demo';
      order.payment.transactionId = 'DEMO_' + Date.now();
      order.status = 'confirmed';
      await order.save();
    }

    res.json({
      success: true,
      message: 'Demo payment completed successfully!',
      transactionId: 'DEMO_' + Date.now()
    });
  } catch (error) {
    console.error('Demo payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Demo payment failed'
    });
  }
});

// Check payment status
router.get('/status/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      payment: order.payment
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment status'
    });
  }
});

module.exports = router;