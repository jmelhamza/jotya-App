import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load .env from root folder — works wherever server is run from
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from "express";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import authRoutes from './routes/auth.router.js';
import orderRoutes from './routes/order.routes.js';
import cors from "cors";
import fs from 'fs';

const app = express();

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'https://jotya.xyz',
  'https://www.jotya.xyz',
  'https://jotya-app-git-main-jmelhamzas-projects.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.listen(PORT, () => {
  connectDB();
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`JWT_SECRET loaded: ${process.env.JWT_SECRET ? 'YES ✅' : 'NO ❌'}`);
  console.log(`MONGO_URI loaded: ${process.env.MONGO_URI ? 'YES ✅' : 'NO ❌'}`);
});