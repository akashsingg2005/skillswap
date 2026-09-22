const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Gig = require('./models/Gig');
const { sampleGigs } = require('./seed/seedData');

dotenv.config();

const app = express();

// Enable CORS for frontend deployment flexibility
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files if present
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// REST API Routes
app.use('/api/gigs', require('./routes/gigRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/match', require('./routes/matchRoutes'));

// Health Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'SkillSwap API',
    timestamp: new Date().toISOString(),
  });
});

// Central 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API Endpoint not found',
  });
});

// Fallback to static frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const isConnected = await connectDB();

  if (isConnected) {
    try {
      const gigCount = await Gig.countDocuments();
      if (gigCount === 0) {
        console.log('No gigs found in database. Auto-seeding initial marketplace gigs...');
        await Gig.insertMany(sampleGigs);
        console.log(`Auto-seeded ${sampleGigs.length} sample gigs for demo!`);
      }
    } catch (err) {
      console.error('Auto-seed check failed:', err.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 SkillSwap Backend Server Running on Port ${PORT}`);
    console.log(`   Local API URL: http://localhost:${PORT}/api`);
    console.log(`==================================================`);
  });
};

startServer();
