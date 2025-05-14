// middleware/adminCounters.js
import Reflection from '../models/Reflection.js';
import Testimonial from '../models/Testimonial.js';
import Announcement from '../models/Announcement.js';
import Event from '../models/Event.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

// Middleware to count items for admin dashboard
const adminCounters = async (req, res, next) => {
  try {
    // Count unpublished submissions awaiting approval
    const pendingReflections = await Reflection.countDocuments({ isPublished: false });
    const pendingTestimonials = await Testimonial.countDocuments({ isPublished: false });
    
    // Count unapproved comments
    const pendingComments = await Comment.countDocuments({ isApproved: false });
    
    // Count unverified users
    const pendingUsers = await User.countDocuments({ isVerified: false });
    
    // Add counts to res.locals for access in templates
    res.locals.counters = {
      pendingReflections,
      pendingTestimonials,
      pendingComments,
      pendingUsers,
      total: pendingReflections + pendingTestimonials + pendingComments + pendingUsers
    };
    
    next();
  } catch (error) {
    console.error('Error in adminCounters middleware:', error);
    next(error);
  }
};

export default adminCounters;