const mongoose = require('mongoose');

const { Schema } = mongoose;
const userSchema = new Schema({
    tName: {
        type: String,
        required: true
    },
    tId: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('User', userSchema);