// controllers/adminController.js
import Reflection from '../models/Reflection.js';
import Testimonial from '../models/Testimonial.js';
import Announcement from '../models/Announcement.js';
import Event from '../models/Event.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

// Get admin dashboard
const getDashboard = async (req, res) => {
  try {
    // Get total counts for display
    const reflectionsCount = await Reflection.countDocuments();
    const testimonialsCount = await Testimonial.countDocuments();
    const announcementsCount = await Announcement.countDocuments();
    const eventsCount = await Event.countDocuments();
    const commentsCount = await Comment.countDocuments();
    const usersCount = await User.countDocuments();
    
    // Get recent items
    const recentReflections = await Reflection.find()
      .sort({ createdAt: -1 })
      .limit(5);
      
    const recentTestimonials = await Testimonial.find()
      .sort({ createdAt: -1 })
      .limit(5);
      
    const recentAnnouncements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(5);
      
    const recentEvents = await Event.find()
      .sort({ date: 1 })
      .limit(5);
    
    // Render dashboard
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      counts: {
        reflections: reflectionsCount,
        testimonials: testimonialsCount,
        announcements: announcementsCount,
        events: eventsCount,
        comments: commentsCount,
        users: usersCount
      },
      recent: {
        reflections: recentReflections,
        testimonials: recentTestimonials,
        announcements: recentAnnouncements,
        events: recentEvents
      },
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-dashboard'] // Added missing pageCss array
    });
  } catch (error) {
    console.error('Error in admin dashboard:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading the dashboard.',
      user: req.user,
      path: req.path,
      query: req.query
    });
  }
};

// Reflections management
const getReflections = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const reflections = await Reflection.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const totalReflections = await Reflection.countDocuments();
    const totalPages = Math.ceil(totalReflections / limit);
    
    res.render('admin/reflections', {
      title: 'Manage Reflections',
      reflections,
      pagination: {
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-reflections'] // Added missing pageCss array
    });
  } catch (error) {
    console.error('Error in admin reflections:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading reflections.',
      user: req.user,
      path: req.path,
      query: req.query
    });
  }
};

const getNewReflection = (req, res) => {
  res.render('admin/reflection-form', {
    title: 'Add New Reflection',
    reflection: null,
    user: req.user,
    path: req.path,
    query: req.query,
    pageCss: ['cms', 'cms-reflections'] // Added missing pageCss array
  });
};

const getEditReflection = async (req, res) => {
  try {
    const reflection = await Reflection.findById(req.params.id);
    
    if (!reflection) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Reflection not found.',
        user: req.user,
        path: req.path,
        query: req.query
      });
    }
    
    res.render('admin/reflection-form', {
      title: 'Edit Reflection',
      reflection,
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-reflections'] // Added missing pageCss array
    });
  } catch (error) {
    console.error('Error in edit reflection:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading the reflection.',
      user: req.user,
      path: req.path,
      query: req.query
    });
  }
};

const postReflection = async (req, res) => {
  try {
    const {
      title,
      description,
      body,
      category,
      tags,
      images,
      author,
      bodyFormat,
      isPublished,
      isPinned
    } = req.body;
    
    // Create new reflection
    const newReflection = new Reflection({
      title,
      description,
      body,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      images: images ? images.split(',').map(url => url.trim()) : [],
      author: author || req.user.firstName + ' ' + req.user.lastName,
      bodyFormat: bodyFormat || 'markdown',
      isPublished: isPublished === 'on',
      isPinned: isPinned === 'on'
    });
    
    await newReflection.save();
    
    res.redirect('/admin/reflections');
  } catch (error) {
    console.error('Error creating reflection:', error);
    res.status(500).render('admin/reflection-form', {
      title: 'Add New Reflection',
      reflection: req.body,
      error: 'An error occurred while creating the reflection.',
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-reflections'] // Added missing pageCss array
    });
  }
};

const updateReflection = async (req, res) => {
  try {
    const {
      title,
      description,
      body,
      category,
      tags,
      images,
      author,
      bodyFormat,
      isPublished,
      isPinned
    } = req.body;
    
    // Find and update reflection
    const reflection = await Reflection.findById(req.params.id);
    
    if (!reflection) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Reflection not found.',
        user: req.user,
        path: req.path,
        query: req.query
      });
    }
    
    // Update fields
    reflection.title = title;
    reflection.description = description;
    reflection.body = body;
    reflection.category = category;
    reflection.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
    reflection.images = images ? images.split(',').map(url => url.trim()) : [];
    reflection.author = author || req.user.firstName + ' ' + req.user.lastName;
    reflection.bodyFormat = bodyFormat || 'markdown';
    reflection.isPublished = isPublished === 'on';
    reflection.isPinned = isPinned === 'on';
    
    await reflection.save();
    
    res.redirect('/admin/reflections');
  } catch (error) {
    console.error('Error updating reflection:', error);
    res.status(500).render('admin/reflection-form', {
      title: 'Edit Reflection',
      reflection: { ...req.body, _id: req.params.id },
      error: 'An error occurred while updating the reflection.',
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-reflections'] // Added missing pageCss array
    });
  }
};

const deleteReflection = async (req, res) => {
  try {
    await Reflection.findByIdAndDelete(req.params.id);
    
    // Also delete related comments
    await Comment.deleteMany({
      contentType: 'Reflection',
      contentId: req.params.id
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting reflection:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the reflection.'
    });
  }
};

// Testimonials management
const getTestimonials = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const totalTestimonials = await Testimonial.countDocuments();
    const totalPages = Math.ceil(totalTestimonials / limit);
    
    res.render('admin/testimonials', {
      title: 'Manage Testimonials',
      testimonials,
      pagination: {
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-testimonials'] // Added missing pageCss array
    });
  } catch (error) {
    console.error('Error in admin testimonials:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading testimonials.',
      user: req.user,
      path: req.path,
      query: req.query
    });
  }
};

