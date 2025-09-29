// routes/chatRoutes.js
import express from 'express';
import chatController from '../controllers/chatController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All chat routes require authentication
router.use(auth.isAuthenticated);

// Main chat page
router.get('/', chatController.getChatPage);

// API routes
router.get('/api/chats', chatController.getChats);
router.get('/api/chats/:chatId/messages', chatController.getMessages);
router.post('/api/chats/:chatId/messages', chatController.sendMessage);
router.delete('/api/messages/:messageId', chatController.deleteMessage);
router.get('/api/messages/poll/:timestamp', chatController.pollMessages);

export default router;