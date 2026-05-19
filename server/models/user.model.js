import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  image: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['user', 'seller', 'admin'],
    default: 'user'
  },

  // Seller info
  shopName: {
    type: String,
    default: null,
  },
  whatsapp: {
    type: String,
    default: null,
  },
  facebook: {
    type: String,
    default: null,
  },
  cinImage: {
    type: String,
    default: null,
  },
  sellerStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none',
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;