const passport = require("passport");
const Users = require("../models/user.model");
var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

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
    if (!req.isAuthenticated()) {
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
  
  exports.postLogin = (req, res, next) => {
    passport.authenticate("local-signin", function(error, user, info) {
      if (error) {
        return res.status(500).json(error);
      }
      if (!user) {
        return res.status(401).json(info.message);
      }
      req.login(user, function (err) {
        if (err) {
          return res.status(500).json(error);
        } else {
          return res.status(200).json(user);
        }
      });
    })(req, res, next);
  };
  
  exports.getLogout = (req, res, next) => {
    if (req.session.cart) {
      req.session.cart = null;
    }
    req.logout();
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