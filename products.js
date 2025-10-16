const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, featured, page = 1, limit = 12 } = req.query;

    let filter = { isActive: true };
    
    if (category) filter.category = category;
    if (featured) filter.featured = featured === 'true';

    const products = await Product.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch products' 
    });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ 
      featured: true, 
      isActive: true 
    })
    .limit(8)
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch featured products' 
    });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const products = await Product.find({ 
      category, 
      isActive: true 
    })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ 
      category, 
      isActive: true 
    });

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch products by category' 
    });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch product' 
    });
  }
});

module.exports = router;