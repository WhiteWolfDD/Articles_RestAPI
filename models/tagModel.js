const mongoose = require('mongoose');
const {Schema} = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');

const Tag = mongoose.model('tags', new Schema({
    tagName: {
        type: String,
        required: [true, "Tag name is required"],
        unique: true
    },
    articles: [{
        type: Schema.Types.ObjectId,
        ref: 'articles'
    }]
}));

Tag.schema.set('versionKey', false);

Tag.schema.plugin(uniqueValidator);

module.exports = Tag;