// routes/eventRoutes.js
import express from 'express';
import eventController from '../controllers/eventController.js';

const router = express.Router();

// API routes MUST come first
router.get('/api/upcoming', eventController.getUpcomingEvents);
router.get('/api/:id', eventController.getEventJson);

// Main routes
router.get('/', eventController.getEvents);

// Parameterized routes LAST
router.get('/:id', eventController.getEvent);

export default router;