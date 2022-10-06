const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: { type: String, required: true },
        pic: { type: String, required: true },
        likes: { type: Number, required: true },
        postDate: { type: Date, required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        comments: { type: Array },
    }
);

//Export model
module.exports = mongoose.model('Post', PostSchema);