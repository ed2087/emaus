// routes/eventRoutes.js
import express from 'express';
import eventController from '../controllers/eventController.js';

const router = express.Router();

// Events list
router.get('/', eventController.getEvents);

// Single event
router.get('/:id', eventController.getEvent);

// API routes for fetch() calls
router.get('/api/upcoming', eventController.getUpcomingEvents);
router.get('/api/:id', eventController.getEventJson);

export default router;