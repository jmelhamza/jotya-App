import express from 'express';
import { createProduct, deleteProduct, updateProduct, getProducts, getProductsByUser } from "../controllers/product.controller.js";
import { protect } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';  // تأكد من المسار الصحيح للـ upload.middleware.js

const router = express.Router();

router.get("/", getProducts);

router.post("/", protect, createProduct);

router.post('/upload-image', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Aucune image téléchargée' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

router.delete("/:id", protect, deleteProduct);



router.get("/user/:userId", getProductsByUser);

router.put("/:id", protect, upload.single("image"), updateProduct);

export default router;
