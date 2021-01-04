const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
      username: {
        type: String,
        required: false
      },
      gender: {
        type: String
      },
      password: {
        type: String,
        required: true
      },
      fullname: {
        type: String,
        required: false
      },
      email: {
        type: String,
        required: false
      },
      address: {
        type: String,
        required: false
      },
      phone: {
        type: String,
        required: false
      },
      role: {
        type: Number,
        required: false,
        default: 0
      },
      isAuthenticated: {
        type: Boolean,
        required: false,
        default: false
      },
      isLock: {
        type: Boolean,
        required: false,
        default: false
      },
      verify_token: {
        type: String,
        required: false
      },
      cart: {
        type: Object,
        required: false
      },
      numberVoucher: {
          type:Number
      }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
})

module.exports = mongoose.model('user', userSchema);