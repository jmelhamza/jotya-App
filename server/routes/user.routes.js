import express from 'express';
import {
  getDetailUser,
  postUsers,
  putUser,
  deleteUser,
  getUserById,
  requestSeller,
  reviewSellerRequest,
} from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/isAdmin.middlewear.js';
import upload from '../middlewares/upload.middleware.js';
import User from '../models/user.model.js';

const router = express.Router();

// Upload profile picture
router.put('/upload-profile', protect, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const user = await User.findByIdAndUpdate(userId, { image: imagePath }, { new: true }).select('-password');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'image." });
  }
});

// User requests to become a seller (with CIN upload)
router.post('/become-seller', protect, upload.single('cinImage'), requestSeller);

// Admin: approve or reject seller request
router.patch('/:id/review-seller', protect, isAdmin, reviewSellerRequest);

// Admin only routes
router.get("/", protect, isAdmin, getDetailUser);
router.post("/", protect, isAdmin, postUsers);
router.put("/:id", protect, isAdmin, putUser);
router.delete("/:id", protect, isAdmin, deleteUser);

// Public
router.get('/:id', getUserById);

export const userRoutes = router;