// controllers/chatController.js
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

// Get main chat page
const getChatPage = async (req, res) => {
  try {
    res.render('chat', {
      title: 'Chat',
      user: req.user,
      path: req.path,
      pageCss: ['chat']
    });
  } catch (error) {
    console.error('Error loading chat page:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading the chat.',
      user: req.user,
      path: req.path
    });
  }
};

// Get available chats for user
const getChats = async (req, res) => {
  try {
    const filter = { isActive: true };
    
    // Get public chats + private chats user is member of
    const publicChats = await Chat.find({ ...filter, type: 'public' })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: 1 });
    
    const privateChats = await Chat.find({ 
      ...filter, 
      type: 'private',
      members: req.user._id 
    })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: 1 });
    
    res.json({
      public: publicChats,
      private: privateChats
    });
  } catch (error) {
    console.error('Error getting chats:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading chats.'
    });
  }
};

// Get messages for a chat
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;
    
    // Check if user has access to this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found.'
      });
    }
    
    // Check private chat access
    if (chat.type === 'private' && !chat.members.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat.'
      });
    }
    
    const messages = await Message.find({
      chatId,
      isDeleted: false
    })
      .populate('author', 'firstName lastName')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'author',
          select: 'firstName lastName'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Reverse to show oldest first
    messages.reverse();
    
    const totalMessages = await Message.countDocuments({
      chatId,
      isDeleted: false
    });
    
    res.json({
      messages,
      hasMore: totalMessages > (page * limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading messages.'
    });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType, replyTo, mediaUrl } = req.body;
    
    // Validate input
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.'
      });
    }
    
    // Check chat access
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found.'
      });
    }
    
    if (chat.type === 'private' && !chat.members.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat.'
      });
    }
    
    // Create message
    const newMessage = new Message({
      chatId,
      author: req.user._id,
      content: content.trim(),
      messageType: messageType || 'text',
      replyTo: replyTo || null,
      mediaUrl: mediaUrl || ''
    });
    
    await newMessage.save();
    
    // Populate author info for response
    await newMessage.populate('author', 'firstName lastName');
    if (newMessage.replyTo) {
      await newMessage.populate({
        path: 'replyTo',
        populate: {
          path: 'author',
          select: 'firstName lastName'
        }
      });
    }
    
    res.json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while sending the message.'
    });
  }
};

// Delete own message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.'
      });
    }
    
    // Check if user owns the message or is admin
    if (message.author.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages.'
      });
    }
    
    message.isDeleted = true;
    message.content = '[Message deleted]';
    await message.save();
    
    res.json({
      success: true,
      message: 'Message deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the message.'
    });
  }
};

// Polling endpoint for new messages
const pollMessages = async (req, res) => {
  try {
    const { timestamp } = req.params;
    const { chatId } = req.query;
    
    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID is required.'
      });
    }
    
    // Check chat access
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isActive) {
      return res.json({ messages: [] });
    }
    
    if (chat.type === 'private' && !chat.members.includes(req.user._id)) {
      return res.json({ messages: [] });
    }
    
    const since = new Date(parseInt(timestamp));
    
    const newMessages = await Message.find({
      chatId,
      createdAt: { $gt: since },
      isDeleted: false
    })
      .populate('author', 'firstName lastName')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'author',
          select: 'firstName lastName'
        }
      })
      .sort({ createdAt: 1 });
    
    res.json({
      messages: newMessages,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error polling messages:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while polling for messages.'
    });
  }
};

export default {
  getChatPage,
  getChats,
  getMessages,
  sendMessage,
  deleteMessage,
  pollMessages
};