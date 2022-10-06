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
    }
);

//Export model
module.exports = mongoose.model('User', UserSchema);