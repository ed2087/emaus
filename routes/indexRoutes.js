// routes/indexRoutes.js
import express from 'express';
import homeController from '../controllers/homeController.js';

const router = express.Router();

// Home page
router.get('/', homeController.getHomePage);

// Calendar page
router.get('/calendar', homeController.getCalendarPage);

// Message page
router.get('/message', homeController.getMessagePage);

export default router;