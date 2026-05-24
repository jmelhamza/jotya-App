import Payment      from '../models/payment.model.js';
import Product      from '../models/product.model.js';
import User         from '../models/user.model.js';
import Conversation from '../models/conversation.model.js';
import Message      from '../models/message.model.js';
import multer       from 'multer';
import path         from 'path';
import fs           from 'fs';

// ─── Prices (MAD) ─────────────────────────────────────────────
const PRICES = {
  reveal_seller:   50,
  publish_product: 50,
};

// ─── Multer — receipt upload ───────────────────────────────────
const receiptDir = 'uploads/receipts';
if (!fs.existsSync(receiptDir)) fs.mkdirSync(receiptDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, receiptDir),
  filename:    (_, file, cb) => cb(null, `receipt_${Date.now()}${path.extname(file.originalname)}`),
});
export const uploadReceipt = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── SUBMIT manual payment request ────────────────────────────
export const submitManualPayment = async (req, res) => {
  const { type, productId } = req.body;
  const payerId = req.user.id;

  if (!['reveal_seller', 'publish_product'].includes(type)) {
    return res.status(400).json({ message: 'Type de paiement invalide.' });
  }

  const amount = PRICES[type];

  try {
    if (type === 'reveal_seller' && productId) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Produit introuvable.' });
      if (product.seller.toString() === payerId) {
        return res.status(400).json({ message: "C'est votre propre produit." });
      }
      // check already completed
      const existing = await Payment.findOne({
        payer: payerId, type: 'reveal_seller',
        product: productId, status: 'completed',
      });
      if (existing) {
        return res.status(400).json({ message: 'Accès déjà accordé.', alreadyPaid: true });
      }
      // check already pending
      const pending = await Payment.findOne({
        payer: payerId, type: 'reveal_seller',
        product: productId, status: 'pending',
      });
      if (pending) {
        return res.status(400).json({ message: 'Demande déjà en attente de validation.', pendingId: pending._id });
      }
    }

    const receiptImage = req.file ? `/uploads/receipts/${req.file.filename}` : null;

    const payment = new Payment({
      payer: payerId,
      type,
      product: productId || null,
      amount,
      receiptImage,
      manualNote: req.body.note || '',
      status: 'pending',
    });
    await payment.save();

    res.status(201).json({ success: true, paymentId: payment._id, message: 'Demande envoyée. En attente de validation.' });
  } catch (err) {
    console.error('submitManualPayment error:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ─── ADMIN: confirm payment ────────────────────────────────────
export const confirmPayment = async (req, res) => {
  const { paymentId } = req.params;
  const adminId = req.user.id;

  try {
    const payment = await Payment.findById(paymentId)
      .populate('payer', 'name')
      .populate('product', 'title seller');

    if (!payment) return res.status(404).json({ message: 'Paiement introuvable.' });

    payment.status      = 'completed';
    payment.confirmedBy = adminId;
    payment.confirmedAt = new Date();
    await payment.save();

    // publish product if seller paid
    if (payment.type === 'publish_product' && payment.product) {
      await Product.findByIdAndUpdate(payment.product._id, {
        approvalStatus: 'approved',
        publishOption:  'paid_flat',
      });
    }

    // ── Send notification via internal message system ──────────
    try {
      const admin = await User.findById(adminId);
      const payerId = payment.payer._id;

      // find or create conversation between admin and payer
      let conv = await Conversation.findOne({
        participants: { $all: [adminId, payerId] },
      });

      if (!conv) {
        conv = new Conversation({
          participants: [adminId, payerId],
          product: payment.product?._id || null,
          unreadCount: { [adminId]: 0, [payerId.toString()]: 0 },
        });
      }

      // notification message text
      let notifText = '';
      if (payment.type === 'reveal_seller') {
        notifText = `✅ Votre paiement de 50 DH a été confirmé ! Vous pouvez maintenant voir les coordonnées du vendeur pour le produit "${payment.product?.title || 'ce produit'}". Rendez-vous sur la page du produit pour contacter le vendeur.`;
      } else {
        notifText = `✅ Votre paiement de 50 DH a été confirmé ! Votre produit "${payment.product?.title || 'votre produit'}" est maintenant publié et visible sur Jotya.`;
      }

      conv.lastMessage   = notifText.slice(0, 80);
      conv.lastMessageAt = new Date();
      // increment unread for payer
      const currentUnread = conv.unreadCount?.get?.(payerId.toString()) || 0;
      conv.unreadCount = {
        ...(conv.unreadCount ? Object.fromEntries(conv.unreadCount) : {}),
        [payerId.toString()]: currentUnread + 1,
      };
      await conv.save();

      await Message.create({
        conversation: conv._id,
        sender: adminId,
        text: notifText,
        read: false,
      });
    } catch (notifErr) {
      // don't fail the whole confirmation if notif fails
      console.error('Notification error (non-blocking):', notifErr.message);
    }

    res.status(200).json({ success: true, payment });
  } catch (err) {
    console.error('confirmPayment error:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ─── ADMIN: reject payment ─────────────────────────────────────
export const rejectPayment = async (req, res) => {
  const { paymentId } = req.params;
  const { reason } = req.body;

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Paiement introuvable.' });

    payment.status          = 'rejected';
    payment.rejectionReason = reason || '';
    await payment.save();

    res.status(200).json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ─── CHECK access (buyer already paid for this product) ────────
export const checkRevealAccess = async (req, res) => {
  const { productId } = req.params;
  const payerId = req.user.id;
  try {
    const payment = await Payment.findOne({
      payer: payerId, type: 'reveal_seller',
      product: productId, status: 'completed',
    });
    res.status(200).json({ success: true, hasAccess: !!payment });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ─── GET seller info (only if paid) ───────────────────────────
export const getSellerInfo = async (req, res) => {
  const { productId } = req.params;
  const payerId = req.user.id;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Produit introuvable.' });

    if (product.seller.toString() === payerId || req.user.role === 'admin') {
      const seller = await User.findById(product.seller).select('name phone whatsapp facebook shopName email');
      return res.status(200).json({ success: true, seller });
    }

    const payment = await Payment.findOne({
      payer: payerId, type: 'reveal_seller',
      product: productId, status: 'completed',
    });

    if (!payment) {
      // check if pending
      const pending = await Payment.findOne({
        payer: payerId, type: 'reveal_seller',
        product: productId, status: 'pending',
      });
      if (pending) {
        return res.status(403).json({ message: 'Votre paiement est en cours de validation.', pendingPayment: true });
      }
      return res.status(403).json({ message: 'Payez 20 DH pour voir les coordonnées du vendeur.', requiresPayment: true });
    }

    const seller = await User.findById(product.seller).select('name phone whatsapp facebook shopName email');
    res.status(200).json({ success: true, seller });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ─── ADMIN: all payments ───────────────────────────────────────
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .populate('payer',   'name email phone')
      .populate('product', 'title price');
    res.status(200).json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ─── USER: my payment status for a product ────────────────────
export const getMyPaymentStatus = async (req, res) => {
  const { productId } = req.params;
  const payerId = req.user.id;
  try {
    const payment = await Payment.findOne({
      payer: payerId,
      product: productId,
      type: 'reveal_seller',
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};