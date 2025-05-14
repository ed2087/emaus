// controllers/announcementController.js
import Announcement from '../models/Announcement.js';

// Get all announcements
const getAnnouncements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    // Get active announcements only
    const filter = { isActive: true };
    
    // Check for expired announcements
    const currentDate = new Date();
    filter.$or = [
      { expiresAt: { $gt: currentDate } },
      { expiresAt: null }
    ];
    
    const announcements = await Announcement.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const totalAnnouncements = await Announcement.countDocuments(filter);
    const totalPages = Math.ceil(totalAnnouncements / limit);
    
    res.render('announcements', {
      title: 'Announcements',
      announcements,
      pagination: {
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      user: req.user || null,
        path: req.path
    });
  } catch (error) {
    console.error('Error getting announcements:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading announcements.',
      user: req.user || null,
        path: req.path
    });
  }
};

// Get single announcement
const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement || !announcement.isActive) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Announcement not found.',
        user: req.user || null,
        path: req.path
      });
    }
    
    // Check if announcement has expired
    if (announcement.expiresAt && announcement.expiresAt < new Date()) {
      return res.status(404).render('error', {
        title: 'Expired',
        message: 'This announcement has expired.',
        user: req.user || null,
        path: req.path
        
      });
    }
    
    res.render('content/announcement-single', {
      title: announcement.title,
      announcement,
      user: req.user || null,
        path: req.path
    });
  } catch (error) {
    console.error('Error getting announcement:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading the announcement.',
      user: req.user || null,
        path: req.path
    });
  }
};

// API endpoints for fetch() calls

// Get latest announcements for home page
const getLatestAnnouncements = async (req, res) => {
  try {
    // Get active announcements only
    const filter = { isActive: true };
    
    // Check for expired announcements
    const currentDate = new Date();
    filter.$or = [
      { expiresAt: { $gt: currentDate } },
      { expiresAt: null }
    ];
    
    // Get pinned announcements first, then most recent
    const announcements = await Announcement.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(3);
      
    res.json(announcements);
  } catch (error) {
    console.error('Error getting latest announcements:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading announcements.'
    });
  }
};

// Get single announcement as JSON
const getAnnouncementJson = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement || !announcement.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.'
      });
    }
    
    // Check if announcement has expired
    if (announcement.expiresAt && announcement.expiresAt < new Date()) {
      return res.status(404).json({
        success: false,
        message: 'This announcement has expired.'
      });
    }
    
    res.json(announcement);
  } catch (error) {
    console.error('Error getting announcement JSON:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading the announcement.'
    });
  }
};

export default {
  getAnnouncements,
  getAnnouncement,
  getLatestAnnouncements,
  getAnnouncementJson
};