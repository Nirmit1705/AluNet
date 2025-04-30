import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Message from '../Models/Message.js';
import Student from '../Models/Student.js';
import Alumni from '../Models/Alumni.js';
import { createNotification } from './notificationController.js';

/**
 * @desc    Send a message
 * @route   POST /api/messages
 * @access  Private
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, content } = req.body;
  
  if (!content || !content.trim()) {
    res.status(400);
    throw new Error('Message content cannot be empty');
  }
  
  // Validate recipientId
  if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
    res.status(400);
    throw new Error('Valid recipient ID is required');
  }
  
  // Determine sender and recipient models
  const senderId = req.user._id;
  const senderModel = req.user.registrationNumber ? 'Student' : 'Alumni';
  
  console.log(`Sending message: From ${senderModel} (${senderId}) to ${recipientId}`);
  
  // Determine recipient model (opposite of sender)
  const recipientModel = senderModel === 'Student' ? 'Alumni' : 'Student';
  const RecipientModel = recipientModel === 'Student' ? Student : Alumni;
  
  console.log(`Looking for recipient in ${recipientModel} model`);
  
  try {
    // Check if recipient exists
    const recipient = await RecipientModel.findById(recipientId);
    
    if (!recipient) {
      console.log(`Recipient not found: ${recipientId} in ${recipientModel} model`);
      res.status(404);
      throw new Error('Recipient not found');
    }
    
    console.log(`Found recipient: ${recipient.name} (${recipient._id})`);
    
    // Verify that the users are connected before allowing messaging
    const areConnected = await checkConnection(senderId, recipientId, senderModel, recipientModel);
    
    if (!areConnected) {
      console.log(`Connection check failed between ${senderId} and ${recipientId}`);
      res.status(403);
      throw new Error('You must be connected with this user to send messages');
    }
    
    // Create message
    const message = await Message.create({
      sender: senderId,
      senderModel,
      receiver: recipientId,
      receiverModel: recipientModel,
      content,
      isRead: false,
      deliveryStatus: 'sent',
      messageType: 'text'
    });
    
    if (message) {
      console.log(`Message created successfully: ${message._id}`);
      
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
  } catch (error) {
    console.error(`Error sending message to ${recipientId}:`, error);
    
    // If the response hasn't been sent yet, send an error response
    if (!res.headersSent) {
      res.status(error.statusCode || 500);
      throw error;
    }
  }
});

/**
 * @desc    Get conversation between two users
 * @route   GET /api/messages/:userId
 * @access  Private
 */
const getConversation = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const currentUserId = req.user._id;
  const currentUserModel = req.user.registrationNumber ? 'Student' : 'Alumni';
  const otherUserModel = currentUserModel === 'Student' ? 'Alumni' : 'Student';
  
  // Check connection first
  const areConnected = await checkConnection(currentUserId, userId, currentUserModel, otherUserModel);
  if (!areConnected) {
    res.status(403);
    throw new Error('You must be connected with this user to view messages');
  }
  
  // Get all messages between these two users
  const messages = await Message.find({
    $or: [
      { 
        sender: currentUserId, 
        receiver: userId,
        deletedFor: { $not: { $elemMatch: { user: currentUserId } } }
      },
      { 
        sender: userId, 
        receiver: currentUserId,
        deletedFor: { $not: { $elemMatch: { user: currentUserId } } }
      }
    ],
    isDeleted: false
  }).sort('createdAt');
  
  // Mark messages as read
  await Message.updateMany(
    { 
      sender: userId, 
      receiver: currentUserId, 
      isRead: false 
    },
    { 
      isRead: true,
      readAt: new Date()
    }
  );
  
  res.json(messages);
});

/**
 * @desc    Get all conversations for current user
 * @route   GET /api/messages
 * @access  Private
 */
