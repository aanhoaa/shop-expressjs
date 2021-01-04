const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var id = mongoose.Types.ObjectId;

const cateSchema = new Schema ({
    name: {
        type: String,
        required: true
    },
    childCateName: [{
        childName: String,
        id: id
    }],
    description: {
        type: String
    }
});

module.exports = mongoose.model('category', cateSchema);