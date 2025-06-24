import express from "express";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.routes.js"
import { userRoutes } from "./routes/user.routes.js"
import authRoutes from './routes/auth.router.js';
import cors from "cors"
import fs from 'fs';
import path from 'path'

dotenv.config();

const app = express();

// إنشاء مجلد uploads إذا ماكانش
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("Dossier 'uploads' créé.");
}

const PORT = process.env.PORT || 5000

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use('/api/auth', authRoutes);

// جعل مجلد uploads متاح للاستعمال عبر URL
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
    connectDB()
  console.log(`Server is running on port ${PORT}`);
});
