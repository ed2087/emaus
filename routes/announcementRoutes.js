// routes/announcementRoutes.js
import express from 'express';
import announcementController from '../controllers/announcementController.js';

const router = express.Router();

// API routes MUST come first
router.get('/api/latest', announcementController.getLatestAnnouncements);
router.get('/api/:id', announcementController.getAnnouncementJson);

// Main routes
router.get('/', announcementController.getAnnouncements);

// Parameterized routes LAST
router.get('/:id', announcementController.getAnnouncement);

export default router;