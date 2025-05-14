// routes/userRoutes.js
import express from 'express';
import userController from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// User profile (requires authentication)
router.get('/profile', auth.isAuthenticated, userController.getProfile);
router.put('/profile', auth.isAuthenticated, userController.updateProfile);

// API routes
router.get('/api/profile', auth.isAuthenticated, userController.getProfileJson);

export default router;