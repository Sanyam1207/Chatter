const User = require('../models/userSchema')
const router = require('express').Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');
const cloudinary = require('../cloudinary')

//user Registration
router.post('/register', async (req, res) => {
    try {

        console.log(req.body);

        const user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.send({
                success: false,
                message: 'User Already Registered'
            })
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        req.body.password = hashedPassword

        const newUser = User(req.body)
        await newUser.save()

        res.send({
            success: true,
            message: 'User Created Successfully'
        })

    } catch (error) {
        res.send({
            message: error.message,
            success: false
        })
    }
})

//user Login
router.post('/login', async (req, res) => {
    try {

        const user = await User.findOne({
            email: req.body.email
        })

        console.log(user.name)

        if (!user) {
            return res.send({
                success: false,
                message: 'User Does Not Exist'
            })
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password)
        if (!validPassword) {
            return res.send({
                success: false,
                message: 'Username Or Password is Incorrect'
            })
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        })
        res.send({
            success: true,
            message: 'User Logged In Successfully',
            data: token
        })

    } catch (error) {
        res.send({
            message: ` message from the user route : :: : ${error.message}`,
            success: false
        })
    }
})

//Current user route 
router.get('/get-current-user', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.userId })
        console.log(`From the get-user route: ${user.name}`)
        res.send({
            success: true,
            message: 'User Found',
            data: user
        })
    } catch (error) {
        res.send({
            message: `message from the user route : :: : ${error.message}`,
            success: false
        })
    }
})


// Get all users except current user
router.get('/get-all-users', authMiddleware, async (req, res) => {
    try {
        const allUsers = await User.find({ _id: { $ne: req.body.userId } })
        res.send({
            success: true,
            message: 'Users fetched successfully',
            data: allUsers
        })
    } catch (error) {
        res.send({
            success: false,
            message: `Error in user Route get-all-user ${error.message}`
        })
    }
})

//update user profile picture
router.post('/upload-profile-picture', authMiddleware, async (req, res) => {
    try {
        const image = req.body.image

        //upload image to cloudinary and get url
        const uploadedImage = await cloudinary.uploader.upload(image, {
            folder: 'ipu-iif',
        })

        //update user profile picture
        const user = await User.findByIdAndUpdate({ _id: req.body.userId }, {
            profilePicture: uploadedImage.secure_url
        }, {
            new: true
        })

        res.send({
            success: true,
            message: 'Profile picture updated successfully',
            data: user
        })
    } catch (error) {
        res.send({
            success: false,
            message: `Error in user Route upload-profile-picture ${error.message}`
        })
    }
})


module.exports = router