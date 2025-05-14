// routes/commentRoutes.js
import express from 'express';
import commentController from '../controllers/commentController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get comments for a content
router.get('/api/:contentType/:contentId', commentController.getComments);

// Add a comment (requires authentication)
router.post('/api', auth.isAuthenticated, commentController.addComment);

// Reply to a comment (requires authentication)
router.post('/api/reply', auth.isAuthenticated, commentController.replyToComment);

// Add a reaction (requires authentication)
router.post('/api/reaction', auth.isAuthenticated, commentController.addReaction);

export default router;