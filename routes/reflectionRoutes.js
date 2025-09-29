// routes/reflectionRoutes.js
import express from 'express';
import reflectionController from '../controllers/reflectionController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// API routes MUST come first
router.get('/api/popular', reflectionController.getPopularReflections);
router.get('/api/category/:category', reflectionController.getReflectionsByCategory);
router.get('/api/tag/:tag', reflectionController.getReflectionsByTag);
router.get('/api/:id', reflectionController.getReflectionJson);

// Main routes
router.get('/', reflectionController.getReflections);
router.get('/submit', reflectionController.getSubmitForm);
router.post('/submit', reflectionController.submitReflection);

// Parameterized routes LAST
router.get('/:id', reflectionController.getReflection);

export default router;