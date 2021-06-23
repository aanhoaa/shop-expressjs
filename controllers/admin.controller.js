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
        const accessToken = await jwtHelper.generateToken(userInfo, process.env.SIGNATURETOKEN, '1h');
        //use session
        req.session.token = accessToken;

        return res.status(200).json({accessToken});
      }
    }

    return res.status(500).json();
}

exports.getLogout = (req, res, next) => {
  if (req.session.token) {
    req.session.destroy();
    res.redirect('/');
  }
  else res.redirect('/');
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

exports.getCategory = async (req, res, next) => {
  var target = req.query.target;

  if (target) {
    var data = await db.getCategoryLevelTwo([target]);
    if (data == false) {
      target = 0;
    }
    if (data == -1) {
      target = -1;
    }
  }
  else 
    {
      var data = await db.getCategoryLevelOneAll();
      target = -2;
    }
  
  if (target == -1) var data = await db.getCategoryLevelOneAll();
  res.render('./admin/category/category', {data: data, type: target}); 
}

exports.getAddCategory = async (req, res, next) => {
  const data = await db.getCategoryLevelOneAll();

  if (data) res.render('./admin/category/addCategory', {data: data});
  else res.status(500).json({status: 'load category fail'});
}

exports.postAddCategory = async (req, res, next) => {
  const {level, name, id, des} = req.body;
  console.log('level:' +level +'name:'+name+ 'id:'+ id+ 'des:'+des)
  // if (name == '')
  //   return res.status(500).json({status: 'data null'});

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

exports.putEditNameCategory = async (req, res, next) => {
  const {cate_id, cate_name, cate_des, cate_type} = req.body;

  if (cate_name == '' || cate_id == '') res.status(500).json({staus: 'Dữ liệu trống'});
  const update = await db.updateCategorylevel1(cate_type, [cate_id, cate_name, cate_des]);

  if (update == true) return res.redirect('/admin/category');
  else res.status(500).json({staus: 'Lỗi hệ thống'});
}

exports.postEditStatusProduct = async (req, res, next) => {
  const productId = req.body.productId;

  const data = await db.updateProductStatus([0, productId]);

  if (data == true) res.send({ state: 1 });
  else res.send({ state: 0 });
}

exports.getOrder = async (req, res, next) => {
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

  const arrData = await db.getOrderAll();
  var countOrder = 0;
  const all = [];
  arrData.map(item => {
    if (item.status == type || type == 5) {
      const order_id = item.order_id;
      const shop_id = item.shop_id;
      const pdv_id = item.pdv_id;
      if (all.findIndex(x => x.orderId == order_id) < 0){
        countOrder++;
        all.push({
          orderId: order_id,
          shopId: shop_id,
          status: item.status,
          shopName: item.shop_name,
          status: item.status,
          payment: item.payment_id,
          created: formatDate(item.created_at),
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
          fee: item.shippingfee,
        })
      }
    }
  })

  res.render('./adminSys/order/order', {
    data: all,
    type: type,
    count: countOrder
  });
}

exports.getOrderDetail = async (req, res, next) => {
  const orderId = req.params.orderId;
  const address = await db.getOrderAddressById([orderId]);
  const products = await db.getOrderDetailByOrderId([orderId])
  const orderInfo = await db.getOrderById([orderId]);
  const userInfo = await db.getUserByOrder([orderId]);

  res.render('./adminSys/order/orderDetail', {
    info: orderInfo, 
    address: address, 
    products: products,
    userInfo: userInfo
  });
}

exports.putConfirmOrder = async (req, res, next) => {
  const orderId = req.body.orderId;
  if (orderId) {
    const update = await db.updateOrder([1, orderId]);
    if (update == true) return res.send({state: 1});
    else return res.send({state: 0});
  }
  else res.send({state: -1});
}

exports.putCancelOrder = async (req, res, next) => {
  const {orderId, cancelReason} = req.body;

  if (orderId == '' || cancelReason == '')
    return res.send({state: -1});

  //update status => -1
  const update = await db.updateOrderReason([-1, cancelReason, orderId]);
  if (update != true) return res.send({state: 0});

  const getPdvId = await db.getOrderDetailByOrderId([orderId]);
  for (item of getPdvId) {
    const updateStock = await db.updateProductVariantAmountAuto([item.amount, item.pdv_id]);
    console.log(item.amount)
  }

  res.send({state: 1});
}

exports.putDeliveredOrder = async (req, res, next) => {
  const orderId = req.body.orderId;
  if (orderId) {
      const info = await db.getUserAndProductByOrderId([orderId]);
      for(let i of info) {
        const updateSelled = await db.updateProductSelled([i.sum, i.id]); 
      }

      const shop_id = info[0].shop_id;
      const products = await db.getOrderDetailByOrderId([orderId]);
      var total = 0;
      for(let i of products) {
        total += i.amount*i.price;
      }
      total += products[0].shippingfee;
      
      //update wallet
      const addWallet = await db.updateShopWallet(orderId, [total, shop_id]);
      const update = await db.updateOrderAndPaid([3, orderId]);
      
      if (update == true && addWallet == true) {console.log('done') ; return res.send({state: 1});}
      else return res.send({state: 0});
  }
  else res.send({state: -1});
}

exports.getProfileShop = async (req, res, next) => {
  const data = await db.getShop();

  res.render('./adminSys/profile/profile-shop', {data: data});
}

exports.getShopDetail = async (req, res, next) => {
  const shopID = req.params.shopId;
  const data = await db.getShopById([shopID]);
  const address = await db.getShopAddressBook([shopID]);

  res.render('./adminSys/profile/shop-detail', {data: data, address: address[0]});
}

exports.putShopLock = async (req, res, next) => {
  const shopID = req.body.shopId;
  const status = req.body.status;

  if (shopID == '' || status == '') return res.send({state: 0});
  try {
    if (status == 1) {
      var update = await db.updateShopStatus([0, shopID]);
    }
    else var update = await db.updateShopStatus([1, shopID]);

    return res.send({state: 1});
  }
  catch(err) {
    console.log(err);
    return res.send({state: -1});
  }
}

exports.getProfileUser = async (req, res, next) => {
  try {
    const data = await db.getUser(); 
    res.render('./adminSys/profile/profile-user', {data: data});  
  }
  catch (error) {
    console.log(error)
  }
}

exports.deleteUser = async (req, res, next) => {
  const userId = req.body.userId;
  if (userId != '') {
    try {
        const deleteUser = await db.deleteUser([userId]);
        if (deleteUser == true) {
          return res.send({state: 1});
        }
        else res.send({state: 0});
    }
    catch (error) {
      console.log(error)
    }
  }
  else return res.send({state: -1});
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

function formatDate(tt) {
  var date = new Date(tt);
  var MyDate = new Date(date);
  var MyDateString;

  MyDate.setDate(MyDate.getDate());

  MyDateString = ('0' + MyDate.getDate()).slice(-2) + '/' + ('0' + (MyDate.getMonth()+1)).slice(-2) + '/' + MyDate.getFullYear();

  return MyDateString;
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