const getNewTestimonial = (req, res) => {
  res.render('admin/testimonial-form', {
    title: 'Add New Testimonial',
    testimonial: null,
    user: req.user,
    path: req.path,
    query: req.query,
    pageCss: ['cms', 'cms-testimonials'] // Added missing pageCss array
  });
};

const getEditTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id)
      .populate('author', 'firstName lastName');
    
    if (!testimonial) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Testimonial not found.',
        user: req.user,
        path: req.path,
        query: req.query
      });
    }
    
    res.render('admin/testimonial-form', {
      title: 'Edit Testimonial',
      testimonial,
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-testimonials'] // Added missing pageCss array
    });
  } catch (error) {
    console.error('Error in edit testimonial:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading the testimonial.',
      user: req.user,
      path: req.path,
      query: req.query
    });
  }
};

const postTestimonial = async (req, res) => {
  try {
    const {
      authorName,
      title,
      description,
      body,
      image,
      isPublished,
      isFeatured
    } = req.body;
    
    // Create new testimonial
    const newTestimonial = new Testimonial({
      authorName,
      title,
      description,
      body,
      image: image || '',
      isPublished: isPublished === 'on',
      isFeatured: isFeatured === 'on'
    });
    
    await newTestimonial.save();
    
    res.redirect('/admin/testimonials');
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).render('admin/testimonial-form', {
      title: 'Add New Testimonial',
      testimonial: req.body,
      error: 'An error occurred while creating the testimonial.',
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-testimonials'] // Added missing pageCss array
    });
  }
};

const updateTestimonial = async (req, res) => {
  try {
    const {
      authorName,
      title,
      description,
      body,
      image,
      isPublished,
      isFeatured
    } = req.body;
    
    // Find and update testimonial
    const testimonial = await Testimonial.findById(req.params.id);
    
    if (!testimonial) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Testimonial not found.',
        user: req.user,
        path: req.path,
        query: req.query
      });
    }
    
    // Update fields
    testimonial.authorName = authorName;
    testimonial.title = title;
    testimonial.description = description;
    testimonial.body = body;
    testimonial.image = image || '';
    testimonial.isPublished = isPublished === 'on';
    testimonial.isFeatured = isFeatured === 'on';
    testimonial.updatedAt = Date.now();
    
    await testimonial.save();
    
    res.redirect('/admin/testimonials');
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).render('admin/testimonial-form', {
      title: 'Edit Testimonial',
      testimonial: { ...req.body, _id: req.params.id },
      error: 'An error occurred while updating the testimonial.',
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-testimonials'] // Added missing pageCss array
    });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    
    // Also delete related comments
    await Comment.deleteMany({
      contentType: 'Testimonial',
      contentId: req.params.id
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the testimonial.'
    });
  }
};

// Announcements management
const getAnnouncements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const totalAnnouncements = await Announcement.countDocuments();
    const totalPages = Math.ceil(totalAnnouncements / limit);
    
    res.render('admin/announcements', {
      title: 'Manage Announcements',
      announcements,
      pagination: {
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-announcements'] // Added missing pageCss array
    });
  } catch (error) {
    console.error('Error in admin announcements:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading announcements.',
      user: req.user,
      path: req.path,
      query: req.query
    });
  }
};

const getNewAnnouncement = (req, res) => {
  res.render('admin/announcement-form', {
    title: 'Add New Announcement',
    announcement: null,
    user: req.user,
    path: req.path,
    query: req.query,
    pageCss: ['cms', 'cms-announcements'] // Added missing pageCss array
  });
};

const getEditAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Announcement not found.',
        user: req.user,
        path: req.path,
        query: req.query
      });
    }
    
    res.render('admin/announcement-form', {
      title: 'Edit Announcement',
      announcement,
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-announcements'] // Added missing pageCss array
    });
  } catch (error) {
    console.error('Error in edit announcement:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading the announcement.',
      user: req.user,
      path: req.path,
      query: req.query
    });
  }
};

const postAnnouncement = async (req, res) => {
  try {
    const {
      title,
      description,
      body,
      author,
      expiresAt,
      isPinned,
      isActive
    } = req.body;
    
    // Create new announcement
    const newAnnouncement = new Announcement({
      title,
      description,
      body,
      author: author || req.user.firstName + ' ' + req.user.lastName,
      expiresAt: expiresAt || null,
      isPinned: isPinned === 'on',
      isActive: isActive === 'on'
    });
    
    await newAnnouncement.save();
    
    res.redirect('/admin/announcements');
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).render('admin/announcement-form', {
      title: 'Add New Announcement',
      announcement: req.body,
      error: 'An error occurred while creating the announcement.',
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-announcements'] // Added missing pageCss array
    });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const {
      title,
      description,
      body,
      author,
      expiresAt,
      isPinned,
      isActive
    } = req.body;
    
    // Find and update announcement
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Announcement not found.',
        user: req.user,
        path: req.path,
        query: req.query
      });
    }
    
    // Update fields
    announcement.title = title;
    announcement.description = description;
    announcement.body = body;
    announcement.author = author || req.user.firstName + ' ' + req.user.lastName;
    announcement.expiresAt = expiresAt || null;
    announcement.isPinned = isPinned === 'on';
    announcement.isActive = isActive === 'on';
    
    await announcement.save();
    
    res.redirect('/admin/announcements');
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).render('admin/announcement-form', {
      title: 'Edit Announcement',
      announcement: { ...req.body, _id: req.params.id },
      error: 'An error occurred while updating the announcement.',
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-announcements'] // Added missing pageCss array
    });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the announcement.'
    });
  }
};

