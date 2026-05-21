import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Who paid
  payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // What they paid for
  type: {
    type: String,
    enum: [
      'reveal_seller',   // buyer pays 20 DH to see seller contact info
      'publish_product', // seller pays 35 DH to publish a product
    ],
    required: true,
  },

  // Related documents
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },

  // Amount in MAD
  amount: { type: Number, required: true },

  // PayPal transaction info
  paypalOrderId: { type: String, required: true },
  paypalStatus:  { type: String, default: 'CREATED' }, // CREATED | COMPLETED | FAILED

  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;