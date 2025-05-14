// controllers/reflectionController.js
import Reflection from '../models/Reflection.js';

// Get all reflections
const getReflections = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    // Get published reflections only
    const filter = { isPublished: true };
    
    // Filter by category if specified
    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }
    
    // Filter by tag if specified
    if (req.query.tag) {
      filter.tags = req.query.tag;
    }
    
    const reflections = await Reflection.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const totalReflections = await Reflection.countDocuments(filter);
    const totalPages = Math.ceil(totalReflections / limit);
    
    // Get categories for filter dropdown
    const categories = await Reflection.distinct('category');
    
    // Get popular tags
    const allTags = await Reflection.aggregate([
      { $match: { isPublished: true } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.render('reflections', {
      title: 'Reflections',
      reflections,
      categories,
      tags: allTags,
      selectedCategory: req.query.category || 'all',
      selectedTag: req.query.tag || '',
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
    console.error('Error getting reflections:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading reflections.',
      user: req.user || null,
        path: req.path
    });
  }
};

// Get submit reflection form
const getSubmitForm = (req, res) => {
  res.render('forms/submit-reflection', {
    title: 'Submit Reflection',
    user: req.user || null,
        path: req.path
  });
};

// Process reflection submission
const submitReflection = async (req, res) => {
  try {
    const {
      title,
      description,
      body,
      category,
      tags,
      images,
      author
    } = req.body;
    
    // Create new reflection
    const newReflection = new Reflection({
      title,
      description,
      body,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      images: images ? images.split(',').map(url => url.trim()) : [],
      author: author || 'Anonymous',
      bodyFormat: 'markdown',
      isPublished: false, // Requires approval
      isPinned: false
    });
    
    await newReflection.save();
    
    res.redirect('/message?title=Reflection+Submitted&message=Thank+you+for+your+submission.+It+will+be+reviewed+by+a+moderator+before+publishing.');
  } catch (error) {
    console.error('Error submitting reflection:', error);
    res.status(500).render('forms/submit-reflection', {
      title: 'Submit Reflection',
      error: 'An error occurred while submitting your reflection.',
      formData: req.body,
      user: req.user || null,
        path: req.path
    });
  }
};

// Get single reflection
const getReflection = async (req, res) => {
  try {
    const reflection = await Reflection.findById(req.params.id);
    
    if (!reflection || !reflection.isPublished) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Reflection not found.',
        user: req.user || null,
        path: req.path
      });
    }
    
    // Get related reflections by category
    const relatedReflections = await Reflection.find({
      _id: { $ne: reflection._id },
      category: reflection.category,
      isPublished: true
    })
    .sort({ createdAt: -1 })
    .limit(3);
    
    res.render('content/reflection-single', {
      title: reflection.title,
      reflection,
      relatedReflections,
      user: req.user || null,
      path: req.path,
      req: req // Pass the request object for sharing URLs
    });
  } catch (error) {
    console.error('Error getting reflection:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading the reflection.',
      user: req.user || null,
        path: req.path
    });
  }
};

// API endpoints for fetch() calls

// Get popular reflections for home page
const getPopularReflections = async (req, res) => {
  try {
    // Get pinned and published reflections first, then most recent
    const reflections = await Reflection.find({ isPublished: true })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(5);
      
    res.json(reflections);
  } catch (error) {
    console.error('Error getting popular reflections:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading reflections.'
    });
  }
};

// Get reflections by category
const getReflectionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const reflections = await Reflection.find({
      category,
      isPublished: true
    })
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(10);
    
    res.json(reflections);
  } catch (error) {
    console.error('Error getting reflections by category:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading reflections.'
    });
  }
};

// Get reflections by tag
const getReflectionsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    
    const reflections = await Reflection.find({
      tags: tag,
      isPublished: true
    })
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(10);
    
    res.json(reflections);
  } catch (error) {
    console.error('Error getting reflections by tag:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading reflections.'
    });
  }
};

// Get single reflection as JSON
const getReflectionJson = async (req, res) => {
  try {
    const reflection = await Reflection.findById(req.params.id);
    
    if (!reflection || !reflection.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Reflection not found.'
      });
    }
    
    res.json(reflection);
  } catch (error) {
    console.error('Error getting reflection JSON:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading the reflection.'
    });
  }
};

export default {
  getReflections,
  getSubmitForm,
  submitReflection,
  getReflection,
  getPopularReflections,
  getReflectionsByCategory,
  getReflectionsByTag,
  getReflectionJson
};