// Events management
const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const events = await Event.find()
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);
      
    const totalEvents = await Event.countDocuments();
    const totalPages = Math.ceil(totalEvents / limit);
    
    res.render('admin/events', {
      title: 'Manage Events',
      events,
      pagination: {
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-events'] // Added missing pageCss array
    });
  } catch (error) {
    console.error('Error in admin events:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading events.',
      user: req.user,
      path: req.path,
      query: req.query
    });
  }
};

const getNewEvent = (req, res) => {
  res.render('admin/event-form', {
    title: 'Add New Event',
    event: null,
    user: req.user,
    path: req.path,
    query: req.query,
    pageCss: ['cms', 'cms-events'] // Added missing pageCss array
  });
};

const getEditEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Event not found.',
        user: req.user,
        path: req.path,
        query: req.query
      });
    }
    
    res.render('admin/event-form', {
      title: 'Edit Event',
      event,
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-events'] // Added missing pageCss array
    });
  } catch (error) {
    console.error('Error in edit event:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading the event.',
      user: req.user,
      path: req.path,
      query: req.query
    });
  }
};

const postEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      date,
      time,
      image,
      registrationUrl,
      registrationDeadline,
      capacity,
      eventType,
      isFeatured,
      isActive
    } = req.body;
    
    // Create new event
    const newEvent = new Event({
      title,
      description,
      location,
      date,
      time: time || '',
      image: image || '',
      registrationUrl: registrationUrl || '',
      registrationDeadline: registrationDeadline || null,
      capacity: capacity || null,
      eventType,
      isFeatured: isFeatured === 'on',
      isActive: isActive === 'on'
    });
    
    await newEvent.save();
    
    res.redirect('/admin/events');
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).render('admin/event-form', {
      title: 'Add New Event',
      event: req.body,
      error: 'An error occurred while creating the event.',
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-events'] // Added missing pageCss array
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      date,
      time,
      image,
      registrationUrl,
      registrationDeadline,
      capacity,
      eventType,
      isFeatured,
      isActive
    } = req.body;
    
    // Find and update event
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Event not found.',
        user: req.user,
        path: req.path,
        query: req.query
      });
    }
    
    // Update fields
    event.title = title;
    event.description = description;
    event.location = location;
    event.date = date;
    event.time = time || '';
    event.image = image || '';
    event.registrationUrl = registrationUrl || '';
    event.registrationDeadline = registrationDeadline || null;
    event.capacity = capacity || null;
    event.eventType = eventType;
    event.isFeatured = isFeatured === 'on';
    event.isActive = isActive === 'on';
    
    await event.save();
    
    res.redirect('/admin/events');
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).render('admin/event-form', {
      title: 'Edit Event',
      event: { ...req.body, _id: req.params.id },
      error: 'An error occurred while updating the event.',
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-events'] // Added missing pageCss array
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    
    // Also delete related comments
    await Comment.deleteMany({
      contentType: 'Event',
      contentId: req.params.id
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the event.'
    });
  }
};

// Users management
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);
    
    res.render('admin/users', {
      title: 'Manage Users',
      users,
      pagination: {
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      user: req.user,
      currentUser: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-users'] // Added missing pageCss array
    });
  } catch (error) {
    console.error('Error in admin users:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading users.',
      user: req.user,
      path: req.path,
      query: req.query
    });
  }
};

const getEditUser = async (req, res) => {
  try {
    const userData = await User.findById(req.params.id);
    
    if (!userData) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'User not found.',
        user: req.user,
        path: req.path,
        query: req.query
      });
    }
    
    res.render('admin/user-form', {
      title: 'Edit User',
      userData,
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-users'] // Added missing pageCss array
    });
  } catch (error) {
    console.error('Error in edit user:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading the user.',
      user: req.user,
      path: req.path,
      query: req.query
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      role,
      isVerified,
      isActive
    } = req.body;
    
    // Find and update user
    const userData = await User.findById(req.params.id);
    
    if (!userData) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'User not found.',
        user: req.user,
        path: req.path,
        query: req.query
      });
    }
    
    // Update fields
    userData.firstName = firstName;
    userData.lastName = lastName;
    userData.email = email;
    userData.role = role;
    userData.isVerified = isVerified === 'on';
    userData.isActive = isActive === 'on';
    
    await userData.save();
    
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).render('admin/user-form', {
      title: 'Edit User',
      userData: { ...req.body, _id: req.params.id },
      error: 'An error occurred while updating the user.',
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-users'] // Added missing pageCss array
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    
    // Also delete related comments
    await Comment.deleteMany({
      author: req.params.id
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the user.'
    });
  }
};

// Comments management
const getComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    // Filter by approval status if specified
    const filter = {};
    if (req.query.status === 'pending') {
      filter.isApproved = false;
    } else if (req.query.status === 'approved') {
      filter.isApproved = true;
    }
    
    const comments = await Comment.find(filter)
      .sort({ createdAt: -1 })
      .populate('author', 'firstName lastName email')
      .skip(skip)
      .limit(limit);
      
    const totalComments = await Comment.countDocuments(filter);
    const totalPages = Math.ceil(totalComments / limit);
    
    res.render('admin/comments', {
      title: 'Manage Comments',
      comments,
      filter: req.query.status || 'all',
      pagination: {
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-comments'] // Added missing pageCss array
    });
  } catch (error) {
    console.error('Error in admin comments:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading comments.',
      user: req.user,
      path: req.path,
      query: req.query
    });
  }
};

const approveComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.'
      });
    }
    
    comment.isApproved = true;
    await comment.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error approving comment:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while approving the comment.'
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    
    // Also delete replies to this comment
    await Comment.deleteMany({
      parentCommentId: req.params.id
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the comment.'
    });
  }
};

// Backup
const getBackupPage = (req, res) => {
  res.render('admin/backup', {
    title: 'Backup and Restore',
    user: req.user,
    path: req.path,
    query: req.query,
    pageCss: ['cms', 'cms-backup'] // Added missing pageCss array
  });
};

const createBackup = async (req, res) => {
  try {
    const backup = {
      date: new Date(),
      reflections: await Reflection.find(),
      testimonials: await Testimonial.find(),
      announcements: await Announcement.find(),
      events: await Event.find(),
      comments: await Comment.find(),
      users: await User.find()
    };
    
    // In a real app, this would save to a file or external storage
    // For this implementation, return JSON
    res.setHeader('Content-Disposition', 'attachment; filename=emaus-backup.json');
    res.setHeader('Content-Type', 'application/json');
    res.json(backup);
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).render('admin/backup', {
      title: 'Backup and Restore',
      error: 'An error occurred while creating the backup.',
      user: req.user,
      path: req.path,
      query: req.query,
      pageCss: ['cms', 'cms-backup'] // Added missing pageCss array
    });
  }
};

// Settings
const getSettings = (req, res) => {
  res.render('admin/settings', {
    title: 'CMS Settings',
    user: req.user,
    path: req.path,
    query: req.query,
    pageCss: ['cms', 'cms-settings'] // Added missing pageCss array
  });
};

const updateSettings = (req, res) => {
  // In a real app, this would update settings in database
  // For this implementation, just redirect
  res.redirect('/admin/settings');
};

export default {
  getDashboard,
  getReflections,
  getNewReflection,
  getEditReflection,
  postReflection,
  updateReflection,
  deleteReflection,
  getTestimonials,
  getNewTestimonial,
  getEditTestimonial,
  postTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getAnnouncements,
  getNewAnnouncement,
  getEditAnnouncement,
  postAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getEvents,
  getNewEvent,
  getEditEvent,
  postEvent,
  updateEvent,
  deleteEvent,
  getUsers,
  getEditUser,
  updateUser,
  deleteUser,
  getComments,
  approveComment,
  deleteComment,
  getBackupPage,
  createBackup,
  getSettings,
  updateSettings
};































// // controllers/adminController.js
// import Reflection from '../models/Reflection.js';
// import Testimonial from '../models/Testimonial.js';
// import Announcement from '../models/Announcement.js';
// import Event from '../models/Event.js';
// import Comment from '../models/Comment.js';
// import User from '../models/User.js';

// // Get admin dashboard
// const getDashboard = async (req, res) => {
//   try {
//     // Get total counts for display pageCss
//     const reflectionsCount = await Reflection.countDocuments();
//     const testimonialsCount = await Testimonial.countDocuments();
//     const announcementsCount = await Announcement.countDocuments();
//     const eventsCount = await Event.countDocuments();
//     const commentsCount = await Comment.countDocuments();
//     const usersCount = await User.countDocuments();
    
//     // Get recent items
//     const recentReflections = await Reflection.find()
//       .sort({ createdAt: -1 })
//       .limit(5);
      
//     const recentTestimonials = await Testimonial.find()
//       .sort({ createdAt: -1 })
//       .limit(5);
      
//     const recentAnnouncements = await Announcement.find()
//       .sort({ createdAt: -1 })
//       .limit(5);
      
//     const recentEvents = await Event.find()
//       .sort({ date: 1 })
//       .limit(5);
    
//     // Render dashboard
//     res.render('admin/dashboard', {
//       title: 'Admin Dashboard',
//       counts: {
//         reflections: reflectionsCount,
//         testimonials: testimonialsCount,
//         announcements: announcementsCount,
//         events: eventsCount,
//         comments: commentsCount,
//         users: usersCount
//       },
//       recent: {
//         reflections: recentReflections,
//         testimonials: recentTestimonials,
//         announcements: recentAnnouncements,
//         events: recentEvents
//       },
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   } catch (error) {
//     console.error('Error in admin dashboard:', error);
//     res.status(500).render('error', {
//       title: 'Server Error',
//       message: 'An error occurred while loading the dashboard.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// // Reflections management
// // Fix for getReflections function
// const getReflections = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = 20;
//     const skip = (page - 1) * limit;
    
//     const reflections = await Reflection.find()
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);
      
//     const totalReflections = await Reflection.countDocuments();
//     const totalPages = Math.ceil(totalReflections / limit);
    
//     res.render('admin/reflections', {
//       title: 'Manage Reflections',
//       reflections,
//       pagination: {
//         page,
//         totalPages,
//         hasNext: page < totalPages,
//         hasPrev: page > 1
//       },
//       user: req.user,
//       path: req.path,
//       query: req.query // Add this line
//     });
//   } catch (error) {
//     console.error('Error in admin reflections:', error);
//     res.status(500).render('error', {
//       title: 'Server Error',
//       message: 'An error occurred while loading reflections.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const getNewReflection = (req, res) => {
//   res.render('admin/reflection-form', {
//     title: 'Add New Reflection',
//     reflection: null,
//     user: req.user,
//       path: req.path,
//       query: req.query
//   });
// };

// const getEditReflection = async (req, res) => {
//   try {
//     const reflection = await Reflection.findById(req.params.id);
    
//     if (!reflection) {
//       return res.status(404).render('error', {
//         title: 'Not Found',
//         message: 'Reflection not found.',
//         user: req.user,
//       path: req.path,
//       query: req.query
//       });
//     }
    
