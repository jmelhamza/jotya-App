// server/routes/auth.router.js
import express from 'express'
import { login } from '../controllers/auth.controller.js' // 👈 تم حذف `register`

const router = express.Router()

router.post("/login", login) // 👈 تم حذف مسار التسجيل

export default router