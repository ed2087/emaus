// controllers/commentController.js
import Comment from '../models/Comment.js';

// Get comments for a content
const getComments = async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    
// controllers/commentController.js (continuing)
    // Validate content type
    const validContentTypes = ['Reflection', 'Event', 'Testimonial'];
    if (!validContentTypes.includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type.'
      });
    }
    
    // Get top-level comments (no parent)
    const comments = await Comment.find({
      contentType,
      contentId,
      parentCommentId: null,
      isApproved: true
    })
    .sort({ createdAt: -1 })
    .populate('author', 'firstName lastName');
    
    // For each comment, get its replies
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parentCommentId: comment._id,
          isApproved: true
        })
        .sort({ createdAt: 1 })
        .populate('author', 'firstName lastName');
        
        return {
          ...comment.toObject(),
          replies
        };
      })
    );
    
    res.json(commentsWithReplies);
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading comments.'
    });
  }
};

// Add a comment (requires authentication)
const addComment = async (req, res) => {
  try {
    const { contentType, contentId, body } = req.body;
    
    // Validate content type
    const validContentTypes = ['Reflection', 'Event', 'Testimonial'];
    if (!validContentTypes.includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type.'
      });
    }
    
    // Create new comment
    const newComment = new Comment({
      author: req.user._id,
      body,
      contentType,
      contentId,
      parentCommentId: null,
      isApproved: false // All comments need approval
    });
    
    await newComment.save();
    
    res.json({
      success: true,
      message: 'Comment added successfully. It will be visible after approval.'
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while adding the comment.'
    });
  }
};

// Reply to a comment (requires authentication)
const replyToComment = async (req, res) => {
  try {
    const { parentCommentId, body } = req.body;
    
    // Find parent comment
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: 'Parent comment not found.'
      });
    }
    
    // Create new reply
    const newReply = new Comment({
      author: req.user._id,
      body,
      contentType: parentComment.contentType,
      contentId: parentComment.contentId,
      parentCommentId,
      isApproved: false // All replies need approval
    });
    
    await newReply.save();
    
    res.json({
      success: true,
      message: 'Reply added successfully. It will be visible after approval.'
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while adding the reply.'
    });
  }
};

// Add a reaction (requires authentication)
const addReaction = async (req, res) => {
  try {
    const { commentId, reactionType } = req.body;
    
    // Validate reaction type
    const validReactionTypes = ['heart', 'thumbsUp', 'thumbsDown'];
    if (!validReactionTypes.includes(reactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reaction type.'
      });
    }
    
    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.'
      });
    }
    
    // Increment reaction count
    comment.reactions[reactionType] += 1;
    await comment.save();
    
    res.json({
      success: true,
      reactions: comment.reactions
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while adding the reaction.'
    });
  }
};

export default {
  getComments,
  addComment,
  replyToComment,
  addReaction
};