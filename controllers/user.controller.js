const db = require('../helpers/db.helper');
var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwtHelper = require("../helpers/jwt.helper"); 
const Validator = require("fastest-validator");
const mailer = require('../helpers/mailer');
const fs = require('fs');
const fetch = require('node-fetch');

exports.getUserProfile = async (req, res, next) => {
  const data = await db.getUserInfo(2, [req.jwtDecoded.data.username]); 
  const userInfo = {
    username: data.username,
    gender: data.gender
  }

  const birthday = getdate(data.birthday);
  if (data) {
    res.render('auth/user/user-profile', {
      title: 'Furniture Shop',
      userInfo: userInfo, 
      user: data, 
      birthday: birthday, cart: req.session.cart
    });
  }
};

exports.postUserProfile = async (req, res, next) => {
  const v = new Validator();
  const schema = {
    fullname: {type: 'string'},
    email: {type: 'email'},
    phone: { type: "string", positive: true, integer: true, length: 10},
    gender: {type: "number", numberMin: 0, numberMax: 2, integer: true, length: 1, 
    custom: (v, error) => {
      if (v < 0 || v > 2) errors.push({ type: "gender false" });
      return v;
    }
    },
    birthday: {type: "date"}
  };

  const check = v.compile(schema);
  const userInfo =  { 
    fullname: req.body.fullname,
    email: req.body.email,
    phone: req.body.phone,
    gender: req.body.gender * 1,
    birthday: new Date(req.body.birthday)
  } 

  const getCheck = await check(userInfo);
  if (getCheck == true) {
    //update
    const update = await db.updateUserProfile([
        req.jwtDecoded.data.id, userInfo.fullname, 
        userInfo.email, userInfo.phone, userInfo.gender, userInfo.birthday
    ]);
      
    if (update == true) res.redirect('/user/account/profile');
    else res.status(500).json({state: 0, type: 'Update fail'});
  }
  else return res.status(500).json({state: 0, type: getCheck});
};

exports.getUserAddressBook = async (req, res, next) => {
  const data = await db.getUserInfo(2, [req.jwtDecoded.data.username]);
  const userInfo = {
    username: data.username,
    gender: data.gender
  }

  const addressDB = await db.getUserAddressBook([req.jwtDecoded.data.id]);
  if (data) {
    res.render('auth/user/user-addressBook', {
      title: 'Furniture Shop',
      userInfo: userInfo, 
      user: data, cart: req.session.cart, address: addressDB
    });
  }
};

exports.postUserAddressBook = async (req, res, next) => {
  const v = new Validator();
  const schema = {
    fullname: 'string',
    phone: {type: 'string', length: 10},
    city: 'string',
    district: 'string',
    ward: 'string',
    identity: 'string|min:3|max: 50',
    nameCity: 'string',
    nameDistrict: 'string',
    nameWard: 'string',
  }
  const check = v.compile(schema);
  const address = {
    fullname: req.body.fullname,
    phone: req.body.phone,
    city: req.body.city,
    district: req.body.district,
    ward: req.body.ward,
    identity: req.body.identity,
    nameCity: req.body.nameCity,
    nameDistrict: req.body.nameDistrict,
    nameWard: req.body.nameWard
  }
  const getCheck = await check(address);
  if (getCheck == true) {
    //save db
    //save to identity
    try {
      const exist = await db.getUserAddressBookExist(1, [req.jwtDecoded.data.id]);
      const ident_id = await db.insertUserIdentityDetail([address.identity]);

      if (ident_id) {
        const ward_id = await db.insertUserWard([ident_id, address.ward, address.nameWard]);
        if (ward_id) {
          const district_id = await db.insertUserDistrict([ward_id, address.district, address.nameDistrict]);
          if (district_id) {
            const province_id = await db.insertUserProvince([district_id, address.city, address.nameCity]);
            if (province_id) {
              if (exist == false) {
                const addressBook = await db.insertUserAddressBook([req.jwtDecoded.data.id, province_id, address.fullname, address.phone, 1]);
                if (addressBook == true) res.redirect('/user/account/address');
                else res.status(500).json({state: 0, type: 'Address fail'});
              }
              else {
                const addressBook = await db.insertUserAddressBook([req.jwtDecoded.data.id, province_id, address.fullname, address.phone, 0]);
                if (addressBook == true) res.redirect('/user/account/address');
                else res.status(500).json({state: 0, type: 'Address fail'});
              }
            }
          }
        }
      }
    }
    catch (error) {
      return res.status(500).json({state: 0, type: 'Save fail'});
    }  
  }
  else return res.status(500).json({state: 0, type: getCheck});
};

