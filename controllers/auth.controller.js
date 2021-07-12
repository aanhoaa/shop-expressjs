const passport = require("passport");
const Users = require("../models/user.model");
var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwtHelper = require("../helpers/jwt.helper"); 
const db = require('../helpers/db.helper')
const Validator = require("fastest-validator");
const mailer = require('../helpers/mailer');

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

exports.getLogin = (req, res, next) => {
     const message = req.flash("error")[0];
    if (!req.session.token) {
      res.render("./auth/login", {
        title: "Đăng nhập",
         userInfo: null,
         cart: req.session.cart,
       // cartProduct: cartProduct
      });
    } else {
      res.redirect("/");
    }
  };
  
exports.postLogin = async (req, res, next) => {
  const {username, password} = req.body;
  const data = await db.checkUserExist(2, [username]); 
 
  if (data) {
    const userPass = await db.getUserInfo(2,[username]);
    const checkPass = await bcrypt.compare(password, userPass.password);

    if (checkPass) {
      const userInfo = {
        id: userPass.id,
        username: username,
        role: userPass.role,
        isverified: userPass.isverified,
        gender: userPass.gender
      }

      const accessToken = await jwtHelper.generateToken(userInfo, process.env.SIGNATURETOKEN, '1h');
      req.session.token = accessToken;
      const verify = await db.getUserInfo(2, [username]);

      //session info
      req.session.Userinfo = {
        username: verify.username,
        gender: verify.gender,
        id: verify.id
      }
      //session cart
      const cart = await db.getCart([verify.id]);
      req.session.cart = cart.length;

      if (verify.isverified == 0) {
        return res.send({ state: 0});
      }
      else 
        return res.send({ state: 1});
    } 
    else 
      return res.status(500).send({Lỗi: 'Tài khoản hoặc mật khẩu không chính xác'}); 
  }
  else return res.status(500).json();
};
  
exports.getLogout = (req, res, next) => {
  if (req.session.cart) {
    req.session.cart = null;
  }
  req.session.destroy();
  res.redirect("/");
};
  
  exports.getSignUp = (req, res, next) => {
     var message = req.flash("info");
  
    if (!req.isAuthenticated()) {
      res.render("./auth/register", {
        title: "Đăng ký",
        message: message,
        userInfo: null,
        cart: req.session.cart
      });
    } else {
      res.redirect("/");
    }
  };
  
  exports.postSignUp = async (req, res, next) => {
    const v = new Validator({
      useNewCustomCheckerFunction: true, // using new version
      messages: {
        // Register our new error message text
        unique: "The username is already exist"
    }
    });
    const schema = {
      $$async: true,
      fullname: {type: 'string'},
      username: {
        type: 'string', min: 6, max: 255,
        custom: async (username, errors) => {
          const data = await db.checkUserExist(2, [username]);
          if (data == true) {
            errors.push({ type: "unique", actual: 123 });
          }
          return username;
        }
      },
      email: {type: 'email'},
      password: {type: 'string', min: 6, max: 50},
      repassword: {type: 'string', min: 6, max: 50},
    }

    const check = v.compile(schema);
    const user = {
      fullname: req.body.fullname,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      repassword: req.body.repassword
    }
    const getCheck = await check(user);
    
    if (getCheck == true) {
      //save to db
      //const save = await db.insertUser(Object.values(user));
      if (user.repassword == user.password) {
        // create confirm token email
        const confirmToken = makeid(10);
        const hash = bcrypt.hashSync(user.password, 10);
        const userId = await db.insertUser([user.fullname, user.username, hash, user.email, confirmToken]);
        if (userId)
        {
          //get data
          const userInfo = {
            id: userId,
            username: user.username,
            role: 'user',
            isverified: 0,
            gender: 1
          };

          const accessToken = await jwtHelper.generateToken(userInfo, process.env.SIGNATURETOKEN, '1h');
          req.session.token = accessToken;
          //send mail
          mailer.sendMailVerify(confirmToken, user.email);
          return res.redirect('/verify');
        }
      }
      else {
        req.flash('info', 'Xác nhận mật khẩu không khớp');
        res.redirect('/register');
      }
    }
    else {
      var count = 0;
      getCheck.forEach(i => {
        if (i.actual == 123) {
          count ++;
        }
      })

      if (count > 0) {
        req.flash('info', 'Tài khoản đã tồn tại');
        res.redirect('/register');
      }
      else res.status(500).json({state: 0});
    }
  };
  
