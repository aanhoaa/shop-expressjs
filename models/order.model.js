const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: String, 
        required: true
    },
    cart: {
        type: Object, 
        required: true
    },
    status:{
        type: Number
    },
    statusDelivery: {
        type: Number
    },
    statusToStore:{
        type: Number
    }
},{
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  });

module.exports = mongoose.model('order', orderSchema);