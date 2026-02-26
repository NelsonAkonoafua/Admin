const mongoose = require('mongoose');

// Cache the connection across serverless invocations so we don't open a new
// connection on every request when the function container is reused.
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Keep the socket alive between serverless invocations
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    cachedConnection = conn;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    // Throw instead of process.exit so the error surfaces in the HTTP response
    throw error;
  }
};

module.exports = connectDB;
