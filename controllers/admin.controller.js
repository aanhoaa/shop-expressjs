const passport = require("passport");
const multer = require('multer');
const db = require('../helpers/db.helper');
const cloudinary = require('cloudinary');
var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwtHelper = require("../helpers/jwt.helper"); 


exports.getLogin = (req, res, next) => {
  if (req.session.token) 
  res.redirect('/admin');
  else
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

        //res.cookie('Token', accessToken, { maxAge: 1900000, httpOnly: true });
        
        //use session
        req.session.token = accessToken;


        return res.status(200).json({accessToken});
      }
    }

    return res.status(500).json();
}

exports.getLogout = (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
}

exports.getHome = async (req, res, next) => {
    const data = await db.getProduct();
    var oData = new Array;

    for(let i = 0; i< data.length; i++) {
        var info = await db.getProductVariantInfo([data[i].id]);

        var violate = '';
        if (data[i].status == -1) {
            violate = await db.getProductViolate([data[i].id]);
        }

        if (violate != '') {
            var time = violate[0].updated_at.toString();
            var pTimeUpdate = data[i].updated_at.toString();
            var pVioStatus = fn_DateCompare(time, pTimeUpdate);

            oData.push(
                {
                    name: data[i].name, sku: data[i].sku, 
                    update: pTimeUpdate, classify: info, 
                    id: data[i].id, status: data[i].status,
                    vname: violate[0].name, vreason: violate[0].reason, 
                    vstatus: pVioStatus,
                    vsuggestion: violate[0].suggestion, vtime: getdate(time)
                }
            )
        }
        else {
            oData.push({
                name: data[i].name, sku: data[i].sku, 
                classify: info, id: data[i].id, 
                status: data[i].status
              })
        }
    }

   res.render('./adminSys/index', {data: oData})
}

exports.getViewProduct = async (req, res, next) => {
  var productId = req.params.productId;
    var oData = new Array;
    var arrSize = [];
    var arrColor = [];
    var strSize = '';
    var strColor= '';

    const data = await db.getProductVariantInfo([productId]);
    const productInfo = await db.getProductById([productId]);
    const cate1 = await db.getCategoryLevelOne();
    const cate2 = await db.getCategoryLevelTwo([productInfo[0].categorylevel1_id])
    const img = await db.getImages([productId]);
    
    data.forEach(item => {
        oData.push(item.attribute);
    })

    oData.forEach(i => {
        if (i.Size != undefined)
          arrSize.push(i.Size);
        if (i.Color != undefined)
          arrColor.push(i.Color);
    })
    
    arrColor = [...new Set(arrColor)];
    arrSize = [...new Set(arrSize)];

    arrSize.forEach(i => {
        strSize += i + ',';
    })

    arrColor.forEach(i => {
        strColor += i + ',';
    })
    
    var arrImgSub = [img[0].url.sub1,img[0].url.sub2,img[0].url.sub3];

    const violateType = await db.getViolateType();
    
    res.render('./adminSys/product/viewProduct', {
        name: productInfo[0].name,
        id: productInfo[0].id,
        status: productInfo[0].status,
        category1: cate1,
        category2: cate2,
        cate1: productInfo[0].categorylevel1_id,
        cate2: productInfo[0].categorylevel2_id,
        sku: productInfo[0].sku,
        size: strSize, 
        color: strColor,
        imgCover: img[0].url.cover,
        imgSub: arrImgSub,
        violate: violateType
    }); 
}

exports.postViewProduct = async (req, res, next) => {
  const productId = req.params.productId;
  const {violateType, violateReason, violateSuggest} = req.body;

  //check before save
  if (violateType == '' || violateReason == '' || violateSuggest == '') {
    return res.status(500).json();
  }

  //check in db
  const check = await db.checkProductViolateExist([productId]);

  if (check == true) {
    //had db before => delete
    const dataProductviolate = await db.getProductViolate([productId]);
    const violateinfo_id =  dataProductviolate[0].violateinfo_id;
    const violatetype_id = dataProductviolate[0].violatetype_id;
    //delete productviolate
    const dPViolate = await db.deleteProductViolate([productId]);
    //delete violateinfo
    const dVInfo = await db.deleteViolateInfo([violateinfo_id]);
    //delete violatetype
    const dVType = await db.deleteViolateType([violatetype_id]);
  }

  //not in db before => save
  const saveInfo = await db.insertViolataInfo([violateReason, violateSuggest]);
  if (saveInfo) {
    const savePDV = await db.insertProductViolate([productId, saveInfo, violateType]);
    if (savePDV == true) {
      var updateDB = await db.updateProductStatus([-1, productId]);
      if (updateDB == true) res.redirect('/admin');
      else res.status(500).json();
    }
    else res.status(500).json();
  }
  else res.status(500).json();
}      

exports.getCategory = (req, res, next) => {

  res.render('./admin/category/category');
}

exports.getAddCategory = async (req, res, next) => {
  const data = await db.getCategoryLevelOne();

  if (data) res.render('./admin/category/addCategory', {data: data});
  else res.status(500).json({status: 'load category fail'});
}

exports.postAddCategory = async (req, res, next) => {
  const {level, name, id, des} = req.body;

  if (name == '')
    return res.status(500).json({status: 'data null'});

  if (level == 1) {
    //category level 1
    const data = await db.insertCategoryLevelOne([name, des]);

    if (data.status == 0) {
      return res.send({ state: 0 });
    }

    if (data == false) {
      return res.status(500).json({status: 'data null'});
    }

    return res.send({ state: 1});
  }
  else if (level == 2) {
  //category level 2
    const data = await db.insertCategoryLevelTwo([id, name, des]);

    if (data.status == 0) {
      return res.send({ state: 0 });
    }

    if (data == false) {
      return res.status(500).json({status: 'data null'});
    }

    return res.send({ state: 1});

  }
}

exports.postEditStatusProduct = async (req, res, next) => {
  const productId = req.body.productId;

  const data = await db.updateProductStatus([0, productId]);

  if (data == true) res.send({ state: 1 });
  else res.send({ state: 0 });
}




function getdate(tt) {
  var date = new Date(tt);
  var newdate = new Date(date);

  newdate.setDate(newdate.getDate() + 3);
  
  var dd = newdate.getDate();
  var mm = newdate.getMonth() + 1;
  var y = newdate.getFullYear();
  var hour = date.getHours();
  var minutes = date.getMinutes();
 
  var someFormattedDate = dd + '/' + mm + '/' + y + ' ' + hour + 'h' + minutes + 'm';
  return someFormattedDate;
}

function fn_DateCompare(DateA, DateB) {     // this function is good for dates > 01/01/1970

  var a = new Date(DateA);
  var b = new Date(DateB);

  var msDateA = a.getTime();
  var msDateB = b.getTime();

  if (parseFloat(msDateA) < parseFloat(msDateB))
    return -1;  // lt
  else if (parseFloat(msDateA) == parseFloat(msDateB))
    return 0;  // eq
  else if (parseFloat(msDateA) > parseFloat(msDateB))
    return 1;  // gt
  else
    return null;  // error
}