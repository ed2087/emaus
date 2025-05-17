// controllers/eventController.js
import Event from '../models/Event.js';

// Get all events
const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    // Get active events only
    const filter = { isActive: true };
    
    // Filter by event type if specified
    if (req.query.type && req.query.type !== 'all') {
      filter.eventType = req.query.type;
    }
    
    const events = await Event.find(filter)
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);
      
    const totalEvents = await Event.countDocuments(filter);
    const totalPages = Math.ceil(totalEvents / limit);
    
    // Get event types for filter dropdown
    const eventTypes = await Event.distinct('eventType');
    
    res.render('events', {
      title: 'Events',
      events,
      eventTypes,
      selectedType: req.query.type || 'all',
      pagination: {
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      user: req.user || null,
        path: req.path,
         req: req 
    });
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading events.',
      user: req.user || null,
        path: req.path,
         req: req 
    });
  }
};

// Get single event
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event || !event.isActive) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Event not found.',
        user: req.user || null,
        path: req.path,
         req: req // Pass the request object for sharing URLs
      });
    }
    
    res.render('content/event-single', {
      title: event.title,
      event,
      user: req.user || null,
        path: req.path,
      req: req // Pass the request object for sharing URLs
    });
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading the event.',
      user: req.user || null,
        path: req.path,
      req: req // Pass the request object for sharing URLs
    });
  }
};

// API endpoints for fetch() calls

// Get upcoming events for home page
const getUpcomingEvents = async (req, res) => {
  try {
    // Get active events only
    const filter = { 
      isActive: true,
      date: { $gte: new Date() }
    };
    
    // Get upcoming events
    const events = await Event.find(filter)
      .sort({ date: 1 })
      .limit(5);
      
    res.json(events);
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading events.'
    });
  }
};

// Get single event as JSON
const getEventJson = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error getting event JSON:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading the event.'
    });
  }
};

export default {
  getEvents,
  getEvent,
  getUpcomingEvents,
  getEventJson
};