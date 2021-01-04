var User = require('../models/user.model');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');
var passport = require('passport');
var nodemailer = require('nodemailer');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
      done(null, user._id);
    });
  
    passport.deserializeUser(function(id, done) {
      User.findOne({
        _id: id
      })
        .then(function(user) {
          done(null, user);
        })
        .catch(function(err) {
          console.log(err);
        });
    });
  
    passport.use(
      'local-signin',
      new LocalStrategy({
        usernameField:'email',
        passwordField:'password',
        
      },function(email, password, done) {
        User.findOne({ email: email }, function(err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false, {
              message: 'Tài khoản không tồn tại'
            });
          }
  
          if (user.isLock) {
            return done(null, false, {
              message: 'Tài khoản đã bị khoá.'
            });
          }
  
          bcrypt.compare(password, user.password, function(err, result) {
            if (err) {
              return done(err);
            }
            console.log('acc : ' + user.email + ' ' + user.password + ' ' + password, result);
            if (!result) {
              return done(null, false, {
                message: 'Mật khẩu không chính xác'
              });
            }
            return done(null, user);
          });
        });
      })
    );
  
    passport.use(
      'local-signup',
      new LocalStrategy({ 
          usernameField:'email',
          passwordField:'password',
          passReqToCallback: true }, function(req, email, password, done) {
        User.findOne({ email: email }, function(err, user) {
          if (err) {
            return done(err);
          }
          if (user) {
            return done(null, false, {
              message: 'Địa chỉ email đã tồn tại!'
            });
          }
  
          if (password.length <= 5) {
            return done(null, false, {
              message: 'Mật khẩu phải trên 6 ký tự!'
            });
          }
  
          if (password !== req.body.password_confirmation) {
            return done(null, false, {
              message: 'Hai mật khẩu không khớp!'
            });
          }
          var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (!re.test(String(req.body.email).toLowerCase())) {
            return done(null, false, {
              message: 'Địa chỉ email không hợp lệ!'
            });
          }
          User.findOne({ username: req.body.username }, (err, user) => {
            if (err) {
              return done(err);
            } else if (user) {
              return done(null, false, {
                message: 'Tên đăng nhập đã tồn tại!'
              });
            }
          });
  
          bcrypt.hash(password, 12).then(hashPassword => {
            const newUser = new User({
              email: email,
              password: hashPassword,
              email: req.body.email,
              username: req.body.username,
              gender: req.body.gender,
              phone: req.body.phone,
              address: req.body.address,
              fullname: req.body.fullname
            });
            // save the user
            newUser.save(function(err) {
              if (err) return done(err);
              return done(null, newUser);
            });
          });
        });
      })
    );
  };