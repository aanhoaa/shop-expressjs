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

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth.route');
var adminRouter = require('./routes/admin.route');
var shopRouter = require('./routes/shop.route');

/* add database root */
//const addCate = require('./util/addCategory');
//const addMate = require('./util/addMaterial');
//const addBrand = require('./util/addBrand');

var app = express();
 const MongoDBStore = require('connect-mongodb-session')(session);

const urlConnect = process.env.DB;
// Connect to database
mongoose.connect(urlConnect, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
  if (err) {
    console.log("Fail to connect db");
  }
  console.log('Connect successfullyy!!');
});

// pass passport for configuration
require('./config/passport')(passport);

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

app.use(indexRouter);
app.use(authRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/shop', shopRouter);

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