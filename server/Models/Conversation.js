import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    // Participants in the conversation
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'participantModels',
        required: true
    }],
    
    // Model type for each participant (Student or Alumni)
    participantModels: [{
        type: String,
        enum: ['Student', 'Alumni'],
        required: true
    }],
    
    // Last message in the conversation for quick access
    lastMessage: {
        content: String,
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'lastMessageSenderModel'
        },
        lastMessageSenderModel: {
            type: String,
            enum: ['Student', 'Alumni']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    
    // Unread message counts for each participant
    unreadCounts: [{
        participant: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'unreadCountModels'
        },
        unreadCountModels: {
            type: String,
            enum: ['Student', 'Alumni']
        },
        count: {
            type: Number,
            default: 0
        }
    }],
    
    // Conversation name (optional, for group chats in future)
    name: {
        type: String
    },
    
    // Creation timestamp
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    
    // Last activity timestamp
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true
});

// Create indexes for better performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });
conversationSchema.index({ 'unreadCounts.participant': 1 });

// Method to update last message
conversationSchema.methods.updateLastMessage = function(message) {
    this.lastMessage = {
        content: message.content,
        sender: message.sender,
        lastMessageSenderModel: message.senderModel,
        timestamp: message.createdAt || new Date(),
        isRead: false
    };
    this.updatedAt = new Date();
    return this.save();
};

// Method to increment unread count for a participant
conversationSchema.methods.incrementUnreadCount = function(participantId) {
    const unreadCountEntry = this.unreadCounts.find(
        entry => entry.participant.toString() === participantId.toString()
    );
    
    if (unreadCountEntry) {
        unreadCountEntry.count += 1;
    } else {
        // Determine the participant model
        const participantIndex = this.participants.findIndex(
            p => p.toString() === participantId.toString()
        );
        
        if (participantIndex >= 0) {
            this.unreadCounts.push({
                participant: participantId,
                unreadCountModels: this.participantModels[participantIndex],
                count: 1
            });
        }
    }
    
    return this.save();
};

// Method to reset unread count for a participant
conversationSchema.methods.resetUnreadCount = function(participantId) {
    const unreadCountEntry = this.unreadCounts.find(
        entry => entry.participant.toString() === participantId.toString()
    );
    
    if (unreadCountEntry) {
        unreadCountEntry.count = 0;
        return this.save();
    }
    
    return this;
};

// Static method to find conversation between two participants
conversationSchema.statics.findBetween = function(user1Id, user2Id) {
    return this.findOne({
        participants: { 
            $all: [user1Id, user2Id],
            $size: 2 // Ensure only 2 participants (direct conversation)
        }
    });
};

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
