const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const suppSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    area: {
        type: String,
        required: true
    },
    website: {
        type: String
    },
    employee: {
        type: String
    },
    description: {
        type: String
    }
});

module.exports = mongoose.model('supplier', suppSchema);