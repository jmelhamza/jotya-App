import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

const isDbReady = () => mongoose.connection.readyState === 1;

// Start or get an existing conversation between current user and a seller
export const getOrCreateConversation = async (req, res) => {
  if (!isDbReady()) return res.status(503).json({ message: "Service temporairement indisponible." });
  try {
    const myId = req.user.id;
    const { sellerId, productId } = req.body;

    if (!sellerId) return res.status(400).json({ message: "sellerId obligatoire." });
    if (myId === sellerId) return res.status(400).json({ message: "Vous ne pouvez pas vous envoyer un message." });

    const seller = await User.findById(sellerId);
    if (!seller) return res.status(404).json({ message: "Vendeur introuvable." });

    let query = { participants: { $all: [myId, sellerId] } };
    if (productId) query.product = productId;

    let conversation = await Conversation.findOne(query)
      .populate('participants', 'name image shopName role')
      .populate('product', 'title image price');

    if (!conversation) {
      conversation = new Conversation({
        participants: [myId, sellerId],
        product: productId || null,
        unreadCount: { [myId]: 0, [sellerId]: 0 },
      });
      await conversation.save();
      await conversation.populate('participants', 'name image shopName role');
      if (productId) await conversation.populate('product', 'title image price');
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    console.error("Erreur getOrCreateConversation:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Get all conversations for the current user
export const getMyConversations = async (req, res) => {
  if (!isDbReady()) return res.status(503).json({ message: "Service temporairement indisponible." });
  try {
    const myId = req.user.id;
    const conversations = await Conversation.find({ participants: myId })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'name image shopName role')
      .populate('product', 'title image price');

    const result = conversations.map(conv => {
      const unread = conv.unreadCount?.get?.(myId.toString()) || 0;
      return { ...conv.toObject(), myUnread: unread };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Erreur getMyConversations:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Get all messages in a conversation
export const getMessages = async (req, res) => {
  if (!isDbReady()) return res.status(503).json({ message: "Service temporairement indisponible." });
  try {
    const myId = req.user.id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name image shopName role')
      .populate('product', 'title image price');

    if (!conversation) return res.status(404).json({ message: "Conversation introuvable." });

    const isParticipant = conversation.participants.some(p => p._id.toString() === myId.toString());
    if (!isParticipant) return res.status(403).json({ message: "Accès refusé." });

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name image shopName role');

    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: myId }, read: false },
      { read: true }
    );

    const unreadMap = conversation.unreadCount || new Map();
    unreadMap.set(myId.toString(), 0);
    conversation.unreadCount = unreadMap;
    await conversation.save();

    res.status(200).json({ success: true, data: { conversation, messages } });
  } catch (error) {
    console.error("Erreur getMessages:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  if (!isDbReady()) return res.status(503).json({ message: "Service temporairement indisponible." });
  try {
    const myId = req.user.id;
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) return res.status(400).json({ message: "Le message ne peut pas être vide." });

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation introuvable." });

    const isParticipant = conversation.participants.some(p => p.toString() === myId.toString());
    if (!isParticipant) return res.status(403).json({ message: "Accès refusé." });

    const message = new Message({ conversation: conversationId, sender: myId, text: text.trim() });
    await message.save();
    await message.populate('sender', 'name image shopName role');

    const otherId = conversation.participants.find(p => p.toString() !== myId.toString());
    const unreadMap = conversation.unreadCount instanceof Map
      ? conversation.unreadCount
      : new Map(Object.entries(conversation.unreadCount || {}));

    unreadMap.set(otherId.toString(), (unreadMap.get(otherId.toString()) || 0) + 1);
    conversation.lastMessage = text.trim().substring(0, 100);
    conversation.lastMessageAt = new Date();
    conversation.unreadCount = unreadMap;
    await conversation.save();

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error("Erreur sendMessage:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Get total unread count for navbar badge — safe version
export const getUnreadCount = async (req, res) => {
  if (!isDbReady()) {
    // Return 0 silently instead of crashing — navbar still works
    return res.status(200).json({ success: true, unread: 0 });
  }
  try {
    const myId = req.user.id;
    const conversations = await Conversation.find({ participants: myId });

    let total = 0;
    for (const conv of conversations) {
      total += conv.unreadCount?.get?.(myId.toString()) || 0;
    }

    res.status(200).json({ success: true, unread: total });
  } catch (error) {
    console.error("Erreur getUnreadCount:", error.message);
    // Return 0 instead of 500 — badge will just show nothing
    res.status(200).json({ success: true, unread: 0 });
  }
};