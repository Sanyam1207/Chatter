const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const messageSchema = require('../models/messageSchema')
const chatSchema = require('../models/chatSchema')

// Create new Chat 
router.post("/create-new-chat", authMiddleware, async (req, res) => {
    try {
        const newChat = new chatSchema(req.body)
        const savedChat = await newChat.save()
        savedChat = await savedChat.populate('members')
        await savedChat.save()
        res.send({
            success: true,
            message: 'Chat created successfully',
            data: savedChat
        })
    } catch (error) {
        res.send({
            success: false,
            message: 'Error creating a new chat',
            data: error.message
        })
    }
})


//get all chats of current user
router.get("/get-all-chats", authMiddleware, async (req, res) => {
    try {
        const chats = await chatSchema.find({ members: { $in: [req.body.userId] } }).populate('members').populate('lastMessage').sort({ updatedAt: -1 })
        res.send({
            success: true,
            message: 'All chats fetched successfully',
            data: chats
        })
    } catch (error) {
        res.send({
            success: false,
            message: 'Error Fetching the chats from the server',
            data: error.message
        })
    }
})

//clear unread message of a particular chat
router.post('/clear-unread-messages', authMiddleware, async (req, res) => {
    try {
        const chat = await chatSchema.findById(req.body.chat)
        if (!chat) {
            return res.send({ success: false, message: 'Chat not found' })
        }
        const updatedChat = await chatSchema.findByIdAndUpdate(req.body.chat, { unreadMessages: 0 }, {
            new: true
        }).populate("members").populate('lastMessage')

        await messageSchema.updateMany({ chat: req.body.chat, read: false }, { $set: { read: true }})

        res.send({
            success: true,
            message: 'Unread messages cleared successfully',
            data: updatedChat
        })
    } catch (error) {
        res.send({
            success: false,
            message: 'Error clearing unread messages',
            data: error.message
        })
    }
})

module.exports = router