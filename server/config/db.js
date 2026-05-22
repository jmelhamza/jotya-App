import mongoose from 'mongoose';

let isConnected = false;
let retryTimeout = null;

const connectDB = async () => {
  const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jotiya_db";

  if (isConnected) return;

  try {
    await mongoose.connect(dbURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.error(`❌ Database Connection Error: ${error.message}`);
    console.warn('🔄 Retrying in 5 seconds...');
    if (!retryTimeout) {
      retryTimeout = setTimeout(() => {
        retryTimeout = null;
        connectDB();
      }, 5000);
    }
  }
};

// Listeners une seule fois
mongoose.connection.on('disconnected', () => {
  if (isConnected) {
    isConnected = false;
    console.warn('⚠️ MongoDB disconnected. Retrying in 5s...');
    if (!retryTimeout) {
      retryTimeout = setTimeout(() => {
        retryTimeout = null;
        connectDB();
      }, 5000);
    }
  }
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});

export { connectDB };