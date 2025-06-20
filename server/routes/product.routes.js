import express from 'express'
import { createProduct, deleteProduct, updateProduct ,getProducts } from "../controllers/product.controller.js"
import { protect } from '../middlewares/auth.middleware.js'
const router =express.Router()

router.get("/",getProducts)
router.post("/",protect,createProduct)
router.delete("/:id",protect,deleteProduct )
router.put("/:id",protect, updateProduct )

export default router