import express from "express";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import authRoutes from './routes/auth.router.js';
import orderRoutes from './routes/order.routes.js';
import paypalRoutes from './routes/paypal.routes.js';
import cors from "cors";
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("Dossier 'uploads' créé.");
}

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'https://jotya.xyz',
  'https://www.jotiya.xyz',
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
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/paypal', paypalRoutes);

app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});