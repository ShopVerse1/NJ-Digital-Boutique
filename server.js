const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Try multiple paths for frontend files
const frontendPaths = [
  path.join(__dirname, '../frontend'),
  path.join(__dirname, 'public'),
  path.join(__dirname, '../public'),
  path.join(__dirname, 'dist')
];

// Serve static files from the first available path
let frontendServed = false;
frontendPaths.forEach(frontendPath => {
  if (require('fs').existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    console.log(`✅ Serving frontend from: ${frontendPath}`);
    frontendServed = true;
  }
});

if (!frontendServed) {
  console.log('⚠️  Frontend files not found - API only mode');
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nj_digital_boutique';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// API Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'NJ Digital Boutique API is running' });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  // Try to serve frontend, fallback to API message
  frontendPaths.forEach(frontendPath => {
    const indexFile = path.join(frontendPath, 'index.html');
    if (require('fs').existsSync(indexFile)) {
      return res.sendFile(indexFile);
    }
  });
  
  // If no frontend found, show API info
  res.json({ 
    message: 'NJ Digital Boutique API', 
    frontend: 'Frontend files not found - running in API mode',
    endpoints: ['/api/products', '/api/orders', '/api/auth']
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
});
