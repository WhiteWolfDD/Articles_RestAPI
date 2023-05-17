const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const User = require("./userModel");
const slugify = require('slugify');

const articleSchema = new mongoose.Schema({
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        index: true
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    tagList: [{
        type: String
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    favouritesCount: {
        type: Number,
        default: 0
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, {
    timestamps: true
});

articleSchema.set('versionKey', false);

articleSchema.plugin(uniqueValidator);

articleSchema.pre('save', function(next){
    this.slug = slugify(this.title, { lower: true, replacement: '-'});
    next();
});

const Article = mongoose.model('articles', articleSchema);

Article.prototype.updateFavoriteCount = async function (articleId) {
    this.favouritesCount = await User.count({
        favouriteArticles: {$in: [this._id]}
    });

    return this.save();
}

Article.prototype.toArticleResponse = async function (user) {
    const article = this;
    const author = await User.findById(this.author).exec();

    return {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tagList,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        favorited: user ? user.isFavourite(article._id) : false,
        favoritesCount: article.favoritesCount,
        author: author.toProfileJSON(user)
    }
}

Article.prototype.addComment = function (commentId) {
    if(this.comments.indexOf(commentId) === -1){
        this.comments.push(commentId);
    }

    return this.save();
};

Article.prototype.removeComment = function (commentId) {
    if(this.comments.indexOf(commentId) !== -1){
        this.comments.remove(commentId);
    }
    return this.save();
};

module.exports = Article;