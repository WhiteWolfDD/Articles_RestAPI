const mongoose = require('mongoose');
const {Schema} = require("mongoose");
const jwt = require('jsonwebtoken');

const User = mongoose.model('users', new Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: {
            message: "Email is already registered",
            index: true
        }
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true
    },
    bio: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: "https://static.productionready.io/images/smiley-cyrus.jpg"
    },
    favoritedArticles: [{
        type: Schema.Types.ObjectId,
        ref: 'articles'
    }],
    followingUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }],
}, {
    timestamps: true
}));

User.schema.set('versionKey', false);

User.prototype.generateAccessToken = function (res) {
    const token = jwt.sign({
            "user": {
                "id": this._id,
                "email": this.email,
                "password": this.password,
            }
        },
        process.env.JWT_SECRET,
        {expiresIn: '1d'}
    );

    res.cookie('token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 });

    return token;
}

User.prototype.toUserResponse = function(res) {
    return {
        username: this.username,
        email: this.email,
        bio: this.bio,
        image: this.image,
        token: this.generateAccessToken(res)
    }
};

User.prototype.toProfileJSON = function (user) {
    return {
        username: this.username,
        bio: this.bio,
        image: this.image,
        following: user ? user.isFollowing(this._id) : false
    }
};

User.prototype.isFollowing = function (id) {
    const idStr = id.toString();
    for (const followingUser of this.followingUsers) {
        if (followingUser.toString() === idStr) {
            return true;
        }
    }
    return false;
};

User.prototype.follow = function (id) {
    if(this.followingUsers.indexOf(id) === -1){
        this.followingUsers.push(id);
    }
    return this.save();
};

User.prototype.unfollow = function (id) {
    if(this.followingUsers.indexOf(id) !== -1){
        this.followingUsers.remove(id);
    }
    return this.save();
};

User.prototype.isFavourite = function (id) {
    const idStr = id.toString();
    for (const article of this.favoritedArticles) {
        if (article.toString() === idStr) {
            return true;
        }
    }
    return false;
}

User.prototype.favorite = function (id) {
    if(this.favoritedArticles.indexOf(id) === -1){
        this.favoritedArticles.push(id);
    }
    
    return this.save();
}

User.prototype.unfavorite = function (id) {
    if(this.favoritedArticles.indexOf(id) !== -1){
        this.favoritedArticles.remove(id);
    }

    return this.save();
};

module.exports = User;