const authMiddleware = require('../middlewares/authMiddleware')
const Chat = require('../models/chatSchema')
const Message = require('../models/messageSchema')
const router = require('express').Router()

//new-message
router.post('/new-message', authMiddleware, async (req, res) => {
    try {
        //store message
        const newMessage = new Message(req.body)
        const savedMessage = await newMessage.save()


        //update last message of chat
        const dum = await Chat.findByIdAndUpdate(
            req.body.chat,
            {
                lastMessage: savedMessage._id,
                $inc: { unreadMessages: 1 } // Proper use of $inc
            },
            { new: true } // Optional: Returns the updated document
        );

        console.log(dum);


        res.send({
            message: 'message sent successfully',
            success: true,
            data: savedMessage
        })

    } catch (error) {
        res.send({
            message: 'error sending message',
            success: false,
            error: error.message
        })
    }
})

//get all messages of the chat 

router.get('/get-all-messages/:chatId', authMiddleware, async (req, res) => {

    try {

        const messages = await Message.find({
            chat: req.params.chatId
        }).sort({ createdAt: 1 });
        res.send({
            message: 'messages retrieved successfully',
            success: true,
            data: messages
        })

    } catch (error) {
        res.send({
            message: 'error retrieving messages',
            success: false,
            error: error.message
        })
    }
})

module.exports = router