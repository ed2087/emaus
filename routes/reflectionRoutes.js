// routes/reflectionRoutes.js
import express from 'express';
import reflectionController from '../controllers/reflectionController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Reflections list
router.get('/', reflectionController.getReflections);

// Submit a reflection form
router.get('/submit', reflectionController.getSubmitForm);
router.post('/submit', reflectionController.submitReflection);

// Single reflection
router.get('/:id', reflectionController.getReflection);

// API routes for fetch() calls
router.get('/api/popular', reflectionController.getPopularReflections);
router.get('/api/category/:category', reflectionController.getReflectionsByCategory);
router.get('/api/tag/:tag', reflectionController.getReflectionsByTag);
router.get('/api/:id', reflectionController.getReflectionJson);

export default router;