import express from 'express';
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  reviewOrder,
} from '../controllers/order.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/isAdmin.middlewear.js';

const router = express.Router();

// Customer: create an order
router.post("/", protect, createOrder);

// Customer: get my orders
router.get("/my", protect, getMyOrders);

// Admin: get all orders
router.get("/", protect, isAdmin, getAllOrders);

// Admin: accept or reject an order
router.patch("/:id/review", protect, isAdmin, reviewOrder);

export default router;