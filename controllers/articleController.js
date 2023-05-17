const User = require('../models/userModel');
const Article = require("../models/articleModel");

// Get all articles
const listArticles = async (req, res) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    let query = {};

    if (req.query.tag) {
        query.tagList = {$in: [req.query.tag]}
    }

    if (req.query.author) {
        const author = await User.findOne({username: req.query.author}).exec();
        if (author) {
            query.author = author._id;
        }
    }

    if (req.query.favorited) {
        const favoriter = await User.findOne({username: req.query.favorited}).exec();
        if (favoriter) {
            query._id = {$in: favoriter.favouriteArticles}
        }
    }

    const filteredArticles = await Article.find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .sort({createdAt: 'desc'}).exec()

    const articleCount = await Article.count(query);

    return res.status(200).json({
        articles: await Promise.all(filteredArticles.map(async article => {
            return await article.toArticleResponse(req.user);
        })),
        articlesCount: articleCount
    });
};

// Get feed articles
const feedArticles = async (req, res) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;

    const loginUser = await User.findById(req.user.id).exec();

    const filteredArticles = await Article.find({author: {$in: loginUser.followingUsers}})
        .limit(Number(limit))
        .skip(Number(offset))
        .exec();

    const articleCount = await Article.count({author: {$in: loginUser.followingUsers}});

    return res.status(200).json({
        articles: await Promise.all(filteredArticles.map(async article => {
            return await article.toArticleResponse(loginUser);
        })),
        articlesCount: articleCount
    });
};

// Create article
const createArticle = async (req, res) => {
    const author = await User.findById(req.user._id);
    if (!author) {
        return res.status(401).json({message: "User is not authorized."});
    }

    const {title, description, body, tagList} = req.body.article;

    if (!title || !description || !body) {
        return res.status(400).json({message: "Title, description and body are required."});
    }

    const article = await Article.create({title, description, body, author: author._id});

    if (Array.isArray(tagList) && tagList.length > 0) {
        article.tagList = tagList;
    }

    await article.save();

    return await res.status(200).json({
        article: await article.toArticleResponse(author)
    });
};

// Update article
const updateArticle = async (req, res) => {
    const {article} = req.body;

    const {slug} = req.params;

    const loginUser = await User.findById(req.user.id).exec();

    const target = await Article.findOne({slug}).exec();

    if (article.title) {
        target.title = article.title;
    }
    if (article.description) {
        target.description = article.description;
    }
    if (article.body) {
        target.body = article.body;
    }
    if (article.tagList) {
        target.tagList = article.tagList;
    }

    await target.save();
    return res.status(200).json({
        article: await target.toArticleResponse(loginUser)
    })
};

// Delete article
const deleteArticle = async (req, res) => {
    const {slug} = req.params;

    const loginUser = await User.findById(req.user.id).exec();

    if (!loginUser) {
        return res.status(401).json({
            message: "User is not authorized."
        });
    }

    const article = await Article.findOne({slug}).exec();

    if (!article) {
        return res.status(401).json({
            message: "Article Not Found"
        });
    }

    if (article.author.toString() === loginUser._id.toString()) {
        await Article.deleteOne({slug: slug});
        res.status(200).json({
            message: "Article successfully deleted."
        })
    } else {
        res.status(403).json({
            message: "Only the author can delete the article."
        })
    }
};

const favoriteArticle = async (req, res) => {
    const {slug} = req.params;

    const loginUser = await User.findById(req.user.id).exec();

    if (!loginUser) {
        return res.status(401).json({
            message: "User is not authorized."
        });
    }

    const article = await Article.findOne({slug}).exec();

    if (!article) {
        return res.status(401).json({
            message: "Article Not Found"
        });
    }

    await loginUser.favorite(article._id);

    const updatedArticle = await article.updateFavoriteCount();

    return res.status(200).json({
        article: await updatedArticle.toArticleResponse(loginUser)
    });
};

const unfavoriteArticle = async (req, res) => {
    const {slug} = req.params;

    const loginUser = await User.findById(req.user.id).exec();

    if (!loginUser) {
        return res.status(401).json({
            message: "User is not authorized."
        });
    }

    const article = await Article.findOne({slug}).exec();

    if (!article) {
        return res.status(401).json({
            message: "Article Not Found"
        });
    }

    await loginUser.unfavorite(article._id);

    await article.updateFavoriteCount();

    return res.status(200).json({
        article: await article.toArticleResponse(loginUser)
    });
};

// Get article with slug
const getArticleWithSlug = async (req, res) => {
    const {slug} = req.params;

    const article = await Article.findOne({slug}).exec();

    if (!article) {
        return res.status(401).json({
            message: "Article Not Found"
        });
    }

    return res.status(200).json({
        article: await article.toArticleResponse(false)
    })
};

module.exports = {
    createArticle,
    deleteArticle,
    favoriteArticle,
    unfavoriteArticle,
    getArticleWithSlug,
    updateArticle,
    feedArticles,
    listArticles
};