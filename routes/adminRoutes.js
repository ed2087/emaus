// routes/adminRoutes.js
import express from 'express';
import adminController from '../controllers/adminController.js';
import auth from '../middleware/auth.js';
import adminCounters from '../middleware/adminCounters.js';

const router = express.Router();

// Middleware to check if user is admin or moderator
router.use(auth.isAuthenticated);
router.use(auth.hasRole(['admin', 'moderator']));
router.use(adminCounters);

// Dashboard
router.get('/', adminController.getDashboard);

// Reflections management
router.get('/reflections', adminController.getReflections);
router.get('/reflections/new', adminController.getNewReflection);
router.get('/reflections/edit/:id', adminController.getEditReflection);
router.post('/reflections', adminController.postReflection);
router.put('/reflections/:id', adminController.updateReflection);
router.delete('/reflections/:id', auth.hasRole(['admin']), adminController.deleteReflection);

// Testimonials management
router.get('/testimonials', adminController.getTestimonials);
router.get('/testimonials/new', adminController.getNewTestimonial);
router.get('/testimonials/edit/:id', adminController.getEditTestimonial);
router.post('/testimonials', adminController.postTestimonial);
router.put('/testimonials/:id', adminController.updateTestimonial);
router.delete('/testimonials/:id', auth.hasRole(['admin']), adminController.deleteTestimonial);

// Announcements management
router.get('/announcements', adminController.getAnnouncements);
router.get('/announcements/new', adminController.getNewAnnouncement);
router.get('/announcements/edit/:id', adminController.getEditAnnouncement);
router.post('/announcements', adminController.postAnnouncement);
router.put('/announcements/:id', adminController.updateAnnouncement);
router.delete('/announcements/:id', auth.hasRole(['admin']), adminController.deleteAnnouncement);

// Events management
router.get('/events', adminController.getEvents);
router.get('/events/new', adminController.getNewEvent);
router.get('/events/edit/:id', adminController.getEditEvent);
router.post('/events', adminController.postEvent);
router.put('/events/:id', adminController.updateEvent);
router.delete('/events/:id', auth.hasRole(['admin']), adminController.deleteEvent);

// Users management (admin only)
router.get('/users', auth.hasRole(['admin']), adminController.getUsers);
router.get('/users/edit/:id', auth.hasRole(['admin']), adminController.getEditUser);
router.put('/users/:id', auth.hasRole(['admin']), adminController.updateUser);
router.delete('/users/:id', auth.hasRole(['admin']), adminController.deleteUser);

// Comments management
router.get('/comments', adminController.getComments);
router.put('/comments/:id/approve', adminController.approveComment);
router.delete('/comments/:id', auth.hasRole(['admin']), adminController.deleteComment);

// Backup (admin only)
router.get('/backup', auth.hasRole(['admin']), adminController.getBackupPage);
router.post('/backup', auth.hasRole(['admin']), adminController.createBackup);

// Settings (admin only)
router.get('/settings', auth.hasRole(['admin']), adminController.getSettings);
router.post('/settings', auth.hasRole(['admin']), adminController.updateSettings);

export default router;