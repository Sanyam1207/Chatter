const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.send({
                success: false,
                message: 'Authorization header is missing'
            })
        }
        const token = req.headers.authorization.split(" ")[1]
        if (!token) {
            return res.send({
                success: false,
                message: 'token is required'
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log(decoded.userId)
        req.body.userId = decoded.userId
        next()
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
}