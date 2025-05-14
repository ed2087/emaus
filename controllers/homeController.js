// controllers/homeController.js
import Announcement from '../models/Announcement.js';
import Reflection from '../models/Reflection.js';
import Event from '../models/Event.js';
import Testimonial from '../models/Testimonial.js';

// Get home page
const getHomePage = async (req, res) => {
  try {
    // Data will be fetched client-side with fetch()
    console.log({
      user: req.user
    })
    res.render('home', {
      title: 'Emaús Community',
      user: req.user || null,
      path: req.path
    });
  } catch (error) {
    console.error('Error in getHomePage:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading the home page.',
      user: req.user || null,
      path: req.path
    });
  }
};

// Get calendar page
const getCalendarPage = async (req, res) => {
  try {
    res.render('calendar', {
      title: 'Event Calendar',
      user: req.user || null,
      path: req.path
    });
  } catch (error) {
    console.error('Error in getCalendarPage:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading the calendar.',
      user: req.user || null,
      path: req.path
    });
  }
};

// Get message page
const getMessagePage = (req, res) => {
  const { title, message, actionText, actionUrl } = req.query;
  
  if (!title || !message) {
    return res.status(400).redirect('/');
  }
  
  res.render('message', {
    title,
    message,
    actionText: actionText || null,
    actionUrl: actionUrl || null,
    user: req.user || null
  });
};

export default {
  getHomePage,
  getCalendarPage,
  getMessagePage
};