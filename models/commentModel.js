const mongoose = require('mongoose');
const {Schema} = require("mongoose");
const Author = require('./userModel');

const Comment = mongoose.model('comments', new Schema({
    body: {
        type: String,
        required: [true, "Body is required"],
        minlength: [3, "Body must be at least 3 characters long"],
        maxlength: [20000, "Body must be at most 20000 characters long"]
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    article: {
        type: Schema.Types.ObjectId,
        ref: 'articles'
    }
}));

Comment.schema.set('versionKey', false);

Comment.prototype.toCommentResponse = async function (user) {
    const author = await Author.findById(this.author).exec();
    return {
        id: this._id,
        body: this.body,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        author: author.toProfileJSON(user)
    }
};

module.exports = Comment;