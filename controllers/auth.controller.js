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
        
        const accessToken = await jwtHelper.generateToken(userInfo, 'secret', '1h');

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
           res.send({ state: 0});
        }
        else 
         res.send({ state: 1});
      } 
      res.status(500).send({Lỗi: 'Tài khoản hoặc mật khẩu không chính xác'}); 
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

          const accessToken = await jwtHelper.generateToken(userInfo, 'secret', '1h');
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
  const decoded = await jwtHelper.verifyToken(req.session.token, 'secret');

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
  
  exports.postChangePassword = (req, res, next) => {
    bcrypt.compare(req.body.oldpass, req.user.password, function(err, result) {
      console.log("alo?");
      if (!result) {
        req.flash("error", "Mật khẩu cũ không đúng!");
        return res.redirect("back");
      } else if (req.body.newpass != req.body.newpass2) {
        console.log(req.body.newpass);
        console.log(req.body.newpass2);
        req.flash("error", "Nhập lại mật khẩu không khớp!");
        return res.redirect("back");
      } else {
        bcrypt.hash(req.body.newpass, 12).then(hashPassword => {
          req.user.password = hashPassword;
          req.user.save();
        });
        req.flash("success", "Đổi mật khẩu thành công!");
        res.redirect("/account");
      }
    });
  };

  exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.role != 0) {
        return next();
      }
  }
    res.redirect("/login");
  }

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
        const decoded = await jwtHelper.verifyToken(tokenFromClient, 'secret');
        
        // Nếu token hợp lệ, lưu thông tin giải mã được vào đối tượng req, dùng cho các xử lý ở phía sau.
        req.jwtDecoded = decoded;
        // Cho phép req đi tiếp sang controller.
        next();
      } catch (error) {
        // Nếu giải mã gặp lỗi: Không đúng, hết hạn...etc:
        // Lưu ý trong dự án thực tế hãy bỏ dòng debug bên dưới, mình để đây để debug lỗi cho các bạn xem thôi
        
        return res.status(401).json({
          message: 'Unauthorized.',
        });
      }
    } else {
      // Không tìm thấy token trong request
      console.log(res.headers)
      return res.redirect('/login');
    }
  }

  exports.isUser = async (req, res, next) => {
    const decoded = await jwtHelper.verifyToken(req.session.token, 'secret');
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
  const decoded = await jwtHelper.verifyToken(req.session.token, 'secret');

  if (decoded.data.role == 'shop') {
      next();
  }
  else
  return res.redirect('/');
}

exports.isAdmin = async (req, res, next) => {
  const decoded = await jwtHelper.verifyToken(req.session.token, 'secret');

  if (decoded.data.role == 'admin')
    next();
  else
  return res.redirect('/');
}
