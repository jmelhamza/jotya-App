import express from "express";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.routes.js"
import { userRoutes } from "./routes/user.routes.js"
import authRoutes from './routes/auth.router.js';
import cors from "cors"
import fs from 'fs';
import path from 'path'
import paypalRoutes from './routes/paypal.routes.js'

dotenv.config();

const app = express();

// إنشاء مجلد uploads إذا ماكانش
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("Dossier 'uploads' créé.");
}

const PORT = process.env.PORT || 5000;

// ✅ إعداد CORS للسماح بالوصول من مختلف الروابط
const allowedOrigins = [
  'http://localhost:5173', // رابط التطوير المحلي
  'https://jotya.xyz', // رابط نطاقك الأساسي
  'https://www.jotiya.xyz', // رابط نطاقك مع www
  // قم بإضافة رابط مشروعك على Vercel هنا
  // ستجده في إعدادات Vercel > Domains
  'https://jotya-app-git-main-jmelhamzas-projects.vercel.app', 
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use('/api/paypal', paypalRoutes);
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use('/api/auth', authRoutes);

// جعل مجلد uploads متاح للاستعمال عبر URL
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});