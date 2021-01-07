const User = require("../models/user.model");
const Order = require("../models/order.model");

exports.getUserInfo = (req, res, next) => {
const promises = [];
var oData = [];
var total = 0;
promises.push(
    Order.find().then((data) => {
      data.forEach((order) => {
        total = 0;
        if (order.user == req.user._id)
        {
          order.cart.forEach((item) => {
            total = parseInt(total, 10) + parseInt(item.price, 10) * parseInt(item.amount, 10);
          })

          oData.push(
            {
              date: order.createdAt, 
              status: order.status, 
              orderId: order._id,
              address: req.user.address, 
              total: total
            })
        
        }
      })
    })
    )
    Promise.all(promises).then(() => 
    
    res.render('auth/user/userInfo', { 
      title: 'Shop', 
      user: req.user, 
      cart: req.session.cart, 
      oData: oData,
    })
    );
    
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