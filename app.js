require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const paypal = require('paypal-rest-sdk');
var methodOverride = require('method-override');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users.route');
var authRouter = require('./routes/auth.route');
var sellerRouter = require('./routes/seller.route');
var shopRouter = require('./routes/shop.route');
var adminRouter = require('./routes/admin.route');

/* add database root */
//const addCate = require('./util/addCategory');
//const addMate = require('./util/addMaterial');
//const addBrand = require('./util/addBrand');

var app = express();
const MongoDBStore = require('connect-mongodb-session')(session);

const urlConnect = process.env.DB;
// Connect to database
// mongoose.connect(urlConnect, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
//   if (err) {
//     console.log("Fail to connect db");
//   }
//   console.log('Connect successfullyy!!');
// });

// pass passport for configuration
require('./config/passport')(passport);
app.use(methodOverride('_method'));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

require('./config/passport')(passport);

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'anonymous',
    saveUninitialized: true,
    resave: false,
    store: new MongoDBStore({ uri: process.env.DB, collection: 'sessions' }),
    cookie: { maxAge: 180 * 60 * 1000 }
  })
);

app.use(flash());
// app.use(function(req, res, next){
// 	res.locals.success_msg = req.flash('success_msg')[0];
// 	res.locals.error_msg = req.flash('error_msg')[0];
// 	res.locals.error = req.flash('error')[0];
// 	next();
// });

app.use(passport.initialize());
app.use(passport.session());

paypal.configure({
  'mode': 'sandbox',
  'client_id': 'Af0xyWkdEZASWUXHVjwfN4huuG3r0We9C51-M6VCbksFwkfpSdVSwQ5fi8AujX1wes8jCRWZqV__g5a3',
  'client_secret': 'EHT0qpU8-s-41oIQovicW5VbOC717NCsa6NJHcqokP5Ju_NGlhZbwcSfF8AP9jUzj2Lv5AuIkN_4hG-z'
});

app.use(indexRouter);
app.use(authRouter);
app.use(shopRouter);
app.use('/user', usersRouter);
app.use('/seller', sellerRouter);
app.use('/admin', adminRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
//pass
//oycBwM0eXwdnIInP