import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // إيلاprocess.env.MONGO_URI عطات undefined لأي سبب، غياخد الرابط المحلي تلقائياً
    const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jotiya_db";
    
    console.log("جاري الاتصال بـ MongoDB...");
    const conn = await mongoose.connect(dbURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};