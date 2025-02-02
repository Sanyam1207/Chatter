const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URL)

const db = mongoose.connection;

db.on('connected', ()=>{
    console.log("Connected to database")
})

db.on('error', ()=>{
    console.log("error connecting to database")
})

module.exports = db