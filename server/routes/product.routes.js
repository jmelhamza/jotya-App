import express from 'express';
import {
  createProduct,
  deleteProduct,
  updateProduct,
  getProducts,
  getAllProducts,
  getProductsByUser,
  reviewProduct,
} from "../controllers/product.controller.js";

import { protect } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/isAdmin.middlewear.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// Public: only approved products
router.get("/", getProducts);

// Admin: all products (pending, approved, rejected)
router.get("/all", protect, isAdmin, getAllProducts);

// Seller/Admin: create product
router.post("/", protect, upload.array('image', 5), createProduct);

// Upload single image
router.post('/upload-image', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Aucune image téléchargée.' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

// Get products by user
router.get("/user/:userId", getProductsByUser);

// Admin: approve or reject a product
router.patch("/:id/review", protect, isAdmin, reviewProduct);

// Update product
router.put("/:id", protect, upload.array("image", 5), updateProduct);

// Delete product
router.delete("/:id", protect, deleteProduct);

export default router;