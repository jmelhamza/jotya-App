import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

// ─── BUYER: create an order ───────────────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { productId, quantity = 1, message = '' } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "ID du produit obligatoire." });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Produit introuvable." });

    if (product.approvalStatus !== 'approved') {
      return res.status(400).json({ message: "Ce produit n'est pas disponible." });
    }
    if (product.status === 'Vendu') {
      return res.status(400).json({ message: "Ce produit est déjà vendu." });
    }

    // Prevent buyer from ordering their own product
    if (product.seller.toString() === buyerId) {
      return res.status(400).json({ message: "Vous ne pouvez pas acheter votre propre produit." });
    }

    // Prevent duplicate pending order for same product
    const existing = await Order.findOne({ buyer: buyerId, product: productId, status: 'pending' });
    if (existing) {
      return res.status(400).json({ message: "Vous avez déjà une demande en attente pour ce produit." });
    }

    const totalPrice = product.price * quantity;

    const newOrder = new Order({
      buyer: buyerId,
      product: productId,
      seller: product.seller,
      quantity,
      totalPrice,
      message,
    });

    await newOrder.save();
    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error("Erreur createOrder:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ─── BUYER: get my orders ─────────────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .sort({ createdAt: -1 })
      .populate('product', 'title price image category')
      .populate('seller', 'name phone whatsapp facebook shopName');

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Erreur getMyOrders:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ─── SELLER: get orders for my products ──────────────────────────────────────
export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user.id })
      .sort({ createdAt: -1 })
      .populate('product', 'title price image category')
      .populate('buyer', 'name email phone');

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Erreur getSellerOrders:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ─── SELLER: accept or reject an order for their own product ─────────────────
export const sellerReviewOrder = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const sellerId = req.user.id;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: "Statut invalide. Utilisez 'accepted' ou 'rejected'." });
  }

  try {
    const order = await Order.findById(id)
      .populate('buyer', 'name email')
      .populate('product', 'title price');

    if (!order) return res.status(404).json({ message: "Commande introuvable." });

    // Make sure this seller owns the product
    if (order.seller.toString() !== sellerId) {
      return res.status(403).json({ message: "Accès refusé. Ce n'est pas votre commande." });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: "Cette commande a déjà été traitée." });
    }

    order.status = status;
    await order.save();

    // If accepted, mark product as sold
    if (status === 'accepted') {
      await Product.findByIdAndUpdate(order.product._id, { status: 'Vendu' });
      // Reject all other pending orders for the same product
      await Order.updateMany(
        { product: order.product._id, status: 'pending', _id: { $ne: order._id } },
        { status: 'rejected' }
      );
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Erreur sellerReviewOrder:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ─── ADMIN: get all orders ────────────────────────────────────────────────────
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('buyer', 'name email phone')
      .populate('product', 'title price image category')
      .populate('seller', 'name email phone shopName');

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Erreur getAllOrders:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ─── ADMIN: accept or reject any order ───────────────────────────────────────
export const reviewOrder = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: "Statut invalide. Utilisez 'accepted' ou 'rejected'." });
  }

  try {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
      .populate('buyer', 'name email')
      .populate('product', 'title price');

    if (!order) return res.status(404).json({ message: "Commande introuvable." });

    if (status === 'accepted') {
      await Product.findByIdAndUpdate(order.product._id, { status: 'Vendu' });
      await Order.updateMany(
        { product: order.product._id, status: 'pending', _id: { $ne: order._id } },
        { status: 'rejected' }
      );
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Erreur reviewOrder:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};