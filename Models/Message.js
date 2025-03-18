
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        refPath: 'senderModel'
    },
    senderModel: { 
        type: String, 
        required: true, 
        enum: ['Student', 'Alumni']
    },
    receiver: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        refPath: 'receiverModel'
    },
    receiverModel: { 
        type: String, 
        required: true, 
        enum: ['Student', 'Alumni']
    },
    content: { 
        type: String, 
        required: true 
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, { 
    timestamps: true
});

// Create a compound index for efficiently retrieving conversations
messageSchema.index({ sender: 1, receiver: 1 });

// Create an index for finding unread messages
messageSchema.index({ receiver: 1, isRead: 1 });

// Method to mark a message as read
messageSchema.methods.markAsRead = async function() {
    this.isRead = true;
    return this.save();
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = async function(user1Id, user2Id) {
    return this.find({
        $or: [
            { sender: user1Id, receiver: user2Id },
            { sender: user2Id, receiver: user1Id }
        ]
    }).sort({ createdAt: 1 });
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
