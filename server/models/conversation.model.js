import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  // The two participants: always buyer + seller
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  // Optional: linked to a product (buyer asks about specific product)
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  // Last message preview for the conversation list
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
  // Unread count per user: { userId: count }
  unreadCount: { type: Map, of: Number, default: {} },
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;