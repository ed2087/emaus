// routes/testimonialRoutes.js
import express from 'express';
import testimonialController from '../controllers/testimonialController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// API routes MUST come first
router.get('/api/featured', testimonialController.getFeaturedTestimonials);
router.get('/api/:id', testimonialController.getTestimonialJson);

// Main routes
router.get('/', testimonialController.getTestimonials);
router.get('/submit', testimonialController.getSubmitForm);
router.post('/submit', auth.isAuthenticated, testimonialController.submitTestimonial);

// Parameterized routes LAST
router.get('/:id', testimonialController.getTestimonial);

export default router;