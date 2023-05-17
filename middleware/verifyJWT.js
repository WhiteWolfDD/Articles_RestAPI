const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

module.exports = async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }

    try {
        const token = req.cookies.token
        if (!token) {
            return res.status(401).json({message: "User is not authorized."})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.user.id)
        if (!req.user) {
            return res.status(401).json({message: "User is not authorized."})
        }

        next()
    } catch (e) {
        return res.status(401).json({message: "User is not authorized."})
    }
}