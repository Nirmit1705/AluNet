const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        refPath: 'senderType' // Can reference either Student or Alumni
    },
    senderType: { 
        type: String, 
        required: true, 
        enum: ['Student', 'Alumni'] // Determines whether the sender is a student or an alumnus
    },
    receiver: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        refPath: 'receiverType' 
    },
    receiverType: { 
        type: String, 
        required: true, 
        enum: ['Student', 'Alumni'] 
    },
    message: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
}, { collection: 'Messages' });

const Message = mongoose.model('Message', messageSchema, 'Messages');

module.exports = Message;