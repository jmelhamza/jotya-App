import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  type: {
    type: String,
    enum: ['reveal_seller', 'publish_product'],
    required: true,
  },

  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },

  amount: { type: Number, required: true },

  // Manuel payment fields
  receiptImage: { type: String, default: null }, // uploaded receipt path
  manualNote:   { type: String, default: '' },   // optional note from user

  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'rejected'],
    default: 'pending',
  },

  // Admin confirmation
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  confirmedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: '' },

}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;