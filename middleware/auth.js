// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to check if user is authenticated
const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).redirect('/auth/login?redirectTo=' + req.originalUrl);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      res.clearCookie('token');
      return res.status(401).redirect('/auth/login');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.clearCookie('token');
    return res.status(401).redirect('/auth/login');
  }
};

// Middleware to check user role
const hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).redirect('/auth/login');
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to access this page.',
        user: req.user,
        path: req.path
      });
    }

    next();
  };
};

// Middleware to make user available to all templates
const setUserLocals = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
        res.locals.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Invalid token, but we'll just continue without user
    next();
  }
};

export default {
  isAuthenticated,
  hasRole,
  setUserLocals
};