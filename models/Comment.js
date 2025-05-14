// model/Comment.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  body: {
    type: String,
    required: true,
    maxlength: 1000
  },
  contentType: {
    type: String,
    required: true,
    enum: ['Reflection', 'Event', 'Testimonial'] // Removed Announcement
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  reactions: {
    heart: { type: Number, default: 0 },
    thumbsUp: { type: Number, default: 0 },
    thumbsDown: { type: Number, default: 0 }
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

commentSchema.index({ contentType: 1, contentId: 1 });

export default mongoose.model('Comment', commentSchema);
