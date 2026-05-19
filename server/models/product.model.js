import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: [{ type: String }],
  price: { type: Number, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    required: true,
    enum: [
      'Electronique',
      'Vetements',
      'Meubles',
      'Cuisine',
      'Jouets',
      'Livres',
      'Outils',
      'Accessoires',
      'Decoration',
      'Sport',
      'Sacs',
      'Chaussures',
      'Beaute',
      'Telephonie',
      'Informatique',
      'Vehicules',
      'Immobilier',
      'Animaux',
      'Services',
      'Autres'
    ]
  },
  status: {
    type: String,
    enum: ['Disponible', 'Vendu'],
    default: 'Disponible'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', productSchema);
export default Product;