import Product from "../models/product.model.js";
import mongoose from "mongoose";

const isDbReady = () => mongoose.connection.readyState === 1;

export const getProducts = async (req, res) => {
  if (!isDbReady()) return res.status(503).json({ success: false, message: "Service temporairement indisponible. Réessayez dans quelques secondes." });
  try {
    const filter = {};
    if (req.query.category && req.query.category !== 'Tous') filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.minPrice) filter.price = { ...filter.price, $gte: Number(req.query.minPrice) };
    if (req.query.maxPrice) filter.price = { ...filter.price, $lte: Number(req.query.maxPrice) };

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .populate('seller', 'name email role phone whatsapp facebook shopName image');

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('error in fetching products', error.message);
    res.status(500).json({ success: false, message: 'server error' });
  }
};

export const getAllProducts = async (req, res) => {
  if (!isDbReady()) return res.status(503).json({ success: false, message: "Service temporairement indisponible." });
  try {
    const products = await Product.find().sort({ createdAt: -1 }).populate('seller', 'name email role');
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

export const createProduct = async (req, res) => {
  if (!isDbReady()) return res.status(503).json({ success: false, message: "Service temporairement indisponible." });
  const { title = '', price = '', description = '', category = '', status = 'Disponible', publishOption = 'commission' } = req.body;
  if (!title || !price || !category) return res.status(400).json({ success: false, message: "Tous les champs obligatoires" });

  const images = req.files?.map(file => `/uploads/${file.filename}`) || [];
  const newProduct = new Product({
    title, price, description, category, status,
    image: images,
    seller: req.user.id,
    approvalStatus: 'pending',
    publishOption: publishOption || 'commission',
  });

  try {
    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Erreur lors de la création :", error.message);
    res.status(500).json({ success: false, message: "Erreur du serveur" });
  }
};

export const updateProduct = async (req, res) => {
  if (!isDbReady()) return res.status(503).json({ success: false, message: "Service temporairement indisponible." });
  const { id } = req.params;
  const { title, price, category, status, description } = req.body;
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Produit introuvable" });
    if (product.seller.toString() !== req.user.id && req.user.role !== "admin") return res.status(403).json({ success: false, message: "Non autorisé" });

    if (title) product.title = title;
    if (price) product.price = price;
    if (category) product.category = category;
    if (status) product.status = status;
    if (description) product.description = description;
    if (req.files?.length > 0) product.image = req.files.map(file => `/uploads/${file.filename}`);

    const updated = await product.save();
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

export const deleteProduct = async (req, res) => {
  if (!isDbReady()) return res.status(503).json({ success: false, message: "Service temporairement indisponible." });
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Produit introuvable" });
    if (product.seller.toString() !== req.user.id && req.user.role !== "admin") return res.status(403).json({ success: false, message: "Non autorisé" });
    await Product.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Produit supprimé" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

export const getProductsByUser = async (req, res) => {
  if (!isDbReady()) return res.status(503).json({ success: false, message: "Service temporairement indisponible." });
  try {
    const products = await Product.find({ seller: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};

export const reviewProduct = async (req, res) => {
  if (!isDbReady()) return res.status(503).json({ success: false, message: "Service temporairement indisponible." });
  const { id } = req.params;
  const { approvalStatus } = req.body;
  if (!['approved', 'rejected'].includes(approvalStatus)) return res.status(400).json({ success: false, message: "Statut invalide." });
  try {
    const product = await Product.findByIdAndUpdate(id, { approvalStatus }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Produit introuvable." });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};