//     res.render('admin/reflection-form', {
//       title: 'Edit Reflection',
//       reflection,
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   } catch (error) {
//     console.error('Error in edit reflection:', error);
//     res.status(500).render('error', {
//       title: 'Server Error',
//       message: 'An error occurred while loading the reflection.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const postReflection = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       body,
//       category,
//       tags,
//       images,
//       author,
//       bodyFormat,
//       isPublished,
//       isPinned
//     } = req.body;
    
//     // Create new reflection
//     const newReflection = new Reflection({
//       title,
//       description,
//       body,
//       category,
//       tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
//       images: images ? images.split(',').map(url => url.trim()) : [],
//       author: author || req.user.firstName + ' ' + req.user.lastName,
//       bodyFormat: bodyFormat || 'markdown',
//       isPublished: isPublished === 'on',
//       isPinned: isPinned === 'on'
//     });
    
//     await newReflection.save();
    
//     res.redirect('/admin/reflections');
//   } catch (error) {
//     console.error('Error creating reflection:', error);
//     res.status(500).render('admin/reflection-form', {
//       title: 'Add New Reflection',
//       reflection: req.body,
//       error: 'An error occurred while creating the reflection.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const updateReflection = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       body,
//       category,
//       tags,
//       images,
//       author,
//       bodyFormat,
//       isPublished,
//       isPinned
//     } = req.body;
    
//     // Find and update reflection
//     const reflection = await Reflection.findById(req.params.id);
    
// // controllers/adminController.js (continuing the updateReflection method)
//     if (!reflection) {
//       return res.status(404).render('error', {
//         title: 'Not Found',
//         message: 'Reflection not found.',
//         user: req.user,
//       path: req.path,
//       query: req.query
//       });
//     }
    
//     // Update fields
//     reflection.title = title;
//     reflection.description = description;
//     reflection.body = body;
//     reflection.category = category;
//     reflection.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
//     reflection.images = images ? images.split(',').map(url => url.trim()) : [];
//     reflection.author = author || req.user.firstName + ' ' + req.user.lastName;
//     reflection.bodyFormat = bodyFormat || 'markdown';
//     reflection.isPublished = isPublished === 'on';
//     reflection.isPinned = isPinned === 'on';
    
//     await reflection.save();
    
//     res.redirect('/admin/reflections');
//   } catch (error) {
//     console.error('Error updating reflection:', error);
//     res.status(500).render('admin/reflection-form', {
//       title: 'Edit Reflection',
//       reflection: { ...req.body, _id: req.params.id },
//       error: 'An error occurred while updating the reflection.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const deleteReflection = async (req, res) => {
//   try {
//     await Reflection.findByIdAndDelete(req.params.id);
    
//     // Also delete related comments
//     await Comment.deleteMany({
//       contentType: 'Reflection',
//       contentId: req.params.id
//     });
    
//     res.json({ success: true });
//   } catch (error) {
//     console.error('Error deleting reflection:', error);
//     res.status(500).json({
//       success: false,
//       message: 'An error occurred while deleting the reflection.'
//     });
//   }
// };

// // Testimonials management
// // Fix for getTestimonials function
// const getTestimonials = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = 20;
//     const skip = (page - 1) * limit;
    
//     const testimonials = await Testimonial.find()
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);
      
//     const totalTestimonials = await Testimonial.countDocuments();
//     const totalPages = Math.ceil(totalTestimonials / limit);
    
//     res.render('admin/testimonials', {
//       title: 'Manage Testimonials',
//       testimonials,
//       pagination: {
//         page,
//         totalPages,
//         hasNext: page < totalPages,
//         hasPrev: page > 1
//       },
//       user: req.user,
//       path: req.path,
//       query: req.query // Add this line
//     });
//   } catch (error) {
//     console.error('Error in admin testimonials:', error);
//     res.status(500).render('error', {
//       title: 'Server Error',
//       message: 'An error occurred while loading testimonials.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const getNewTestimonial = (req, res) => {
//   res.render('admin/testimonial-form', {
//     title: 'Add New Testimonial',
//     testimonial: null,
//     user: req.user,
//       path: req.path,
//       query: req.query
//   });
// };

// const getEditTestimonial = async (req, res) => {
//   try {
//     const testimonial = await Testimonial.findById(req.params.id)
//       .populate('author', 'firstName lastName');
    
//     if (!testimonial) {
//       return res.status(404).render('error', {
//         title: 'Not Found',
//         message: 'Testimonial not found.',
//         user: req.user,
//       path: req.path,
//       query: req.query
//       });
//     }
    
