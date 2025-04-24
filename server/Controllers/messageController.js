import asyncHandler from 'express-async-handler';
import Message from '../Models/Message.js';
import Student from '../Models/Student.js';
import Alumni from '../Models/Alumni.js';
import { createNotification } from './notificationController.js';

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, content } = req.body;
  
  if (!content.trim()) {
    res.status(400);
    throw new Error('Message content cannot be empty');
  }
  
  // Determine sender and recipient models
  const senderId = req.user._id;
  const senderModel = req.user.registrationNumber ? 'Student' : 'Alumni';
  
  // Check if recipient exists
  const recipientModel = senderModel === 'Student' ? 'Alumni' : 'Student';
  const RecipientModel = recipientModel === 'Student' ? Student : Alumni;
  
  const recipient = await RecipientModel.findById(recipientId);
  if (!recipient) {
    res.status(404);
    throw new Error('Recipient not found');
  }
  
  // Create message
  const message = await Message.create({
    sender: senderId,
    senderModel,
    recipient: recipientId,
    recipientModel,
    content,
    readStatus: false
  });
  
  if (message) {
    // Create notification for recipient
    await createNotification(
      recipientId,
      recipientModel,
      'message',
      'New Message',
      `You have received a new message from ${req.user.name}`,
      message._id
    );
    
    res.status(201).json(message);
  } else {
    res.status(400);
    throw new Error('Failed to send message');
  }
});

// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
// @access  Private
const getConversation = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const currentUserId = req.user._id;
  
  const messages = await Message.find({
    $or: [
      { sender: currentUserId, recipient: userId },
      { sender: userId, recipient: currentUserId }
    ]
  }).sort('createdAt');
  
  // Mark messages as read
  await Message.updateMany(
    { sender: userId, recipient: currentUserId, readStatus: false },
    { readStatus: true }
  );
  
  res.json(messages);
});

// @desc    Get all conversations for current user
// @route   GET /api/messages
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  
  // Find all unique conversations
  const sent = await Message.find({ sender: currentUserId })
    .distinct('recipient');
  
  const received = await Message.find({ recipient: currentUserId })
    .distinct('sender');
  
  // Combine unique recipients
  const conversationUserIds = [...new Set([...sent, ...received])];
  
  // Get details of conversation partners and last message
  const conversations = [];
  
  for (const userId of conversationUserIds) {
    // Find last message in conversation
    const lastMessage = await Message.findOne({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId }
      ]
    }).sort('-createdAt');
    
    // Determine user model
    const userModel = lastMessage.senderModel === 'Student' && lastMessage.sender.equals(userId) || 
                      lastMessage.recipientModel === 'Student' && lastMessage.recipient.equals(userId) 
                      ? Student : Alumni;
    
    // Get user details
    const user = await userModel.findById(userId).select('name profilePicture');
    
    if (user) {
      // Count unread messages
      const unreadCount = await Message.countDocuments({
        sender: userId, 
        recipient: currentUserId,
        readStatus: false
      });
      
      conversations.push({
        userId,
        name: user.name,
        profilePicture: user.profilePicture?.url || null,
        lastMessage: {
          content: lastMessage.content,
          timestamp: lastMessage.createdAt,
          sentByMe: lastMessage.sender.equals(currentUserId)
        },
        unreadCount
      });
    }
  }
  
  // Sort by last message timestamp
  conversations.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
  
  res.json(conversations);
});

export { sendMessage, getConversation, getConversations };