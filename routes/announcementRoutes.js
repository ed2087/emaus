// routes/announcementRoutes.js
import express from 'express';
import announcementController from '../controllers/announcementController.js';

const router = express.Router();

// Announcements list
router.get('/', announcementController.getAnnouncements);

// Single announcement
router.get('/:id', announcementController.getAnnouncement);

// API routes for fetch() calls
router.get('/api/latest', announcementController.getLatestAnnouncements);
router.get('/api/:id', announcementController.getAnnouncementJson);

export default router;