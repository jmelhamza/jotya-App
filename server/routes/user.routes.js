import express from 'express'
import {
  getDetailUser,
  postUsers,
  putUser,
  deleteUser
} from '../controllers/user.controller.js'
import { protect } from '../middlewares/auth.middleware.js'
import {isAdmin} from "../middlewares/isAdmin.middlewear.js"

const router = express.Router()


router.get("/",protect,isAdmin, getDetailUser)
router.post("/",protect,isAdmin, postUsers)
router.put("/:id",protect,isAdmin, putUser)
router.delete("/:id",protect,isAdmin, deleteUser)

export const userRoutes = router


