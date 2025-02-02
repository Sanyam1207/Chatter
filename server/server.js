    const express = require('express')
    require('dotenv').config()
    const dbConfig = require('./config/dbConfig')
    const cors = require('cors')
    const httpServer = require('http')
    const socket = require('socket.io')

    const usersRoutes = require("./routes/usersRoutes")
    const chatsRoutes = require('./routes/chatsRoutes')
    const messageRoutes = require('./routes/messagesRoute')

    const app = express()
    const server = httpServer.createServer(app)

    const port = process.env.PORT || 5000
    const io = socket(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true
        }
    })
    let onlineUsers = []
    //check the socket connection
    io.on('connection', (socket) => {

        //socket events here
        socket.on('join-room', ({user}) => {
            socket.join(user)
            console.log(`user joined room ${user}`)
        })

        //send message to all users in the members array
        socket.on('send-message', (message) => {
            io.to(message.members[0]).to(message.members[1]).emit('recieve-message', message)
        })

        socket.on('clear-unread-messages', (data) => {
            io.to(data.members[0]).to(data.members[1]).emit('unread-messages-cleared', data)
        })

        socket.on('typing', (data)=>{
            io.to(data.members[0]).to(data.members[1]).emit('started-typing', data)
        })

        //online users
        
        socket.on('came-online', ({user}) => {
            if (!onlineUsers.includes(user)) {
                onlineUsers.push(user)

            }
            io.emit('online-users', onlineUsers)
        })

        socket.on('went-offline', (user) => {
            onlineUsers = onlineUsers.filter((userId) => userId !== user)
            io.emit('online-users', onlineUsers)
        })
    })


    app.use(express.json(
        {
            limit: '30mb'
        }
    ))
    app.use(cors())
    app.use('/api/users', usersRoutes)
    app.use('/api/chats', chatsRoutes)
    app.use('/api/messages', messageRoutes)


const path = require("path");
__dirname = path.resolve();
// heroku deployment
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

    server.listen(port, () => {
        console.log(`Server is running on port ${port}`)
    })
