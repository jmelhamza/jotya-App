import mongoose from "mongoose";

const productSchema =  new mongoose.Schema ({
  title: { type: String, required: true },
  description: { type: String },
  image: [{ type: String }],
  price: { type: Number, required: true },
//   seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
const Product = mongoose.model('Product',productSchema)
export default Product