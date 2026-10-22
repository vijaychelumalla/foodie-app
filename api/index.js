const app = require('../backend/server');
const connectDB = require('../backend/config/db');

module.exports = async (req, res) => {
  // Ensure database initialization
  try {
    await connectDB();
  } catch (err) {
    console.error('Serverless DB connect error:', err);
  }
  return app(req, res);
};
