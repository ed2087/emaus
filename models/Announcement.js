import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 120
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  body: {
    type: String,
    required: true,
    maxlength: 3000
  },
  author: {
    type: String,
    default: 'Admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

export default mongoose.model('Announcement', announcementSchema);
