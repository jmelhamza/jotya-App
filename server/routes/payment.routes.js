import express from 'express';
import {
  createPaypalOrder,
  capturePaypalOrder,
  checkRevealAccess,
  getSellerInfo,
  getAllPayments,
} from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/isAdmin.middlewear.js';

const router = express.Router();

// Create a PayPal order (buyer or seller initiates payment)
router.post('/create',   protect, createPaypalOrder);

// Capture after PayPal approval
router.post('/capture',  protect, capturePaypalOrder);

// Check if buyer already paid to see seller info for a product
router.get('/access/:productId',      protect, checkRevealAccess);

// Get seller contact info (only if buyer paid)
router.get('/seller-info/:productId', protect, getSellerInfo);

// Admin: see all payments
router.get('/', protect, isAdmin, getAllPayments);

export default router;