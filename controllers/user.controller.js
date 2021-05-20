const db = require('../helpers/db.helper');
var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwtHelper = require("../helpers/jwt.helper"); 


exports.getUserInfo = async (req, res, next) => {
  const data = await db.getUserInfo(2, [req.jwtDecoded.data.username]);
  const userInfo = {
    username: data.username,
    gender: data.gender
  }

  if (data) {
    res.render('auth/user/userInfo', {userInfo: userInfo, user: data, cart: req.session.cart});
  }
  
};

exports.getEditUserInfo = (req, res, next) => {
  res.render('auth/user/editUserInfo', { title: 'Shop', user: req.user, cart: req.session.cart, userOrder: 0});
};

exports.postEditUserInfo = (req, res, next) => {
  var userId = req.body.userId;
  var fullname = req.body.fullname;
  var gender = req.body.gender;
  var phone = req.body.phone;
  var address = req.body.address;

  User.findById(userId, function(err, data) {
    if (err) console.log(err);
    else
    {
        data.fullname = fullname;
        data.gender = gender;
        data.phone = phone;
        data.address = address;

        data.save();
        res.redirect('/user');
    }
  })
};

exports.getDetailOrder = (req, res, next) => {
  const promises = [];
  var orderId = req.params.orderId;
  var oData = [];
  var total = 0;

  promises.push(
    Order.findById(orderId, function(err, data){
          oData.push(
            {
              date: data.createdAt, 
              status: data.status, 
              orderId: data._id,
              address: req.user.address, 
              total: 1,
              cart: data.cart
            })
    })
  )
  
    Promise.all(promises).then(() => 
    res.render('auth/user/detailOrder', { 
      title: 'Shop', 
      user: req.user, 
      cart: req.session.cart, 
      oData: oData,
    })
    );
}