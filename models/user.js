const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        username: { type: String, required: true },
        password: { type: String, required: true },
        pic: { type: String, required: true },
        admin: { type: Boolean },
        dice: [],
        cards: [],
        cosmetics: [],
        joinDate: { type: Date, required: true },
        likes: { type: Number, required: true },
        friends: [],
        outgoingRequests: [],
        incomingRequests: []
    }
);

//Export model
module.exports = mongoose.model('User', UserSchema);