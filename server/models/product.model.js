import mongoose from "mongoose";

const productSchema =  new mongoose.Schema ({
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
    'Sport'
  ]
},
  status: {
    type: String,
    enum: ['Disponible', 'Vendu'], 
    default: 'Disponible'
  },
  createdAt: { type: Date, default: Date.now },
  
});
const Product = mongoose.model('Product',productSchema)
export default Product