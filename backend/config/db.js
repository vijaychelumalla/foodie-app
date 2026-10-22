const mongoose = require('mongoose');

let isConnected = false;
let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const uri = process.env.MONGO_URI || (process.env.VERCEL ? null : 'mongodb://127.0.0.1:27017/foodieapp');

  if (!uri) {
    console.log('No MONGO_URI provided in serverless environment. Running in resilient mode.');
    return null;
  }

  connectionPromise = (async () => {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      isConnected = true;
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      isConnected = false;
      console.warn(`MongoDB Connection Note: ${error.message}. Running in resilient mode.`);
      if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
        process.exit(1);
      }
      return null;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
};

module.exports = connectDB;
