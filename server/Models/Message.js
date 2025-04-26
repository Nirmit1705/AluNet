import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    // Add schema version for migration management
    schemaVersion: {
        type: Number,
        default: 1,
        required: true
        // CRITICAL: Enables schema evolution tracking for future migrations
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        refPath: 'senderModel',
        index: true // IMPORTANT: Optimizes queries by sender
    },
    senderModel: { 
        type: String, 
        required: true, 
        enum: ['Student', 'Alumni']
    },
    receiver: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        refPath: 'receiverModel',
        index: true // IMPORTANT: Optimizes queries by receiver
    },
    receiverModel: { 
        type: String, 
        required: true, 
        enum: ['Student', 'Alumni']
    },
    content: { 
        type: String, 
        required: true,
        maxlength: [5000, 'Message cannot exceed 5000 characters']
        // IMPORTANT: Prevents excessively large documents
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
        // IMPORTANT: Tracks when messages are actually read
    },
    // Add delivery status tracking
    deliveryStatus: {
        type: String,
        enum: ['sent', 'delivered', 'failed'],
        default: 'sent'
        // CRITICAL: Provides reliable message delivery tracking
    },
    // Add message type support
    messageType: {
        type: String,
        enum: ['text', 'file', 'link', 'system'],
        default: 'text'
        // IMPORTANT: Enables different message formats
    },
    // Add support for attachments
    attachments: [{
        fileUrl: String,
        fileName: String,
        fileSize: Number,
        fileType: String
        // IMPORTANT: Supports rich messaging experience
    }],
    // Add edit history support
    isEdited: {
        type: Boolean,
        default: false
    },
    editHistory: [{
        content: String,
        editedAt: {
            type: Date,
            default: Date.now
        }
        // CRITICAL: Provides audit trail for message modifications
    }],
    // Add soft deletion
    isDeleted: {
        type: Boolean,
        default: false
        // CRITICAL: Enables "delete for me" functionality without losing conversation history
    },
    deletedFor: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'deletedForModel'
        },
        deletedForModel: {
            type: String,
            enum: ['Student', 'Alumni']
        },
        deletedAt: {
            type: Date,
            default: Date.now
        }
        // CRITICAL: Supports individual message deletion in conversations
    }],
    createdAt: { 
        type: Date, 
        default: Date.now,
        immutable: true // CRITICAL: Ensures data integrity
    }
}, { 
    timestamps: true
});

// Create a compound index for efficiently retrieving conversations
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

// Create an index for finding unread messages
messageSchema.index({ receiver: 1, isRead: 1 });

// Create an index for deleted messages
messageSchema.index({ isDeleted: 1 });

// Method to mark a message as read
messageSchema.methods.markAsRead = async function() {
    this.isRead = true;
    this.readAt = Date.now();
    return this.save();
    // IMPROVED: Adds read timestamp for analytics
};

// Method to edit a message
messageSchema.methods.editMessage = async function(newContent) {
    // Store the old content in history
    if (!this.isEdited) {
        this.isEdited = true;
    }
    
    this.editHistory.push({
        content: this.content,
        editedAt: Date.now()
    });
    
    this.content = newContent;
    return this.save();
    // CRITICAL: Allows message editing while maintaining history
};

// Method to soft delete a message for a specific user
messageSchema.methods.deleteForUser = async function(userId, userModel) {
    // Add to deletedFor array
    this.deletedFor.push({
        user: userId,
        deletedForModel: userModel,
        deletedAt: Date.now()
    });
    
    // If deleted for all participants, mark as fully deleted
    const conversation = await this.model('Message').find({
        $or: [
            { sender: this.sender, receiver: this.receiver },
            { sender: this.receiver, receiver: this.sender }
        ]
    });
    
    const participants = [...new Set([
        this.sender.toString(),
        this.receiver.toString()
    ])];
    
    const deletedForAll = participants.every(participant => 
        this.deletedFor.some(d => d.user.toString() === participant)
    );
    
    if (deletedForAll) {
        this.isDeleted = true;
    }
    
    return this.save();
    // CRITICAL: Implements proper message deletion behavior
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = async function(user1Id, user2Id, limit = 50, page = 1) {
    const skip = (page - 1) * limit;
    
    return this.find({
        $or: [
            { 
                sender: user1Id, 
                receiver: user2Id,
                deletedFor: { 
                    $not: { 
                        $elemMatch: { user: user1Id } 
                    } 
                }
            },
            { 
                sender: user2Id, 
                receiver: user1Id,
                deletedFor: { 
                    $not: { 
                        $elemMatch: { user: user1Id } 
                    } 
                }
            }
        ],
        isDeleted: false
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .then(messages => messages.reverse());
    // CRITICAL: Adds pagination and respects message deletion settings
};

// Add middleware to exclude deleted messages
messageSchema.pre(/^find/, function(next) {
    // Only apply if not explicitly querying for deleted messages
    if (this.getQuery().isDeleted === undefined) {
        this.find({ isDeleted: false });
    }
    next();
    // CRITICAL: Ensures deleted messages aren't accidentally accessed
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
