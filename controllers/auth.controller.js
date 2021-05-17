const passport = require("passport");
const Users = require("../models/user.model");
var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwtHelper = require("../helpers/jwt.helper"); 
const db = require('../helpers/db.helper')

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
    // var cartProduct;
    // if (!req.session.cart) {
    //   cartProduct = null;
    // } else {
    //   var cart = new Cart(req.session.cart);
    //   cartProduct = cart.generateArray();
    // }
     const message = req.flash("error")[0];
    if (!get_cookies(req)['Token']) {
      res.render("./auth/login", {
        title: "Đăng nhập",
        //message: `${message}`,
         user: req.user,
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
          role: userPass.role
        }
        const accessToken = await jwtHelper.generateToken(userInfo, 'secret', '1h');

        res.cookie('Token',accessToken, { maxAge: 90000000, httpOnly: true });
        // res.headers(123);
        return res.status(200).json({accessToken});
      }
    }

    return res.status(500).json();
  };
  
  exports.getLogout = (req, res, next) => {
    if (req.session.cart) {
      req.session.cart = null;
    }
    req.logout();
    res.clearCookie('Token');
    res.redirect("/");
  };
  
  exports.getSignUp = (req, res, next) => {
     var message = req.flash("error");
    // var cartProduct;
    // if (!req.session.cart) {
    //   cartProduct = null;
    // } else {
    //   var cart = new Cart(req.session.cart);
    //   cartProduct = cart.generateArray();
    // }
  
    if (!req.isAuthenticated()) {
      res.render("./auth/register", {
        title: "Đăng ký",
        message: message,
        user: req.user,
        cart: req.session.cart
      });
    } else {
      res.redirect("/");
    }
  };
  
  exports.postSignUp = (req, res, next) => {
    passport.authenticate("local-signup", {
      successReturnToOrRedirect: "/login",
      failureRedirect: "/register",
      failureFlash: true
    })(req, res, next);
  };
  
  exports.getForgotPass = (req, res, next) => {
    console.log(req.session.status)

    var status = req.session.status;

    if (req.session.sendMail === 1)
    {
      req.session.sendMail = 0;
    }
    else
    {
      status = '';
    }

    const message = req.flash("error")[0];
    var cartProduct;
    if (!req.session.cart) {
      cartProduct = null;
    } else {
      var cart = new Cart(req.session.cart);
      cartProduct = cart.generateArray();
    }
    res.render("./auth/forgot-password", {
      title: "Quên mật khẩu",
      message: `${message}`,
      user: req.user,
      cart: req.session.cart,
      status: status
    });
  };
  
  exports.postForgotPass = (req, res, next) => {
    const email = req.body.email;
    
    Users.findOne({ email: email }, (err, user) => {
      if (!user) {
        req.flash("error", "Email không hợp lệ");
        return res.redirect("/forgot-password");
      } else {
        var transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "johndoestv4@gmail.com",
            pass: "19903005"
          }
        });
        var tpass = makeid(7);
        var mainOptions = {
          from: "perlC SHOP",
          to: email,
          subject: "Reset password",
          text: "text ne",
          html: "<p>Mật khẩu mới của bạn là:</p>" + tpass
        };
        transporter.sendMail(mainOptions, (err, info) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Sent:" + info.response);
          }
        });
        bcrypt.hash(tpass, 12).then(hashPassword => {
          
          user.password = hashPassword;
          user.save();
        });
        req.session.status = 'Đã gửi password vào email của bạn';
        req.session.sendMail = 1;
        res.redirect("/forgot-password");
      }
    });
  };
  
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
    const tokenFromClient = req.body.token || req.query.token || get_cookies(req)['Token'];
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
      return res.redirect('/login');
    }
  }

  exports.isUser = async (req, res, next) => {
    const decoded = await jwtHelper.verifyToken(get_cookies(req)['Token'], 'secret');
    
    if (decoded.data.role == 'user')
      next();
      else
      {
        return res.status(401).json({
        message: 'Unauthorized.',
      });
    }
  }

exports.isShop = async (req, res, next) => {
  const decoded = await jwtHelper.verifyToken(get_cookies(req)['Token'], 'secret');

  if (decoded.data.role == 'shop')
    next();
  else
  return res.redirect('/');
}

exports.isAdmin = async (req, res, next) => {
  const decoded = await jwtHelper.verifyToken(get_cookies(req)['Token'], 'secret');

  if (decoded.data.role == 'admin')
    next();
  else
  return res.redirect('/');
}

var get_cookies = function(request) {
  var cookies = {};
  request.headers && request.headers.cookie.split(';').forEach(function(cookie) {
    var parts = cookie.match(/(.*?)=(.*)$/)
    cookies[ parts[1].trim() ] = (parts[2] || '').trim();
  });
  return cookies;
};