import express from 'express'
import {
  getDetailUser,
  postUsers,
  putUser,
  deleteUser
} from '../controllers/user.controller.js'

const router = express.Router()


router.get("/", getDetailUser)
router.post("/", postUsers)
router.put("/:id", putUser)
router.delete("/:id", deleteUser)

export const userRoutes = router


