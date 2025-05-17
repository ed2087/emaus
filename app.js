// app.js - Updated with SEO routes
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import methodOverride from 'method-override';

// Import routes
import indexRoutes from './routes/indexRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import reflectionRoutes from './routes/reflectionRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import userRoutes from './routes/userRoutes.js';
import seoRoutes from './routes/seoRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Add cookie-parser middleware
app.use(express.static(path.join(path.resolve(), 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'views'));

app.use(methodOverride('_method'));

// Add auth middleware for user data
app.use(async (req, res, next) => {
  try {
    // Make path variable available to all templates
    res.locals.path = req.path;
    
    // Check for token and set user data if available
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
    // Just continue if token is invalid
    console.error('Auth middleware error:', error);
    next();
  }
});

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/announcements', announcementRoutes);
app.use('/comments', commentRoutes);
app.use('/events', eventRoutes);
app.use('/reflections', reflectionRoutes);
app.use('/testimonials', testimonialRoutes);
app.use('/users', userRoutes);

// SEO routes (sitemap.xml and robots.txt) - these must come before the 404 handler
app.use('/', seoRoutes);

// 404 Error handler
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    user: req.user || null,
    path: req.path
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(error);
  const statusCode = error.statusCode || 500;
  res.status(statusCode).render('error', {
    title: 'Error',
    message: error.message || 'An unexpected error occurred.',
    user: req.user || null,
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;