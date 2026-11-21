const mongoose = require('mongoose');

let isConnected = false;
let retryTimeout = null;

// Connection Event Handlers
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('🍃 MongoDB connected successfully');
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️  MongoDB disconnected! Attempting auto-reconnect in 5 seconds...');
  if (!retryTimeout) {
    retryTimeout = setTimeout(() => {
      retryTimeout = null;
      connectDB(1, 1).catch(() => {});
    }, 5000);
  }
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('❌ MongoDB event error:', err.message);
});

/**
 * Connect to MongoDB with connection pooling, IPv4 preference, and auto-retry
 */
async function connectDB(maxRetries = 5, retryDelaySeconds = 3) {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('⚠️  MONGODB_URI is not defined in .env');
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  const options = {
    serverSelectionTimeoutMS: 20000, // 20s allows Atlas enough time to wake up and resolve DNS
    socketTimeoutMS: 45000,          // Close inactive sockets after 45s
    maxPoolSize: 10,                 // Up to 10 connections
    minPoolSize: 0,                  // Don't keep unnecessary sockets open when idle
    family: 4,                       // Force IPv4 to prevent ISP/Windows DNS SRV delays
    retryWrites: true,
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`🔄 Retrying MongoDB connection (${attempt}/${maxRetries})...`);
      }

      const conn = await mongoose.connect(uri, options);
      isConnected = true;
      console.log(`✅  MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
      return true;
    } catch (err) {
      isConnected = false;
      console.error(`❌  MongoDB Connection Error (${attempt}/${maxRetries}):`, err.message);

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelaySeconds * 1000));
      }
    }
  }

  console.error('🚫 Could not connect to MongoDB after retries. Check Atlas IP whitelist (0.0.0.0/0) or DNS.');
  return false;
}

function getIsConnected() {
  return mongoose.connection.readyState === 1 || isConnected;
}

module.exports = { connectDB, getIsConnected };
