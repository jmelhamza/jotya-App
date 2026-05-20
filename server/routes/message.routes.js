import express from 'express';
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
} from '../controllers/message.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
// Start or get a conversation with a seller
router.post('/conversations', protect, getOrCreateConversation);

// Get all my conversations
router.get('/conversations', protect, getMyConversations);

// Get messages in a conversation
router.get('/conversations/:conversationId', protect, getMessages);

// Send a message
router.post('/conversations/:conversationId/messages', protect, sendMessage);

// Get total unread count (for navbar badge)
router.get('/unread', protect, getUnreadCount);

export default router;