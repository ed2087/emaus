// models/Reflection.js - Updated
import mongoose from 'mongoose';

const reflectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  body: {
    type: String,
    required: true,
    minlength: 50
  },
    description: {
    type: String,
    required: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['Oración', 'Comunidad', 'Conversión', 'Biblia', 'Retiros', 'Sanación y Esperanza', 'Otro'],
    default: 'Otro'
  },
  tags: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 3']
  },
  author: {
    type: String,
    default: 'Admin'
  },
  bodyFormat: {
    type: String,
    enum: ['plain', 'markdown', 'html'],
    default: 'markdown'
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

function arrayLimit(val) {
  return val.length <= 3;
}

export default mongoose.model('Reflection', reflectionSchema);