exports.getForgotPassword = async (req, res, next) => {
  var message = req.flash("info");
  res.render('auth/forgot-password',{
    title: 'Quên mật khẩu', cart: req.session.cart, 
    userInfo: null, status: null, message: message
  });
}
  
exports.postForgotPassword = async (req, res, next) => {
  var userId = '';
  var email = '';
  const v = new Validator({
    useNewCustomCheckerFunction: true,
    messages: {
      unique: "Tài khoản không tồn tại trong hệ thống"
  }
  });

  const schema = {
    $$async: true,
    username: {type: 'string', 
      custom: async (vUsername, error) => {
        const checkUserDB = await db.getUserInfo(2, [vUsername]);
        if (checkUserDB == false) {
          error.push({ type: "user wrong", actual: 'Tài khoản không tồn tại', state: 0 });
        }
        else {
          userId = checkUserDB.id;
          email = checkUserDB.email;
        }
        return vUsername;
      }
    }
  }
  const check = v.compile(schema);
  const username = {
    username: req.body.username
  }
  const getCheck = await check(username);

  if (getCheck == true) {
    //send email
    const generate = makeid(10);
    const hash = bcrypt.hashSync(generate, 10);

    const update = await db.updateUserPassword([userId, hash]);

    if (update){
      //send mail
      let send = await mailer.sendMailResetPassword(generate, email);
      if (send == true) {
        req.flash('info', 'Đã gửi mật khẩu mới tới email của bạn');
        res.redirect('/forgot-password');
      }
      else res.status(500).json({err: 'Fail'});
    }
  }
  else {
    var count = 0;
    getCheck.forEach(i => {
      if (i.state == 0) {
        count ++;
      }
    })

    if (count > 0) {
      req.flash('info', 'Tài khoản không tồn tại trong hệ thống');
      res.redirect('/forgot-password');
    }
    else res.status(500).json({error: getCheck});
  }
}
  
exports.getVerify = async (req, res, next) => {
  var userInfo = null;
  const decoded = await jwtHelper.verifyToken(req.session.token, process.env.SIGNATURETOKEN);
  const data = await db.getUserInfo(2, [decoded.data.username]);

  if (data.isverified == 1) {
    return res.redirect('/');
  }

  userInfo = {username: decoded.data.username, gender: data.gender};

  res.render('./auth/verify', {userInfo: userInfo,
    cart: req.session.cart});
}
  
exports.postVerify = async (req, res, next) => {
  const verifyCode = req.body.verifyCode;
  //xử lý verify
  const data = await db.getUserInfo(2, [req.jwtDecoded.data.username]);
  if (data) {
    if (verifyCode == data.tokenconfirm) {
      //session info
      req.session.Userinfo = {
        username: data.username,
        gender: data.gender,
        id: data.id
      }
      //change status
      const updateVer = await db.updateUserIsverified(data.id);
      if (updateVer == true) return res.redirect('/');
    }
  }
  
  res.status(500).json({state: 0});
}

exports.postResendVerify = async (req, res, next) => {
  if (req.jwtDecoded == '') {
    return res.status(500).json({state: -1});
  }

  const data = await db.getUserInfo(2, [req.jwtDecoded.data.username]);
  let send = await mailer.sendMailVerify(data.tokenconfirm, data.email);
  
  if (send == true)  res.send({ state: 1});
}

  exports.getChangePassword = (req, res, next) => {
    const message = req.flash("error")[0];
    var cartProduct;
    if (!req.session.cart) {
      cartProduct = null;
    } else {
      var cart = new Cart(req.session.cart);
      cartProduct = cart.generateArray();
    }
    res.render("change-password", {
      title: "Đổi mật khẩu",
      message: `${message}`,
      user: req.user,
      cartProduct: cartProduct
    });
  };
  

exports.isLogin = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
}
  res.redirect("/login");
}

