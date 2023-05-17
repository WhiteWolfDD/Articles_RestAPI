const Article = require('../models/articleModel');
const asyncHandler = require('express-async-handler');

const getTags = async (req, res) => {
    // distinct "tagList" will return either an error or a list of distinct tags
    const tags = await Article.find().distinct('tagList').exec();
    // console.log(tags);
    res.status(200).json({
        tags: tags
    });
};

module.exports = {
    getTags
}