//     res.render('admin/testimonial-form', {
//       title: 'Edit Testimonial',
//       testimonial,
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   } catch (error) {
//     console.error('Error in edit testimonial:', error);
//     res.status(500).render('error', {
//       title: 'Server Error',
//       message: 'An error occurred while loading the testimonial.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const postTestimonial = async (req, res) => {
//   try {
//     const {
//       authorName,
//       title,
//       description,
//       body,
//       image,
//       isPublished,
//       isFeatured
//     } = req.body;
    
//     // Create new testimonial
//     const newTestimonial = new Testimonial({
//       authorName,
//       title,
//       description,
//       body,
//       image: image || '',
//       isPublished: isPublished === 'on',
//       isFeatured: isFeatured === 'on'
//     });
    
//     await newTestimonial.save();
    
//     res.redirect('/admin/testimonials');
//   } catch (error) {
//     console.error('Error creating testimonial:', error);
//     res.status(500).render('admin/testimonial-form', {
//       title: 'Add New Testimonial',
//       testimonial: req.body,
//       error: 'An error occurred while creating the testimonial.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const updateTestimonial = async (req, res) => {
//   try {
//     const {
//       authorName,
//       title,
//       description,
//       body,
//       image,
//       isPublished,
//       isFeatured
//     } = req.body;
    
//     // Find and update testimonial
//     const testimonial = await Testimonial.findById(req.params.id);
    
//     if (!testimonial) {
//       return res.status(404).render('error', {
//         title: 'Not Found',
//         message: 'Testimonial not found.',
//         user: req.user,
//       path: req.path,
//       query: req.query
//       });
//     }
    
//     // Update fields
//     testimonial.authorName = authorName;
//     testimonial.title = title;
//     testimonial.description = description;
//     testimonial.body = body;
//     testimonial.image = image || '';
//     testimonial.isPublished = isPublished === 'on';
//     testimonial.isFeatured = isFeatured === 'on';
//     testimonial.updatedAt = Date.now();
    
//     await testimonial.save();
    
//     res.redirect('/admin/testimonials');
//   } catch (error) {
//     console.error('Error updating testimonial:', error);
//     res.status(500).render('admin/testimonial-form', {
//       title: 'Edit Testimonial',
//       testimonial: { ...req.body, _id: req.params.id },
//       error: 'An error occurred while updating the testimonial.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const deleteTestimonial = async (req, res) => {
//   try {
//     await Testimonial.findByIdAndDelete(req.params.id);
    
//     // Also delete related comments
//     await Comment.deleteMany({
//       contentType: 'Testimonial',
//       contentId: req.params.id
//     });
    
//     res.json({ success: true });
//   } catch (error) {
//     console.error('Error deleting testimonial:', error);
//     res.status(500).json({
//       success: false,
//       message: 'An error occurred while deleting the testimonial.'
//     });
//   }
// };

// // Announcements management
// // Fix for getAnnouncements function
// const getAnnouncements = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = 20;
//     const skip = (page - 1) * limit;
    
//     const announcements = await Announcement.find()
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);
      
//     const totalAnnouncements = await Announcement.countDocuments();
//     const totalPages = Math.ceil(totalAnnouncements / limit);
    
//     res.render('admin/announcements', {
//       title: 'Manage Announcements',
//       announcements,
//       pagination: {
//         page,
//         totalPages,
//         hasNext: page < totalPages,
//         hasPrev: page > 1
//       },
//       user: req.user,
//       path: req.path,
//       query: req.query // Add this line
//     });
//   } catch (error) {
//     console.error('Error in admin announcements:', error);
//     res.status(500).render('error', {
//       title: 'Server Error',
//       message: 'An error occurred while loading announcements.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const getNewAnnouncement = (req, res) => {
//   res.render('admin/announcement-form', {
//     title: 'Add New Announcement',
//     announcement: null,
//     user: req.user,
//       path: req.path,
//       query: req.query
//   });
// };

// const getEditAnnouncement = async (req, res) => {
//   try {
//     const announcement = await Announcement.findById(req.params.id);
    
//     if (!announcement) {
//       return res.status(404).render('error', {
//         title: 'Not Found',
//         message: 'Announcement not found.',
//         user: req.user,
//       path: req.path,
//       query: req.query
//       });
//     }
    