exports.postUpdateAddressBook = async (req, res, next) => {
  const bookId = req.params.bookId;
  const v = new Validator();
  const schema = {
    fullname: 'string',
    phone: {type: 'string', length: 10},
    city: 'string',
    district: 'string',
    ward: 'string',
    identity: 'string|min:3|max: 50',
    nameCity: 'string',
    nameDistrict: 'string',
    nameWard: 'string',
  }
  const check = v.compile(schema);
  const address = {
    fullname: req.body.fullname,
    phone: req.body.phone,
    city: req.body.city,
    district: req.body.district,
    ward: req.body.ward,
    identity: req.body.identity,
    nameCity: req.body.nameCity,
    nameDistrict: req.body.nameDistrict,
    nameWard: req.body.nameWard
  }
  const getCheck = await check(address);

  if (getCheck == true) {
    try {
      const addressDB = await db.getAddressBookById([bookId]);
      if (addressDB) {
        if (addressDB[0].fullname != address.fullname 
            || addressDB[0].phone != address.phone) {
            //update addressbook
            const updateAB = await db.updateUserAdressBook([addressDB[0].book_id, address.fullname, address.phone]);
        }

        if (addressDB[0].province_code != address.city) {
          //update all
          const updateProvince = await db.updateUserProvince([addressDB[0].province_id, address.city, address.nameCity]);
          const updateDistrict = await db.updateUserDistrict([addressDB[0].district_id, address.district, address.nameDistrict]);
          const updateWard = await db.updateUserWard([addressDB[0].ward_id, address.ward, address.nameWard]);
        }
        else if (addressDB[0].district_code != address.district) {
          //update district
          //update ward
          const updateDistrict = await db.updateUserDistrict([addressDB[0].district_id, address.district, address.nameDistrict]);
          const updateWard = await db.updateUserWard([addressDB[0].ward_id, address.ward, address.nameWard]);
        }
        else  if (addressDB[0].ward_code != address.ward){
          //update ward
          const updateWard = await db.updateUserWard([addressDB[0].ward_id, address.nameWard]);
        }

        if (addressDB[0].identity_name != address.identity) {
          //update identity
          const updateWard = await db.updateUserIdentity([addressDB[0].identity_id, address.identity]);
        }
      }
      else res.status(500).json({state: 0, type: getCheck});
      res.redirect('/user/account/address');
    }
    catch (error) {
      return res.status(500).json({state: 0, type: 'Update fail', err: error});
    }  
  }
}

exports.postDeleteAddressBook = async (req, res, next) => {
  const bookID = req.body.bookID;
  const addressDB = await db.getAddressBookById([bookID]);
  if (addressDB != false) {
    //delte addB
    const deleteAB = await db.deleteUserAddressBook([bookID]);
    const deleteP = await db.deleteUserProvince([addressDB.province_id]);
    const deleteD = await db.deleteUserDistrict([addressDB.district_id]);
    const deleteW = await db.deleteUserWard([addressDB.ward_id]);
    const deleteIdentity = await db.deleteUserIdentityDetail([addressDB.identity_id]);

    if (deleteAB) {
      res.send({ state: 1});
    }
    else res.status(500).json({status: 'delete fail'});
  }
  else res.status(500).json({status: 'delete fail'});
}

exports.postSetAddressDefault = async (req, res, next) => {
  const bookID = req.body.bookID;
  const addressDB = await db.getUserAddressBook([req.jwtDecoded.data.id]);
  
  if (addressDB != false) {
    var count = 0;
    for (let i = 0; i < addressDB.length; i++) {
      if (addressDB[i].isdefault == 1) {
        const setZero = await db.updateUserAddressBookDefault([addressDB[i].book_id, 0]);
        count++;
      }
      else if (addressDB[i].book_id == bookID) {
        //set to 1
        const setOne= await db.updateUserAddressBookDefault([addressDB[i].book_id, 1]);
        count++;
      }
      if (count == 2) {
        res.send({ state: 1});
      }
    }
  }
  res.status(500).json({status: 'Set default fail'});
}

exports.getChangePassword = async (req, res, next) => {
  var message = req.flash("info");
  const data = await db.getUserInfo(2, [req.jwtDecoded.data.username]);
  const userInfo = {
    username: data.username,
    gender: data.gender
  }

  res.render('auth/user/user-changePassword', {
    title: 'Furniture Shop',
    userInfo: userInfo, cart: req.session.cart, message: message
  });
}

