const User = require('../models/userModel');

const getProfile = async (req, res) => {
    const {username} = req.params;
    const user = await User.findOne({username}).exec();

    if (!user) {
        return res.status(404).json({
            message: "User Not Found"
        })
    }

    if (!req.loggedin) {
        return res.status(200).json({
            profile: user.toProfileJSON(false)
        });
    } else {
        const loginUser = await User.findOne({ email: req.user.email }).exec();
        return res.status(200).json({
            profile: user.toProfileJSON(loginUser)
        })
    }

};

const followUser = async (req, res) => {
    const {username} = req.params;

    const loginUser = await User.findOne({email: req.user.email}).exec();
    const user = await User.findOne({username}).exec();

    if (!user || !loginUser) {
        return res.status(404).json({
            message: "User is not authorized."
        })
    }
    await loginUser.follow(user._id);

    return res.status(200).json({
        profile: user.toProfileJSON(loginUser)
    })

};

const unFollowUser = async (req, res) => {
    const {username} = req.params;

    const loginUser = await User.findOne({email: req.user.email}).exec();
    const user = await User.findOne({username}).exec();

    if (!user || !loginUser) {
        return res.status(404).json({
            message: "User is not authorized."
        })
    }
    await loginUser.unfollow(user._id);

    return res.status(200).json({
        profile: user.toProfileJSON(loginUser)
    })

};

module.exports = {
    getProfile,
    followUser,
    unFollowUser
}