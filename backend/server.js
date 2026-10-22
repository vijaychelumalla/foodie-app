const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/orders', orderRoutes);

// Base route
app.get(['/', '/api'], (req, res) => {
  res.send('Zomato Clone API is running...');
});

const PORT = process.env.PORT || 5001;

let server;
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL && require.main === module) {
  server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
