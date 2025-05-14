// controllers/testimonialController.js
import Testimonial from '../models/Testimonial.js';
import User from '../models/User.js';

// Get all testimonials
const getTestimonials = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    // Get published testimonials only
    const filter = { isPublished: true };
    
    const testimonials = await Testimonial.find(filter)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const totalTestimonials = await Testimonial.countDocuments(filter);
    const totalPages = Math.ceil(totalTestimonials / limit);
    
    res.render('testimonials', {
      title: 'Testimonials',
      testimonials,
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
    console.error('Error getting testimonials:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading testimonials.',
      user: req.user || null,
        path: req.path
    });
  }
};

// Get submit testimonial form
const getSubmitForm = (req, res) => {
  res.render('forms/submit-testimonial', {
    title: 'Submit Testimonial',
    user: req.user || null,
        path: req.path
  });
};

// Process testimonial submission
const submitTestimonial = async (req, res) => {
  try {
    const {
      title,
      description,
      body,
      image
    } = req.body;
    
    // Create new testimonial
    const newTestimonial = new Testimonial({
      author: req.user._id,
      authorName: `${req.user.firstName} ${req.user.lastName}`,
      title,
      description,
      body,
      image: image || '',
      isPublished: false, // Requires approval
      isFeatured: false
    });
    
    await newTestimonial.save();
    
    res.redirect('/message?title=Testimonial+Submitted&message=Thank+you+for+your+submission.+It+will+be+reviewed+by+a+moderator+before+publishing.');
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    res.status(500).render('forms/submit-testimonial', {
      title: 'Submit Testimonial',
      error: 'An error occurred while submitting your testimonial.',
      formData: req.body,
      user: req.user || null,
      path: req.path
    });
  }
};

// Get single testimonial
const getTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id)
      .populate('author', 'firstName lastName');
    
    if (!testimonial || !testimonial.isPublished) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Testimonial not found.',
        user: req.user || null,
        path: req.path,
        req: req // Pass the request object for sharing URLs
      });
    }
    
    // Get more testimonials
    const moreTestimonials = await Testimonial.find({
      _id: { $ne: testimonial._id },
      isPublished: true
    })
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(3);
    
    res.render('content/testimonial-single', {
      title: testimonial.title,
      testimonial,
      moreTestimonials,
      user: req.user || null,
      path: req.path,
      req: req // Pass the request object for sharing URLs
    });
  } catch (error) {
    console.error('Error getting testimonial:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading the testimonial.',
      user: req.user || null,
      path: req.path,
      req: req // Pass the request object for sharing URLs
    });
  }
};

// API endpoints for fetch() calls

// Get featured testimonials for home page
const getFeaturedTestimonials = async (req, res) => {
  try {
    // Get featured and published testimonials first, then most recent
    const testimonials = await Testimonial.find({
      isPublished: true,
      isFeatured: true
    })
    .sort({ createdAt: -1 })
    .limit(4);
    
    // If not enough featured testimonials, get regular ones
    if (testimonials.length < 4) {
      const regularTestimonials = await Testimonial.find({
        isPublished: true,
        isFeatured: false
      })
      .sort({ createdAt: -1 })
      .limit(4 - testimonials.length);
      
      testimonials.push(...regularTestimonials);
    }
    
    res.json(testimonials);
  } catch (error) {
    console.error('Error getting featured testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading testimonials.'
    });
  }
};

// Get single testimonial as JSON
const getTestimonialJson = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id)
      .populate('author', 'firstName lastName');
    
    if (!testimonial || !testimonial.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found.'
      });
    }
    
    res.json(testimonial);
  } catch (error) {
    console.error('Error getting testimonial JSON:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading the testimonial.'
    });
  }
};

export default {
  getTestimonials,
  getSubmitForm,
  submitTestimonial,
  getTestimonial,
  getFeaturedTestimonials,
  getTestimonialJson
};