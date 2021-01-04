const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const importSchema = new Schema({
    supplierId: {
        type: String,
        required: true
    },
    date: {
        type: String
    },
    totalPayment: {
        type: Number
    },
    paymentForm: {
        type: String
    },
    status: {
        type: Number
    },
    amountGoods: {
        type: Number
    },
    details: [{
        inventoryId: String,
        oldPrice: Number,
        priceImport: Number,
        amountImport: Number,
        investment: Number,
        tempMoney: Number
    }]
})

module.exports = mongoose.model('import', importSchema);