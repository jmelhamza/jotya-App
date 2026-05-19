import User from "../models/user.model.js";
import bcrypt from "bcrypt";

export const getDetailUser = async (req, res) => {
  try {
    const result = await User.find().select('-password');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs." });
  }
};

export const postUsers = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!password) return res.status(400).json({ message: "Mot de passe obligatoire." });
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashed, role, phone });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de l'utilisateur." });
  }
};

export const putUser = async (req, res) => {
  const { id } = req.params;
  const detail = req.body;
  try {
    if (detail.password) {
      detail.password = await bcrypt.hash(detail.password, 10);
    }
    const result = await User.findByIdAndUpdate(id, detail, { new: true }).select('-password');
    if (!result) return res.status(404).json({ message: "Utilisateur introuvable." });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la modification." });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await User.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ message: "Utilisateur introuvable." });
    res.status(200).json({ message: "Utilisateur supprimé." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression." });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// User requests to become a seller
export const requestSeller = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shopName, phone, whatsapp, facebook } = req.body;
    const cinImage = req.file ? `/uploads/${req.file.filename}` : null;

    if (!shopName || !phone) {
      return res.status(400).json({ message: "Nom de la boutique et téléphone sont obligatoires." });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        shopName,
        phone,
        whatsapp: whatsapp || null,
        facebook: facebook || null,
        cinImage,
        sellerStatus: 'pending',
      },
      { new: true }
    ).select('-password');

    res.status(200).json({ message: "Demande envoyée avec succès.", user });
  } catch (error) {
    console.error("Erreur requestSeller:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Admin: approve or reject seller request
export const reviewSellerRequest = async (req, res) => {
  const { id } = req.params;
  const { sellerStatus } = req.body;

  if (!['approved', 'rejected'].includes(sellerStatus)) {
    return res.status(400).json({ message: "Statut invalide. Utilisez 'approved' ou 'rejected'." });
  }

  try {
    const updateData = { sellerStatus };
    if (sellerStatus === 'approved') updateData.role = 'seller';
    if (sellerStatus === 'rejected') updateData.role = 'user';

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
    res.status(200).json({ message: `Demande ${sellerStatus === 'approved' ? 'approuvée' : 'refusée'}.`, user });
  } catch (error) {
    console.error("Erreur reviewSellerRequest:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};