// controllers/seoController.js

import structuredDataHelper from '../utils/structuredDataHelper.js';

/**
 * Add sitemap.xml for SEO
 */
const getSitemap = async (req, res) => {
  try {
    // Import models
    const Reflection = (await import('../models/Reflection.js')).default;
    const Event = (await import('../models/Event.js')).default;
    const Testimonial = (await import('../models/Testimonial.js')).default;
    const Announcement = (await import('../models/Announcement.js')).default;
    
    // Get all published content
    const reflections = await Reflection.find({ isPublished: true }).sort({ updatedAt: -1 });
    const events = await Event.find({ isActive: true }).sort({ date: -1 });
    const testimonials = await Testimonial.find({ isPublished: true }).sort({ updatedAt: -1 });
    const announcements = await Announcement.find({ isActive: true }).sort({ updatedAt: -1 });
    
    // Set response content type
    res.header('Content-Type', 'application/xml');
    
    // Start XML content
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add home page
    xml += `  <url>
    <loc>${req.protocol}://${req.get('host')}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>\n`;
    
    // Add main pages
    ['reflections', 'events', 'testimonials', 'announcements'].forEach(page => {
      xml += `  <url>
    <loc>${req.protocol}://${req.get('host')}/${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    });
    
    // Add reflection pages
    reflections.forEach(reflection => {
      xml += `  <url>
    <loc>${req.protocol}://${req.get('host')}/reflections/${reflection._id}</loc>
    <lastmod>${new Date(reflection.updatedAt || reflection.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    });
    
    // Add event pages
    events.forEach(event => {
      xml += `  <url>
    <loc>${req.protocol}://${req.get('host')}/events/${event._id}</loc>
    <lastmod>${new Date(event.updatedAt || event.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    });
    
    // Add testimonial pages
    testimonials.forEach(testimonial => {
      xml += `  <url>
    <loc>${req.protocol}://${req.get('host')}/testimonials/${testimonial._id}</loc>
    <lastmod>${new Date(testimonial.updatedAt || testimonial.createdAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
    });
    
    // Add announcement pages
    announcements.forEach(announcement => {
      xml += `  <url>
    <loc>${req.protocol}://${req.get('host')}/announcements/${announcement._id}</loc>
    <lastmod>${new Date(announcement.updatedAt || announcement.createdAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
    });
    
    // End XML content
    xml += '</urlset>';
    
    // Send XML response
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
};

/**
 * Generate robots.txt file
 */
const getRobots = (req, res) => {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /auth/reset-password/
Disallow: /auth/logout
Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`;

  res.type('text/plain');
  res.send(robotsTxt);
};

export default {
  getSitemap,
  getRobots
};