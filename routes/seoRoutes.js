// routes/seoRoutes.js
import express from 'express';
import seoController from '../controllers/seoController.js';

const router = express.Router();

// SEO-related routes
router.get('/sitemap.xml', seoController.getSitemap);
router.get('/robots.txt', seoController.getRobots);

export default router;