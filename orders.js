const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Create new order (Public - for guests)
router.post('/', [
  body('customer.name').notEmpty().withMessage('Customer name is required'),
  body('customer.email').isEmail().withMessage('Valid email is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { customer, items, shippingAddress } = req.body;

    // Calculate totals and validate items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product not found: ${item.product}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    const shippingAmount = 5.00;
    const finalAmount = totalAmount + shippingAmount;

    // Create order
    const order = new Order({
      customer,
      items: orderItems,
      totalAmount,
      shippingAmount,
      finalAmount,
      shippingAddress
    });

    await order.save();
    await order.populate('items.product', 'name image');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
});

// Create order for logged-in user (Protected)
router.post('/user', protect, [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { items, shippingAddress } = req.body;

    // Calculate totals
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product not found: ${item.product}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    const shippingAmount = 5.00;
    const finalAmount = totalAmount + shippingAmount;

    // Create order with user ID
    const order = new Order({
      customer: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        userId: req.user._id
      },
      items: orderItems,
      totalAmount,
      shippingAmount,
      finalAmount,
      shippingAddress
    });

    await order.save();
    await order.populate('items.product', 'name image');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create user order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
});

// Get orders for logged-in user (Protected)
router.get('/user/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.userId': req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name image price');

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your orders'
    });
  }
});

// Track order by order ID (Public)
router.get('/track/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId.toUpperCase() })
      .populate('items.product', 'name image');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found. Please check your order ID.'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track order'
    });
  }
});

// Get orders by customer email (Public)
router.get('/customer/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const orders = await Order.find({ 'customer.email': email.toLowerCase() })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name image');

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

module.exports = router;