const mongoose = require('mongoose');
const Joi = require('joi');


const commentSchema = mongoose.Schema({

    username: { type: String, unique: true, required: true, minlength: 5, maxlength: 50 },
    text: { type: String, required: true, minlength: 3, maxlength:1000 },
    postId: { type: String, required: true},
    dateAdded: { type: Date, default: Date.now },

})

const Comment = mongoose.model('comment', commentSchema);
function validateComment(comment) {
    const Schema = Joi.object({
        username: Joi.string().min(5).max(100).required(),
        text: Joi.String().min(3).max(1000).required(),
        postId: Joi.String().required(),
    });
    return Schema.validate(comment);
}


module.exports = {
    Comment: Comment,
    validateComment: validateComment
}