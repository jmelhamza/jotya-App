import express from 'express';
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getSellerOrders,
  reviewOrder,
  sellerReviewOrder,
} from '../controllers/order.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/isAdmin.middlewear.js';
import { isSeller } from '../middlewares/isSeller.middleware.js';

const router = express.Router();

// BUYER: create an order
router.post("/", protect, createOrder);

// BUYER: get my orders
router.get("/my", protect, getMyOrders);

// SELLER: get orders for my products
router.get("/seller", protect, isSeller, getSellerOrders);

// SELLER: accept or reject one of their orders
router.patch("/:id/seller-review", protect, isSeller, sellerReviewOrder);

// ADMIN: get all orders
router.get("/", protect, isAdmin, getAllOrders);

// ADMIN: accept or reject any order
router.patch("/:id/review", protect, isAdmin, reviewOrder);

export default router;