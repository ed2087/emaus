// model/Testimonial.js
import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  authorName: {
    type: String,
    maxlength: 100
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
    description: {
    type: String,
    required: true,
    maxlength: 500
  },
  body: {
    type: String,
    required: true,
    minlength: 50
  },
  image: {
    type: String,
    default: ''
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Testimonial', testimonialSchema);