//     res.render('admin/announcement-form', {
//       title: 'Edit Announcement',
//       announcement,
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   } catch (error) {
//     console.error('Error in edit announcement:', error);
//     res.status(500).render('error', {
//       title: 'Server Error',
//       message: 'An error occurred while loading the announcement.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const postAnnouncement = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       body,
//       author,
//       expiresAt,
//       isPinned,
//       isActive
//     } = req.body;
    
//     // Create new announcement
//     const newAnnouncement = new Announcement({
//       title,
//       description,
//       body,
//       author: author || req.user.firstName + ' ' + req.user.lastName,
//       expiresAt: expiresAt || null,
//       isPinned: isPinned === 'on',
//       isActive: isActive === 'on'
//     });
    
//     await newAnnouncement.save();
    
//     res.redirect('/admin/announcements');
//   } catch (error) {
//     console.error('Error creating announcement:', error);
//     res.status(500).render('admin/announcement-form', {
//       title: 'Add New Announcement',
//       announcement: req.body,
//       error: 'An error occurred while creating the announcement.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const updateAnnouncement = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       body,
//       author,
//       expiresAt,
//       isPinned,
//       isActive
//     } = req.body;
    
//     // Find and update announcement
//     const announcement = await Announcement.findById(req.params.id);
    
//     if (!announcement) {
//       return res.status(404).render('error', {
//         title: 'Not Found',
//         message: 'Announcement not found.',
//         user: req.user,
//       path: req.path,
//       query: req.query
//       });
//     }
    
//     // Update fields
//     announcement.title = title;
//     announcement.description = description;
//     announcement.body = body;
//     announcement.author = author || req.user.firstName + ' ' + req.user.lastName;
//     announcement.expiresAt = expiresAt || null;
//     announcement.isPinned = isPinned === 'on';
//     announcement.isActive = isActive === 'on';
    
//     await announcement.save();
    
//     res.redirect('/admin/announcements');
//   } catch (error) {
//     console.error('Error updating announcement:', error);
//     res.status(500).render('admin/announcement-form', {
//       title: 'Edit Announcement',
//       announcement: { ...req.body, _id: req.params.id },
//       error: 'An error occurred while updating the announcement.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const deleteAnnouncement = async (req, res) => {
//   try {
//     await Announcement.findByIdAndDelete(req.params.id);
//     res.json({ success: true });
//   } catch (error) {
//     console.error('Error deleting announcement:', error);
//     res.status(500).json({
//       success: false,
//       message: 'An error occurred while deleting the announcement.'
//     });
//   }
// };

// // Events management
// // Fix for getEvents function
// const getEvents = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = 20;
//     const skip = (page - 1) * limit;
    
//     const events = await Event.find()
//       .sort({ date: 1 })
//       .skip(skip)
//       .limit(limit);
      
//     const totalEvents = await Event.countDocuments();
//     const totalPages = Math.ceil(totalEvents / limit);
    
//     res.render('admin/events', {
//       title: 'Manage Events',
//       events,
//       pagination: {
//         page,
//         totalPages,
//         hasNext: page < totalPages,
//         hasPrev: page > 1
//       },
//       user: req.user,
//       path: req.path,
//       query: req.query // Add this line
//     });
//   } catch (error) {
//     console.error('Error in admin events:', error);
//     res.status(500).render('error', {
//       title: 'Server Error',
//       message: 'An error occurred while loading events.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const getNewEvent = (req, res) => {
//   res.render('admin/event-form', {
//     title: 'Add New Event',
//     event: null,
//     user: req.user,
//       path: req.path,
//       query: req.query
//   });
// };

// const getEditEvent = async (req, res) => {
//   try {
//     const event = await Event.findById(req.params.id);
    
//     if (!event) {
//       return res.status(404).render('error', {
//         title: 'Not Found',
//         message: 'Event not found.',
//         user: req.user,
//       path: req.path,
//       query: req.query
//       });
//     }
    
//     res.render('admin/event-form', {
//       title: 'Edit Event',
//       event,
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   } catch (error) {
//     console.error('Error in edit event:', error);
//     res.status(500).render('error', {
//       title: 'Server Error',
//       message: 'An error occurred while loading the event.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const postEvent = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       location,
//       date,
//       time,
//       image,
//       registrationUrl,
//       registrationDeadline,
//       capacity,
//       eventType,
//       isFeatured,
//       isActive
//     } = req.body;
    
//     // Create new event
//     const newEvent = new Event({
//       title,
//       description,
//       location,
//       date,
//       time: time || '',
//       image: image || '',
//       registrationUrl: registrationUrl || '',
//       registrationDeadline: registrationDeadline || null,
//       capacity: capacity || null,
//       eventType,
//       isFeatured: isFeatured === 'on',
//       isActive: isActive === 'on'
//     });
    
//     await newEvent.save();
    
//     res.redirect('/admin/events');
//   } catch (error) {
//     console.error('Error creating event:', error);
//     res.status(500).render('admin/event-form', {
//       title: 'Add New Event',
//       event: req.body,
//       error: 'An error occurred while creating the event.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const updateEvent = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       location,
//       date,
//       time,
//       image,
//       registrationUrl,
//       registrationDeadline,
//       capacity,
//       eventType,
//       isFeatured,
//       isActive
//     } = req.body;
    
//     // Find and update event
//     const event = await Event.findById(req.params.id);
    
//     if (!event) {
//       return res.status(404).render('error', {
//         title: 'Not Found',
//         message: 'Event not found.',
//         user: req.user,
//       path: req.path,
//       query: req.query
//       });
//     }
    
//     // Update fields
//     event.title = title;
//     event.description = description;
//     event.location = location;
//     event.date = date;
//     event.time = time || '';
//     event.image = image || '';
//     event.registrationUrl = registrationUrl || '';
//     event.registrationDeadline = registrationDeadline || null;
//     event.capacity = capacity || null;
//     event.eventType = eventType;
//     event.isFeatured = isFeatured === 'on';
//     event.isActive = isActive === 'on';
    
//     await event.save();
    
//     res.redirect('/admin/events');
//   } catch (error) {
//     console.error('Error updating event:', error);
//     res.status(500).render('admin/event-form', {
//       title: 'Edit Event',
//       event: { ...req.body, _id: req.params.id },
//       error: 'An error occurred while updating the event.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const deleteEvent = async (req, res) => {
//   try {
//     await Event.findByIdAndDelete(req.params.id);
    
//     // Also delete related comments
//     await Comment.deleteMany({
//       contentType: 'Event',
//       contentId: req.params.id
//     });
    
//     res.json({ success: true });
//   } catch (error) {
//     console.error('Error deleting event:', error);
//     res.status(500).json({
//       success: false,
//       message: 'An error occurred while deleting the event.'
//     });
//   }
// };

// // Users management
// // Fix for getUsers function
// const getUsers = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = 20;
//     const skip = (page - 1) * limit;
    
//     const users = await User.find()
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);
      
//     const totalUsers = await User.countDocuments();
//     const totalPages = Math.ceil(totalUsers / limit);
    
//     res.render('admin/users', {
//       title: 'Manage Users',
//       users,
//       pagination: {
//         page,
//         totalPages,
//         hasNext: page < totalPages,
//         hasPrev: page > 1
//       },
//       user: req.user,
//       currentUser: req.user, // Add this to avoid issues in the users.ejs template
//       path: req.path,
//       query: req.query // Add this line
//     });
//   } catch (error) {
//     console.error('Error in admin users:', error);
//     res.status(500).render('error', {
//       title: 'Server Error',
//       message: 'An error occurred while loading users.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const getEditUser = async (req, res) => {
//   try {
//     const userData = await User.findById(req.params.id);
    
//     if (!userData) {
//       return res.status(404).render('error', {
//         title: 'Not Found',
//         message: 'User not found.',
//         user: req.user,
//         path: req.path,
//       query: req.query
//       });
//     }
    