const getConversations = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const currentUserModel = req.user.registrationNumber ? 'Student' : 'Alumni';
  
  // Find all unique conversations
  const sent = await Message.find({ 
    sender: currentUserId,
    // Exclude messages deleted by current user
    deletedFor: { 
      $not: { $elemMatch: { user: currentUserId } } 
    }
  }).distinct('receiver');
  
  const received = await Message.find({ 
    receiver: currentUserId,
    // Exclude messages deleted by current user
    deletedFor: { 
      $not: { $elemMatch: { user: currentUserId } } 
    }
  }).distinct('sender');
  
  // Combine unique recipients
  const conversationUserIds = [...new Set([...sent, ...received])];
  
  // Get details of conversation partners and last message
  const conversations = [];
  
  for (const userId of conversationUserIds) {
    // Find last message in conversation
    const lastMessage = await Message.findOne({
      $or: [
        { 
          sender: currentUserId, 
          receiver: userId,
          deletedFor: { $not: { $elemMatch: { user: currentUserId } } }
        },
        { 
          sender: userId, 
          receiver: currentUserId,
          deletedFor: { $not: { $elemMatch: { user: currentUserId } } }
        }
      ],
      isDeleted: false
    }).sort('-createdAt');
    
    if (!lastMessage) continue;
    
    // Determine user model
    const otherUserModel = (lastMessage.senderModel === 'Student' && lastMessage.sender.toString() === userId.toString()) || 
                   (lastMessage.receiverModel === 'Student' && lastMessage.receiver.toString() === userId.toString())
                   ? Student : Alumni;
    
    // Get user details
    const user = await otherUserModel.findById(userId).select('name profilePicture');
    
    if (user) {
      // Count unread messages
      const unreadCount = await Message.countDocuments({
        sender: userId, 
        receiver: currentUserId,
        isRead: false,
        deletedFor: { $not: { $elemMatch: { user: currentUserId } } }
      });
      
      conversations.push({
        userId: userId,
        name: user.name,
        profilePicture: user.profilePicture?.url || null,
        lastMessage: {
          id: lastMessage._id,
          content: lastMessage.content,
          timestamp: lastMessage.createdAt,
          sentByMe: lastMessage.sender.toString() === currentUserId.toString(),
          isRead: lastMessage.isRead
        },
        unreadCount
      });
    }
  }
  
  // Sort by last message timestamp
  conversations.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
  
  res.json(conversations);
});

/**
 * @desc    Mark a message as read
 * @route   PUT /api/messages/:messageId/read
 * @access  Private
 */
const markMessageAsRead = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId;
  const currentUserId = req.user._id;
  
  const message = await Message.findById(messageId);
  
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }
  
  // Only the receiver can mark a message as read
  if (message.receiver.toString() !== currentUserId.toString()) {
    res.status(403);
    throw new Error('Not authorized to mark this message as read');
  }
  
  message.isRead = true;
  message.readAt = new Date();
  await message.save();
  
  res.json({ success: true });
});

/**
 * @desc    Delete a message (only for the current user)
 * @route   DELETE /api/messages/:messageId
 * @access  Private
 */
const deleteMessage = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId;
  const currentUserId = req.user._id;
  const currentUserModel = req.user.registrationNumber ? 'Student' : 'Alumni';
  
  const message = await Message.findById(messageId);
  
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }
  
  // Check if user is part of this conversation
  const isParticipant = 
    (message.sender.toString() === currentUserId.toString()) || 
    (message.receiver.toString() === currentUserId.toString());
  
  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized to delete this message');
  }
  
  // Add user to deletedFor array
  message.deletedFor.push({
    user: currentUserId,
    deletedForModel: currentUserModel
  });
  
  // If both users have deleted the message, mark it as fully deleted
  const otherUserId = message.sender.toString() === currentUserId.toString() 
    ? message.receiver 
    : message.sender;
  
  const otherUserDeleted = message.deletedFor.some(
    del => del.user.toString() === otherUserId.toString()
  );
  
  if (otherUserDeleted) {
    message.isDeleted = true;
  }
  
  await message.save();
  
  res.json({ success: true });
});

/**
 * Helper function to check if two users are connected
 */
const checkConnection = async (userId1, userId2, model1, model2) => {
  try {
    // Determine which user is student and which is alumni
    let studentId, alumniId;
    
    if (model1 === 'Student') {
      studentId = userId1;
      alumniId = userId2;
    } else {
      studentId = userId2;
      alumniId = userId1;
    }
    
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(alumniId)) {
      console.error(`Invalid ObjectId: studentId=${studentId}, alumniId=${alumniId}`);
      return false;
    }
    
    console.log(`Checking connection between student=${studentId} and alumni=${alumniId}`);
    
    // Find connection where student and alumni match and status is accepted
    const connection = await mongoose.model('Connection').findOne({
      student: studentId,
      alumni: alumniId,
      status: 'accepted'
    });
    
    // For debugging
    console.log(`Connection check result: ${!!connection ? 'Found' : 'Not found'}`);
    
    return !!connection;
  } catch (error) {
    console.error("Error checking connection:", error);
    return false;
  }
};

export { 
  sendMessage, 
  getConversation, 
  getConversations, 
  markMessageAsRead,
  deleteMessage 
};