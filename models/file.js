const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
    name: String,
    date: Date,
    size: Number,
    format: String
});

module.exports = mongoose.model('File', fileSchema);