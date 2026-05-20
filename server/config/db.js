import mongoose from 'mongoose';

export const connectDB = async () => {
  const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jotiya_db";

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected. Retrying in 5s...');
    setTimeout(() => connectDB(), 5000);
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err.message);
  });

  try {
    await mongoose.connect(dbURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    console.warn('🔄 Retrying in 5 seconds...');
    setTimeout(() => connectDB(), 5000);
  }
};