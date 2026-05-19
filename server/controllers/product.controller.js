import Product from "../models/product.model.js";

// Get all approved products (for public visitors)
export const getProducts = async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = { approvalStatus: 'approved' };
    if (category && category !== 'Tous') filter.category = category;
    if (status) filter.status = status;

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .populate('seller', 'name email role phone whatsapp facebook shopName image');

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Erreur getProducts:', error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// Get ALL products (admin only — includes pending/rejected)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate('seller', 'name email role');

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Erreur getAllProducts:', error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// Create product
export const createProduct = async (req, res) => {
  const {
    title = '',
    price = '',
    description = '',
    category = '',
    status = 'Disponible',
  } = req.body;

  if (!title || !price || !category) {
    return res.status(400).json({ success: false, message: "Titre, prix et catégorie sont obligatoires." });
  }

  const images = req.files?.map(file => `/uploads/${file.filename}`) || [];

  const newProduct = new Product({
    title,
    price,
    description,
    category,
    status,
    image: images,
    seller: req.user.id,
    approvalStatus: 'pending',
  });

  try {
    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Erreur createProduct:", error.message);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, price, category, status, description } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Produit introuvable." });

    if (product.seller.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Non autorisé." });
    }

    if (title) product.title = title;
    if (price) product.price = price;
    if (category) product.category = category;
    if (status) product.status = status;
    if (description) product.description = description;
    if (req.files && req.files.length > 0) {
      product.image = req.files.map(file => `/uploads/${file.filename}`);
    }

    const updatedProduct = await product.save();
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Erreur updateProduct:", error.message);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Produit introuvable." });

    if (product.seller.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Non autorisé." });
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Produit supprimé." });
  } catch (error) {
    console.error("Erreur deleteProduct:", error.message);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// Get products by user
export const getProductsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const products = await Product.find({ seller: userId }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération." });
  }
};

// Admin: approve or reject a product
export const reviewProduct = async (req, res) => {
  const { id } = req.params;
  const { approvalStatus } = req.body;

  if (!['approved', 'rejected'].includes(approvalStatus)) {
    return res.status(400).json({ success: false, message: "Statut invalide. Utilisez 'approved' ou 'rejected'." });
  }

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { approvalStatus },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: "Produit introuvable." });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Erreur reviewProduct:", error.message);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};