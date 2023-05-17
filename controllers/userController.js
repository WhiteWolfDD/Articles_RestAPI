const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Article = require("../models/articleModel");
const Comment = require("../models/commentModel");
const {validationResult} = require("express-validator");

// Get currently logged-in user
const getCurrentUser = async (req, res, next) => {
    const email = req.user.email;

    const user = await User.findOne({email}).exec();

    if (!user) {
        return res.status(404).json({message: "User Not Found"});
    }

    try {
        return res.status(200).json({
            user: user.toUserResponse(res)
        });
    } catch (e) {
        next(e);
    }
};

// Register a new user
const registerUser = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const {user} = req.body;

        if (!user || !user.email || !user.username || !user.password) {
            return res.status(400).json({message: "All fields are required"});
        }

        const hashedPwd = await bcrypt.hash(user.password, 10);

        const userObject = {
            "username": user.username,
            "password": hashedPwd,
            "email": user.email
        };

        const createdUser = await User.create(userObject);

        return res.status(201).json({
            user: createdUser.toUserResponse(res)
        });
    } catch (e) {
        next(e);
    }
};

// Login a user
const userLogin = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const {user} = req.body;

        // confirm data
        if (!user || !user.email || !user.password) {
            return res.status(400).json({message: "All fields are required"});
        }

        const loginUser = await User.findOne({email: user.email}).exec();

        if (!loginUser) {
            return res.status(404).json({message: "User Not Found"});
        }

        const match = await bcrypt.compare(user.password, loginUser.password);

        if (!match) return res.status(401).json({message: 'Unauthorized: Wrong password'})

        return res.status(200).json({
            user: loginUser.toUserResponse(res)
        });
    } catch (e) {
        next(e);
    }
};

// Update user
const updateUser = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const {user} = req.body;

        if (!user) {
            return res.status(400).json({message: "Required a User object"});
        }

        const email = req.user.email;

        const target = await User.findOne({email}).exec();

        if (user.email) {
            target.email = user.email;
        }
        if (user.username) {
            target.username = user.username;
        }
        if (user.password) {
            target.password = await bcrypt.hash(user.password, 10);
        }
        if (typeof user.image !== 'undefined') {
            target.image = user.image;
        }
        if (typeof user.bio !== 'undefined') {
            target.bio = user.bio;
        }

        await target.save();
        return res.status(200).json({
            user: target.toUserResponse(res)
        });
    } catch (err) {
        next(err);
    }
};

const deleteMe = async (req, res, next) => {
    const user = await User.findById(req.user.id).exec();

    if (!user) {
        return res.status(401).json({message: "User is not authorized."});
    }

    try {
        await Article.deleteMany({author: req.user.id});
        await Comment.deleteMany({author: req.user.id});
        for (let article of user.favoritedArticles) {
            await Article.updateOne({_id: article}, {$inc: {favoritesCount: -1}});
        }
        await User.deleteOne({_id: req.user.id});

        return res.status(200).json({message: "User deleted and all articles, comments, and favorites removed."});
    } catch (err) {
        next(err);
    }
}

module.exports = {
    registerUser,
    getCurrentUser,
    userLogin,
    updateUser,
    deleteMe
}