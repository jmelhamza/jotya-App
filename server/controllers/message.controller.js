import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

// Start or get an existing conversation between current user and a seller, optionally about a product
export const getOrCreateConversation = async (req, res) => {
  try {
    const myId = req.user.id;
    const { sellerId, productId } = req.body;

    if (!sellerId) return res.status(400).json({ message: "sellerId obligatoire." });
    if (myId === sellerId) return res.status(400).json({ message: "Vous ne pouvez pas vous envoyer un message." });

    const seller = await User.findById(sellerId);
    if (!seller) return res.status(404).json({ message: "Vendeur introuvable." });

    // Look for existing conversation between these two participants (and optionally same product)
    let query = {
      participants: { $all: [myId, sellerId] },
    };
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
  try {
    const myId = req.user.id;

    const conversations = await Conversation.find({ participants: myId })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'name image shopName role')
      .populate('product', 'title image price');

    // Add unread count for current user
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
  try {
    const myId = req.user.id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name image shopName role')
      .populate('product', 'title image price');

    if (!conversation) return res.status(404).json({ message: "Conversation introuvable." });

    // Make sure current user is a participant
    const isParticipant = conversation.participants.some(
      p => p._id.toString() === myId.toString()
    );
    if (!isParticipant) return res.status(403).json({ message: "Accès refusé." });

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name image shopName role');

    // Mark messages as read for current user
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: myId }, read: false },
      { read: true }
    );

    // Reset unread count for current user
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

// Send a message in a conversation
export const sendMessage = async (req, res) => {
  try {
    const myId = req.user.id;
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) return res.status(400).json({ message: "Le message ne peut pas être vide." });

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation introuvable." });

    // Check participant
    const isParticipant = conversation.participants.some(
      p => p.toString() === myId.toString()
    );
    if (!isParticipant) return res.status(403).json({ message: "Accès refusé." });

    // Create the message
    const message = new Message({
      conversation: conversationId,
      sender: myId,
      text: text.trim(),
    });
    await message.save();
    await message.populate('sender', 'name image shopName role');

    // Update conversation last message and unread count for the OTHER participant
    const otherId = conversation.participants.find(p => p.toString() !== myId.toString());
    const unreadMap = conversation.unreadCount instanceof Map
      ? conversation.unreadCount
      : new Map(Object.entries(conversation.unreadCount || {}));

    const otherUnread = (unreadMap.get(otherId.toString()) || 0) + 1;
    unreadMap.set(otherId.toString(), otherUnread);

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

// Get total unread messages count for current user (for navbar badge)
export const getUnreadCount = async (req, res) => {
  try {
    const myId = req.user.id;
    const conversations = await Conversation.find({ participants: myId });

    let total = 0;
    for (const conv of conversations) {
      const count = conv.unreadCount?.get?.(myId.toString()) || 0;
      total += count;
    }

    res.status(200).json({ success: true, unread: total });
  } catch (error) {
    console.error("Erreur getUnreadCount:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};