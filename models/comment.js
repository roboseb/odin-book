const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
    {
        comment: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: { type: String, required: true },
        pic: { type: String, required: true },
        likes: { type: Number, required: true },
        postDate: { type: Date, required: true },
        post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
    }
);

//Export model
module.exports = mongoose.model('Comment', CommentSchema);