//     res.render('admin/user-form', {
//       title: 'Edit User',
//       userData,
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   } catch (error) {
//     console.error('Error in edit user:', error);
//     res.status(500).render('error', {
//       title: 'Server Error',
//       message: 'An error occurred while loading the user.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// // In adminController.js, make sure updateUser has proper error handling
// const updateUser = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       email,
//       role,
//       isVerified,
//       isActive
//     } = req.body;
    
//     // Find and update user
//     const userData = await User.findById(req.params.id);
    
//     if (!userData) {
//       return res.status(404).render('error', {
//         title: 'Not Found',
//         message: 'User not found.',
//         user: req.user,
//         path: req.path,
//       query: req.query
//       });
//     }
    
//     // Update fields
//     userData.firstName = firstName;
//     userData.lastName = lastName;
//     userData.email = email;
//     userData.role = role;
//     userData.isVerified = isVerified === 'on';
//     userData.isActive = isActive === 'on';
    
//     await userData.save();
    
//     res.redirect('/admin/users');
//   } catch (error) {
//     console.error('Error updating user:', error);
//     res.status(500).render('admin/user-form', {
//       title: 'Edit User',
//       userData: { ...req.body, _id: req.params.id },
//       error: 'An error occurred while updating the user.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const deleteUser = async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.params.id);
    
//     // Also delete related comments
//     await Comment.deleteMany({
//       author: req.params.id
//     });
    
//     res.json({ success: true });
//   } catch (error) {
//     console.error('Error deleting user:', error);
//     res.status(500).json({
//       success: false,
//       message: 'An error occurred while deleting the user.'
//     });
//   }
// };

// // Comments management
// const getComments = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = 20;
//     const skip = (page - 1) * limit;
    
//     // Filter by approval status if specified
//     const filter = {};
//     if (req.query.status === 'pending') {
//       filter.isApproved = false;
//     } else if (req.query.status === 'approved') {
//       filter.isApproved = true;
//     }
    
//     const comments = await Comment.find(filter)
//       .sort({ createdAt: -1 })
//       .populate('author', 'firstName lastName email')
//       .skip(skip)
//       .limit(limit);
      
//     const totalComments = await Comment.countDocuments(filter);
//     const totalPages = Math.ceil(totalComments / limit);
    
//     res.render('admin/comments', {
//       title: 'Manage Comments',
//       comments,
//       filter: req.query.status || 'all',
//       pagination: {
//         page,
//         totalPages,
//         hasNext: page < totalPages,
//         hasPrev: page > 1
//       },
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   } catch (error) {
//     console.error('Error in admin comments:', error);
//     res.status(500).render('error', {
//       title: 'Server Error',
//       message: 'An error occurred while loading comments.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// const approveComment = async (req, res) => {
//   try {
//     const comment = await Comment.findById(req.params.id);
    
//     if (!comment) {
//       return res.status(404).json({
//         success: false,
//         message: 'Comment not found.'
//       });
//     }
    
//     comment.isApproved = true;
//     await comment.save();
    
//     res.json({ success: true });
//   } catch (error) {
//     console.error('Error approving comment:', error);
//     res.status(500).json({
//       success: false,
//       message: 'An error occurred while approving the comment.'
//     });
//   }
// };

// const deleteComment = async (req, res) => {
//   try {
//     await Comment.findByIdAndDelete(req.params.id);
    
//     // Also delete replies to this comment
//     await Comment.deleteMany({
//       parentCommentId: req.params.id
//     });
    
//     res.json({ success: true });
//   } catch (error) {
//     console.error('Error deleting comment:', error);
//     res.status(500).json({
//       success: false,
//       message: 'An error occurred while deleting the comment.'
//     });
//   }
// };

// // Backup
// const getBackupPage = (req, res) => {
//   res.render('admin/backup', {
//     title: 'Backup and Restore',
//     user: req.user,
//       path: req.path,
//       query: req.query
//   });
// };

// const createBackup = async (req, res) => {
//   try {
//     const backup = {
//       date: new Date(),
//       reflections: await Reflection.find(),
//       testimonials: await Testimonial.find(),
//       announcements: await Announcement.find(),
//       events: await Event.find(),
//       comments: await Comment.find(),
//       users: await User.find()
//     };
    
//     // In a real app, this would save to a file or external storage
//     // For this implementation, return JSON
//     res.setHeader('Content-Disposition', 'attachment; filename=emaus-backup.json');
//     res.setHeader('Content-Type', 'application/json');
//     res.json(backup);
//   } catch (error) {
//     console.error('Error creating backup:', error);
//     res.status(500).render('admin/backup', {
//       title: 'Backup and Restore',
//       error: 'An error occurred while creating the backup.',
//       user: req.user,
//       path: req.path,
//       query: req.query
//     });
//   }
// };

// // Settings
// const getSettings = (req, res) => {
//   res.render('admin/settings', {
//     title: 'CMS Settings',
//     user: req.user,
//       path: req.path,
//       query: req.query
//   });
// };

// const updateSettings = (req, res) => {
//   // In a real app, this would update settings in database
//   // For this implementation, just redirect
//   res.redirect('/admin/settings');
// };

// export default {
//   getDashboard,
//   getReflections,
//   getNewReflection,
//   getEditReflection,
//   postReflection,
//   updateReflection,
//   deleteReflection,
//   getTestimonials,
//   getNewTestimonial,
//   getEditTestimonial,
//   postTestimonial,
//   updateTestimonial,
//   deleteTestimonial,
//   getAnnouncements,
//   getNewAnnouncement,
//   getEditAnnouncement,
//   postAnnouncement,
//   updateAnnouncement,
//   deleteAnnouncement,
//   getEvents,
//   getNewEvent,
//   getEditEvent,
//   postEvent,
//   updateEvent,
//   deleteEvent,
//   getUsers,
//   getEditUser,
//   updateUser,
//   deleteUser,
//   getComments,
//   approveComment,
//   deleteComment,
//   getBackupPage,
//   createBackup,
//   getSettings,
//   updateSettings
// };