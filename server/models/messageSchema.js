const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({

    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chats'
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    text: {
        type: String, 
    },
    read: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        required: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Messages', messageSchema)