const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DieSchema = new Schema(
    {
        pip: { type: String, required: true },
        inlay: { type: String, required: true },
        base: { type: String, required: true },
        shine: { type: Boolean, required: true },
        pipped: { type: Boolean, required: true }
    }
);

//Export model
module.exports = mongoose.model('Die', DieSchema);