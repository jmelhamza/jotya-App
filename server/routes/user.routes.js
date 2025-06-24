import express from 'express'
import {
  getDetailUser,
  postUsers,
  putUser,
  deleteUser
  
} from '../controllers/user.controller.js'
import { protect } from '../middlewares/auth.middleware.js'
import {isAdmin} from "../middlewares/isAdmin.middlewear.js"
import { getUserById } from '../controllers/user.controller.js'
import upload from '../middlewares/upload.middleware.js'
import User from '../models/user.model.js'



const router = express.Router()
router.put('/upload-profile', protect, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const user = await User.findByIdAndUpdate(userId, { image: imagePath }, { new: true });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l’image' });
  }
});


router.get("/",protect,isAdmin, getDetailUser)
router.post("/",protect,isAdmin, postUsers)
router.put("/:id",protect,isAdmin, putUser)
router.delete("/:id",protect,isAdmin, deleteUser)
router.get('/:id', getUserById)

export const userRoutes = router


