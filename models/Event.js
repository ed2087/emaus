// models/Event.js - Updated
import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 150
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  registrationUrl: {
    type: String,
    default: ''
  },
  registrationDeadline: {
    type: Date
  },
  capacity: {
    type: Number
  },
  eventType: {
    type: String,
    enum: ['Retiro', 'Encuentro', 'Taller', 'Misa', 'Otro'],
    default: 'Otro'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Event', eventSchema);