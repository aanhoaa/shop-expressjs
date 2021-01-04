const mongoose = require("mongoose");
const Product = require("./product.model");
const Schema = mongoose.Schema;
//const removeAccent = require("../util/removeAccent");
var id = mongoose.Types.ObjectId;

const inventorySchema = new Schema({
    productId: {
        type: String,
        require: true
    },
    productName: {
        type: String,
        require: true
    },
    sizeId: {
        type: String
    },
    colorId: {
        type: String
    },
    amount: {
        type: Number
    },
    investment: {
        type: Number
    }
});


const Inventory = mongoose.model("inventory", inventorySchema);
module.exports = Inventory;