exports.postChangePassword = async (req, res, next) => {
  const v = new Validator({
    useNewCustomCheckerFunction: true, // using new version
    messages: {
      unique: "Mật khẩu không chính xác"
  }
  });
  const schema = {
    $$async: true,
    password: {type: 'string', min: 6, 
    custom: async (v, error) => {
      const data = await db.getUserInfo(2, [req.jwtDecoded.data.username]);
      if (data) {
        const checkPass = await bcrypt.compare(v, data.password);
        if (!checkPass) {
            error.push({ type: "password wrong", actual: 'password not true', state: 0 });
        }

        return v;
      }
    }
    },
    newpassword: 'string|min:6',
    confirmpassword: 'string|min:6'
  }

  const check = v.compile(schema);
  const changePassword = {
    password: req.body.password,
    newpassword: req.body.newpassword,
    confirmpassword: req.body.confirmpassword
  }

  const getCheck = await check(changePassword);
  if (getCheck == true) {
    if (changePassword.newpassword != changePassword.confirmpassword) {
      return res.status(500).json({error: 'Xác nhận mật khẩu sai'});
    }

    //update db
    const hash = bcrypt.hashSync(changePassword.newpassword, 10);
    const update = await db.updateUserPassword([req.jwtDecoded.data.id, hash]);

    if (update) res.redirect('/user/account/profile');
    else res.status(500).json({state: 0, type: 'Change password fail'});

  }
  else {
    var count = 0;
      getCheck.forEach(i => {
        if (i.state == 0) {
          count ++;
        }
      })

      if (count > 0) {
        req.flash('info', 'Mật khẩu không chính xác');
        res.redirect('/user/account/password');
      }
      else res.status(500).json({error: getCheck});
  }
}

exports.postReset = async (req, res, next) => {
  const data = await db.getUserInfo(2, [req.jwtDecoded.data.username]);
    const generate = makeid(10);
    const hash = bcrypt.hashSync(generate, 10);

    const update = await db.updateUserPassword([req.jwtDecoded.data.id, hash]);

    if (update){
      //send mail
      let send = await mailer.sendMailResetPassword(generate, data.email);
      if (send == true)  res.send({ state: 1});
      else res.status(500).json({err: 'Fail'});
    }
}

exports.getPurchase = async (req, res, next) => {
  const data = await db.getUserInfo(2, [req.jwtDecoded.data.username]);
  const userInfo = {
    username: data.username,
    gender: data.gender
  }

  if (data) {
    res.render('auth/user/user-purchase', {
      title: 'Furniture Shop',
      userInfo: userInfo, user: data, 
      cart: req.session.cart
    });
  }
}

exports.getWaitingConfirm = async (req, res, next) => {
  const data = await db.getUserInfo(2, [req.jwtDecoded.data.username]);
  const userInfo = req.session.Userinfo;

  var orderStatus = ['CHỜ XÁC NHẬN', 'CHUẨN BỊ HÀNG', 'ĐANG GIAO', 'ĐÃ GIAO', 'ĐÃ HỦY'];
  var type = req.query.type;
  switch(type) {
    case 'confirm':
        type = 0;
        break;
    case 'prepare':
        type = 1;
        break;
    case 'delivery':
        type = 2;
        break;
    case 'delivered':
        type = 3;
        break;
    case 'cancel':
        type = -1;
        break;
    default:
        type = 5;
}

  const arrData = await db.getUserPurchaseWaiting([userInfo.id]);
  const all = [];
 if (arrData) {
  arrData.map(item => {
    if (item.status == type || type == 5) {
      const shop_id = item.shop_id;
      const pdv_id = item.pdv_id;
      const order_id = item.order_id;
      if (all.findIndex(x => x.orderId == order_id) < 0){
        all.push({
          orderId: order_id,
          shopId: shop_id,
          ship: item.ship,
          shopName: item.shop_name,
          status: item.status,
          products: []
        })
      }
      const index = all.findIndex(x => x.orderId == order_id);
      if(all[index].products.findIndex(x => x.pdv_id == pdv_id) < 0){
        var getVariant = item.variant.split(' ');

        if (getVariant[0] == 'null') {
          if (getVariant[1] == 'null') {
            getVariant = '';
          }
          else getVariant.splice(0,1);
        }
        else {
          if (getVariant[1] == 'null') {
            getVariant.splice(1,1);
          }
        }
        all[index].products.push({
          pdv_id: pdv_id,
          name: item.name,
          amount: item.amount,
          price: item.price,
          variant: getVariant,
          cover: item.cover,
          rating: item.rating,
          p_id: item.p_id,
          userRating: item.user_rating,
          ratingId: item.user_rating_id
        })
      }
    }
  })
 }

  if (data) {
    res.render('auth/user/user-purchase', {
      title: 'Furniture Shop',
      userInfo: userInfo, user: data, 
      cart: req.session.cart,
      data: all,
      type: type,
      orderStatus: orderStatus
    });
  }
}

