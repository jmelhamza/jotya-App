// server/routes/product.routes.js
import express from 'express';
import {
  createProduct,
  deleteProduct,
  updateProduct,
  getProducts,
  getProductsByUser,
} from "../controllers/product.controller.js";

import { protect } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';
import { isAdmin } from '../middlewares/isAdmin.middlewear.js';

const router = express.Router();

router.get("/", getProducts); // 👈 ✅ هذا المسار متاح للجميع بدون `protect`

router.post("/", protect, isAdmin, upload.array('image', 5), createProduct); // 👈 إضافة `isAdmin`
router.post('/upload-image', protect, isAdmin, upload.single('image'), (req, res) => { // 👈 إضافة `isAdmin`
  if (!req.file) {
    return res.status(400).json({ message: 'Aucune image téléchargée' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

router.get("/user/:userId", getProductsByUser); // 👈 هذا المسار قد يحتاج إلى حماية معينة (سنتجاهله الآن)

router.put("/:id", protect, isAdmin, upload.array("image", 5), updateProduct); // 👈 إضافة `isAdmin`

router.delete("/:id", protect, isAdmin, deleteProduct); // 👈 إضافة `isAdmin`

export default router;