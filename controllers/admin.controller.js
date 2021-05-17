const passport = require("passport");
const multer = require('multer');
const db = require('../helpers/db.helper');
const cloudinary = require('cloudinary');
var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwtHelper = require("../helpers/jwt.helper"); 


exports.getLogin = (req, res, next) => {
   res.render('adminSys/login/login');
}

exports.postLogin = async (req, res, next) => {
    const {username, password} = req.body;
   
    const data = await db.checkUserExist(1, [username]); 
    if (data) {
      const userPass = await db.getUserInfo(1,[username]);
      const checkPass = await bcrypt.compare(password, userPass.password);
      
      if (checkPass) {
        const userInfo = {
          id: userPass.id,
          username: username,
          role: userPass.role
        }
        const accessToken = await jwtHelper.generateToken(userInfo, 'secret', '1h');

        res.cookie('Token',accessToken, { maxAge: 1900000, httpOnly: true });
        // res.headers(123);
        return res.status(200).json({accessToken});
      }
    }

    return res.status(500).json();
}

exports.getHome = async (req, res, next) => {
    // const shopId = req.jwtDecoded.data.id;
    // var oData = new Array;
    // const data = await db.getProductByShop([shopId]);
    
    // for(let i = 0; i< data.length; i++) {
    //     var info = await db.getProductVariantInfo([data[i].id])
       
    //     oData.push({name: data[i].name, sku: data[i].sku, classify: info, id: data[i].id, status: data[i].status})
    // }
    
    // //console.log('data', oData)
    // res.render('./admin/index', {data: oData})
    console.log(1)
}