exports.putOrderCancel = async (req, res, next) => {
  const {orderId, cancelReason} = req.body;
  const dateFormat = require('dateformat');
  //var total = 0;

  if (orderId == '' || cancelReason == '')
    return res.send({state: -1});

  // const orderInfo = await db.getOrderDetailByOrderId([orderId]);
  // for(let i of orderInfo) {
  //   total += i.amount*i.price;
  // }
  // total += orderInfo[0].shippingfree;
  // total = 100000;
  
  //update status => -1
  const update = await db.updateOrderReason([-1, cancelReason, orderId]);
  if (update != true) return res.send({state: 0});

  const getPdvId = await db.getOrderDetailByOrderId([orderId]);
  for (item of getPdvId) {
    const updateStock = await db.updateProductVariantAmountAuto([item.amount, item.pdv_id]);
  }

  // var date = new Date();
  // var createDate = dateFormat(date, 'yyyymmddHHmmss');
  // var ipAddr = req.headers['x-forwarded-for'] ||
  // req.connection.remoteAddress ||
  // req.socket.remoteAddress ||
  // req.connection.socket.remoteAddress;

  // var tmnCode = 'BVMA539M' // .ev
  // var secretKey = 'IMMMADFCPUJPCCJYIHWVHKMGWAQULKTJ' //.ev
  // var vnpUrl = 'http://sandbox.vnpayment.vn/merchant_webapi/merchant.html' //.ev
  // var vnp_Params = {};
  // vnp_Params['vnp_Version'] = '2.0.0';
  // vnp_Params['vnp_Command'] = 'refund';
  // vnp_Params['vnp_TmnCode'] = tmnCode;
  // vnp_Params['vnp_TransactionType'] = '3';
  // vnp_Params['vnp_TxnRef'] = makeid(10);
  // vnp_Params['vnp_Amount'] = total;
  // vnp_Params['vnp_OrderInfo'] = "Hủy bỏ đơn hàng";
  // vnp_Params['vnp_TransDate'] = createDate;
  // vnp_Params['vnp_CreateDate'] = createDate;
  // vnp_Params['vnp_IpAddr'] = ipAddr;
  // vnp_Params = sortObject(vnp_Params);
  // var querystring = require('qs');
  // var signData = secretKey + querystring.stringify(vnp_Params, { encode: false });

  // var sha256 = require('sha256');

  // var secureHash = sha256(signData);

  // vnp_Params['vnp_SecureHashType'] =  'SHA256';
  // vnp_Params['vnp_SecureHash'] = secureHash;
  // vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: true });

  res.send({state: 1, data: vnpUrl});
}

exports.getOrderDetail = async (req, res, next) => {
  const data = await db.getUserInfo(2, [req.jwtDecoded.data.username]);
  const userInfo = {
    username: data.username,
    gender: data.gender
  }
  const orderId = req.params.orderId;
  const address = await db.getOrderAddressById([orderId]);
  const products = await db.getOrderDetailByOrderId([orderId])
  const orderInfo = await db.getOrderById([orderId]);
    
    res.render('./auth/user/user-order', {
      info: orderInfo, address: address, products: products,
      userInfo: userInfo, user: data, 
      cart: req.session.cart,
    });
}

exports.putUserRating = async (req, res, next) => {
  const {rating, r_id} = req.body;
  if (rating == '' || r_id == '') return res.send({state: 0});

  const update = await db.updateUserRating([rating, r_id]);
  if (update == true) return res.send({state: 1});
  else res.send({state: -1});
}

exports.getProductRecent = async (req, res, next) => {
  var arrProduct = [];
  if (req.session.recent) {
    for (let item of req.session.recent) {
      const data = await db.getFirstProductById([item]);
      arrProduct.push(data[0]);
    }
  }
  

  res.render('auth/user/user-recent',{
    userInfo: req.session.Userinfo,
    cart: req.session.cart,
    data: arrProduct
  });
}

//functional
function getdate(tt) {
  var date = new Date(tt);
  var newdate = new Date(date);
  
  var dd = newdate.getDate();
  var mm = newdate.getMonth() + 1;
  var y = newdate.getFullYear();

 
  var someFormattedDate = mm + '/' + dd + '/' + y;
  return someFormattedDate;
}

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function sortObject(o) {
  var sorted = {},
      key, a = [];

  for (key in o) {
      if (o.hasOwnProperty(key)) {
          a.push(key);
      }
  }

  a.sort();

  for (key = 0; key < a.length; key++) {
      sorted[a[key]] = o[a[key]];
  }
  return sorted;
}