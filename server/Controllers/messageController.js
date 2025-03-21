import asyncHandler from 'express-async-handler';
import Message from '../Models/Message.js';
import Student from '../Models/Student.js';
import Alumni from '../Models/Alumni.js';
import { createNotification } from './notificationController.js';

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, content, receiverModel } = req.body;

  if (!receiverId || !content || !receiverModel) {
    res.status(400);
    throw new Error('Please provide receiverId, content, and receiverModel');
  }

  // Determine sender type based on the authenticated user
  let senderModel;
  if (req.user.constructor.modelName === 'Student') {
    senderModel = 'Student';
  } else if (req.user.constructor.modelName === 'Alumni') {
    senderModel = 'Alumni';
  } else {
    res.status(400);
    throw new Error('Invalid sender type');
  }

  // Check if receiver exists
  let receiver;
  if (receiverModel === 'Student') {
    receiver = await Student.findById(receiverId);
  } else if (receiverModel === 'Alumni') {
    receiver = await Alumni.findById(receiverId);
  }

  if (!receiver) {
    res.status(404);
    throw new Error('Receiver not found');
  }

  // Create new message
  const newMessage = await Message.create({
    sender: req.user._id,
    senderModel: req.user.constructor.modelName,
    receiver: receiverId,
    receiverModel,
    content
  });

  // Create notification for the receiver
  try {
    await createNotification(
      receiverId,
      receiverModel,
      'message',
      'New Message',
      `You have received a new message from ${req.user.name}`,
      newMessage._id
    );
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    // Continue with the response even if notification fails
  }

  res.status(201).json(newMessage);
});

// @desc    Get conversation with another user
// @route   GET /api/messages/:userId
// @access  Private
const getConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const conversation = await Message.getConversation(req.user._id, userId)
    .populate('sender', 'name email')
    .populate('receiver', 'name email');
  
  res.json(conversation);
});

// @desc    Get all conversations for the current user
// @route   GET /api/messages
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  // Find all messages where the current user is either sender or receiver
  const messages = await Message.find({
    $or: [
      { sender: req.user._id },
      { receiver: req.user._id }
    ]
  }).sort({ createdAt: -1 });
  
  // Extract unique conversation partners
  const conversationPartners = new Set();
  const conversations = [];
  
  messages.forEach(message => {
    // Determine the conversation partner (the other user)
    const partnerId = message.sender.equals(req.user._id) 
      ? message.receiver.toString() 
      : message.sender.toString();
      
    const partnerModel = message.sender.equals(req.user._id)
      ? message.receiverModel
      : message.senderModel;
    
    // Create a unique identifier for this conversation
    const conversationKey = `${partnerId}-${partnerModel}`;
    
    // If we haven't processed this conversation partner yet
    if (!conversationPartners.has(conversationKey)) {
      conversationPartners.add(conversationKey);
      
      // Count unread messages
      const unreadCount = messages.filter(msg => 
        msg.receiver.equals(req.user._id) && 
        msg.sender.toString() === partnerId && 
        !msg.isRead
      ).length;
      
      // Get the most recent message
      const latestMessage = messages.find(msg => 
        (msg.sender.equals(req.user._id) && msg.receiver.toString() === partnerId) ||
        (msg.receiver.equals(req.user._id) && msg.sender.toString() === partnerId)
      );
      
      conversations.push({
        partnerId,
        partnerModel,
        unreadCount,
        latestMessage: {
          content: latestMessage.content,
          createdAt: latestMessage.createdAt,
          isFromMe: latestMessage.sender.equals(req.user._id)
        }
      });
    }
  });
  
  res.json(conversations);
});

// @desc    Mark message as read
// @route   PUT /api/messages/:messageId/read
// @access  Private
const markMessageAsRead = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.messageId);
  
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }
  
  // Only the receiver can mark a message as read
  if (!message.receiver.equals(req.user._id)) {
    res.status(401);
    throw new Error('Not authorized to mark this message as read');
  }
  
  message.isRead = true;
  await message.save();
  
  res.json({ message: 'Message marked as read' });
});

export {
  sendMessage,
  getConversation,
  getConversations,
  markMessageAsRead
}; 