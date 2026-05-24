import express from 'express';
import {
  submitManualPayment,
  confirmPayment,
  rejectPayment,
  checkRevealAccess,
  getSellerInfo,
  getAllPayments,
  getMyPaymentStatus,
  uploadReceipt,
} from '../controllers/payment.controller.js';
import { protect }  from '../middlewares/auth.middleware.js';
import { isAdmin }  from '../middlewares/isAdmin.middlewear.js';

const router = express.Router();

// Buyer/Seller submits payment proof
router.post('/submit', protect, uploadReceipt.single('receipt'), submitManualPayment);

// Check access
router.get('/access/:productId',      protect, checkRevealAccess);
router.get('/seller-info/:productId', protect, getSellerInfo);
router.get('/my-status/:productId',   protect, getMyPaymentStatus);

// Admin
router.get('/',                          protect, isAdmin, getAllPayments);
router.patch('/confirm/:paymentId',      protect, isAdmin, confirmPayment);
router.patch('/reject/:paymentId',       protect, isAdmin, rejectPayment);

export default router;