exports.isAuth = async (req, res, next) => {
  // Lấy token được gửi lên từ phía client, thông thường tốt nhất là các bạn nên truyền token vào header
  //const tokenFromClient = req.body.token || req.query.token || get_cookies(req)['Token'];
  const tokenFromClient = req.session.token;
  if (tokenFromClient) {
    // Nếu tồn tại token
    try {
      // Thực hiện giải mã token xem có hợp lệ hay không?
      const decoded = await jwtHelper.verifyToken(tokenFromClient, process.env.SIGNATURETOKEN);
      // Nếu token hợp lệ, lưu thông tin giải mã được vào đối tượng req, dùng cho các xử lý ở phía sau.
      req.jwtDecoded = decoded;
      // Cho phép req đi tiếp sang controller.
      next();
    } catch (error) {
      // Nếu giải mã gặp lỗi: Không đúng, hết hạn...etc:
      // Lưu ý trong dự án thực tế hãy bỏ dòng debug bên dưới, mình để đây để debug lỗi cho các bạn xem thôi
      console.log(error)
      req.session.destroy();
      return res.status(401).json({
        message: 'Unauthorized.',
      });
    }
  } else {
    // Không tìm thấy token trong request
    //console.log(res.headers)
    return res.redirect('/login');
  }
}

exports.isUser = async (req, res, next) => {
  const decoded = req.jwtDecoded
  const isVerified = await db.getUserInfo(2, [decoded.data.username]);
  
  if (decoded.data.role == 'user'){
    if (isVerified.isverified == 0) {
      return res.redirect('/verify');
    }
    else {
      next();
    }
  } 
  else {
    return res.status(401).json({
    message: 'Unauthorized.',
  });
} 
}

exports.isShop = async (req, res, next) => {
  const decoded = req.jwtDecoded

  if (decoded.data.role == 'shop') {
      next();
  }
  else
  return res.redirect('/');
}

exports.isAdmin = async (req, res, next) => {
  const decoded = req.jwtDecoded
  var requestedUrl = req.url;

  if (decoded.data.role == 'admin')
    next();
  else
  return res.redirect('/');
}
 
exports.AdminProduct = async (req, res, next) => {
  const decoded = req.jwtDecoded

  if (decoded.data.role == 'admin')
    next();
  else
  return res.redirect('/');
}

exports.isHomeAdmin = async (req, res, next) => {
  const decoded = req.jwtDecoded

  if (decoded.data.role == 'admin' || decoded.data.role == 'subAdmin')
    next();
  else
  return res.redirect('/');
}

exports.isCategoryAdmin = async (req, res, next) => {
  const decoded = req.jwtDecoded.data;
  const {id, username, role, permit} = decoded;
  if (role == 'admin' || (role == 'subAdmin' && permit.includes(4)))
    next();
  else
  return res.redirect('/admin');
}

exports.checkRole = (childRole) => {
  return (req, res, next) => {
    const decoded = req.jwtDecoded.data; 
    const role = decoded.role;
    const permit = decoded.permit;
  
    var transCode = 0;
    switch (childRole) {
      case 'VIEW PRODUCT':
        transCode = 1;
        break;
      case 'REPORT PRODUCT':
        transCode = 2;
        break;
      case 'APPROVE PRODUCT':
        transCode = 3;
        break;
      case 'CREATE CATEGORY':
        transCode = 4;
        break;
      case 'VIEW CATEGORY':
        transCode = 5;
        break;
      case 'EDIT CATEGORY':
        transCode = 6;
        break;
      case 'VIEW ORDER':
        transCode = 7;
        break;
      case 'CONFIRM ORDER':
        transCode = 8;
        break;
      case 'CONFIRM SUCCESS ORDER':
        transCode = 9;
        break;
      case 'CANCEL ORDER':
        transCode = 10;
        break;
      case 'CREATE EMPLOYEE':
        transCode = 11;
        break;
      case 'VIEW EMPLOYEE':
        transCode = 12;
        break;
      case 'EDIT EMPLOYEE':
        transCode = 13;
        break;
      case 'DELETE EMPLOYEE':
        transCode = 14;
        break;
      case 'CREATE PERMISSTION':
        transCode = 15;
        break;
    }
  
    if (role == 'admin' || (role == 'subAdmin' && permit.includes(transCode)))
      next();
    else
    return res.status(401).json({
      message: 'Unauthorized.',
    });
  }
  //next();
}
