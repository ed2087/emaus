// routes/testimonialRoutes.js
import express from 'express';
import testimonialController from '../controllers/testimonialController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Testimonials list
router.get('/', testimonialController.getTestimonials);

// Submit a testimonial form
router.get('/submit', testimonialController.getSubmitForm);
router.post('/submit', auth.isAuthenticated, testimonialController.submitTestimonial);

// Single testimonial
router.get('/:id', testimonialController.getTestimonial);

// API routes for fetch() calls
router.get('/api/featured', testimonialController.getFeaturedTestimonials);
router.get('/api/:id', testimonialController.getTestimonialJson);

export default router;