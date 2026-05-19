import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

// Customer creates an order (purchase request)
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

// Admin: get all orders
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

// Customer: get my orders
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

// Admin: accept or reject an order
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

    // If accepted, mark product as Vendu
    if (status === 'accepted') {
      await Product.findByIdAndUpdate(order.product._id, { status: 'Vendu' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Erreur reviewOrder:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};