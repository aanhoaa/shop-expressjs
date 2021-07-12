const jwtHelper = require("../helpers/jwt.helper"); 
const db = require('../helpers/db.helper');
var bcrypt = require("bcryptjs");
const util = require('util')
const fetch = require('node-fetch');
const https = require('https');
const querystring = require('querystring');
const crypto = require('crypto');
const CF = require('../helpers/cf')
const cf =  require('../helpers/collaborativeFiltering');
// exports.getIndexShop = (req, res, next) => {
//     Order.find().then((data) => {
//       console.log(data)
//     })
//     res.render('index', { title: 'Shop', user: req.user, cart: req.session.cart });
// }

exports.getProductsBySearch = async (req, res, next) => {
  const query = req.query.q;
  const result = await db.getProductDetailBySeach([query]);
  console.log(result)
  res.render('./shop/product/productSearch', {
    userInfo: req.session.Userinfo,
    cart: req.session.cart,
    product: result
  })
} 

exports.getProducts = async (req, res, next) => {
  const cateOneID = req.params.cateOneId;
  const cate1 = await db.getCategoryLevelOne();
  const cate2 = await db.getCategoryLevelTwoAll();

  var bind = new Array;
  const b = await fetch('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
    'method': 'GET',
    'headers': {
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Upgrade-Insecure-Requests': '1',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.66',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'token': '09d8cf6a-c357-11eb-8ea7-7ad2d1e1ce1c',
      'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
     // 'Cookie': x.cookie,
      'gzip': true,
  }
  }).then(res => res.json())
  .then(data => {
    const address = data.data;
    address.forEach(iCity => {
    bind.push({id: iCity.ProvinceID, name: iCity.ProvinceName});
    })
    return bind;
  })
  .catch(err => console.log(err))

  const product = await db.getProductByCateOne(0, 1, 1, [cateOneID]);
  const count = await db.getCountProductSelled();
  
  res.render("./shop/product/products", {
    title: "Trang chủ",
    userInfo: req.session.Userinfo,
    cart: req.session.cart,
    cate1: cate1,
    cate2: cate2,
    product: product,
    key: cateOneID,
    bind: b,
    count: count
  });
}

exports.getProductsCateTwo = async (req, res, next) => {
  const cateTwoID = req.params.cateTwoId;
  const cate1 = await db.getCategoryLevelOne();
  const cate2 = await db.getCategoryLevelTwoAll();
  const product = await db.getProductByCateTwo(0, 1, 1, [cateTwoID]);

  var bind = new Array;
  const b = await fetch('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
    'method': 'GET',
    'headers': {
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Upgrade-Insecure-Requests': '1',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.66',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'token': '09d8cf6a-c357-11eb-8ea7-7ad2d1e1ce1c',
      'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
     // 'Cookie': x.cookie,
      'gzip': true,
  }
  }).then(res => res.json())
  .then(data => {
    const address = data.data;
    address.forEach(iCity => {
    bind.push({id: iCity.ProvinceID, name: iCity.ProvinceName});
    })
    return bind;
  })
  .catch(err => console.log(err))

  res.render("./shop/product/cate", {
    title: "Trang chủ",
    userInfo: req.session.Userinfo,
    cart: req.session.cart,
    cate1: cate1,
    cate2: cate2,
    product: product,
    key: cateTwoID,
    bind: b,
    count: count
  });
}

exports.getProductDetail = async (req, res, next) => {
  const productId = req.params.productId;
  const data = await db.getProductAllById([productId]);
  const shop = await db.getShopByProductId([productId]);
  const relative = await db.getProductByShop([shop.id]);
  const productCate2 = await db.getProductByCateTwo(1, 1, [data[0].cate2_id]); 

  if (!req.session.recent) {
    req.session.recent = [];
    req.session.recent.unshift(productId);
  }
  else {
    const index = req.session.recent.indexOf(productId);
    
    if (index > -1){
      req.session.recent.splice(index, 1);
      req.session.recent.unshift(productId);
    }
    else req.session.recent.unshift(productId);
  }

  var onlyOne = 1;
  var min = 0;
  var max = 0;
 
  if (data == false) return res.redirect('/');
  else {
    if (data.length == 1) {
      if (data[0].size == null && data[0].color == null) 
        onlyOne = 0;
    }
    min = data[0].max;
    data.forEach(i => {
      if (i.max > max)
      max = i.max;
      if (i.max < min)
        min = i.max;
    })
    
    res.render("./shop/product/productDetail", {
      title: data[0].name || 'Sản phẩm',
      user: req.user,
      userInfo: req.session.Userinfo,
      cart: req.session.cart,
      data: data,
      only: onlyOne,
      min: min,
      max: max,
      shop: shop,
      relativeShop: relative,
      productCate2: productCate2,
      cate2_id: data[0].cate2_id
    })
  }
}

exports.getShopProduct = async (req, res, next) => {
  const shopId = req.params.shopId;
  const data = await db.getShopProductById([shopId]); 
  const arrData = await db.getCateShop([shopId]);
  
  console.log(arrData)
  res.render("./shop/product/shop", {
    title: "Trang chủ",
    userInfo: req.session.Userinfo,
    cart: req.session.cart,
    product: data,
  });
}

exports.getProductDetailInfo = async (req, res, next) => {
  var {productId, color, size, quantity} = req.query;

  if (productId == '' || color == '' || size == '' || quantity == '') {
    return res.send({state: -1, err: 'Cần chọn phân loại hàng '});
  }

  const data = await db.getProductVariantBeforeSell([productId]);
  var stock = 0;
  var price = 0;
  var productvariant_id = '';
  if (color == 1) color = null;
  if (size == 1) size = null;
  var error = 0;
  const userInfo = req.session.Userinfo;
  var userID = 0;
  var amountErr = 0;

  //handle quantity if logged in
  if (userInfo) {
    userID = userInfo.id;
  }

  if (data != false) {  
    for(let item of data) {
      if (item.color == color && item.size == size) {
        price = item.price;
        productvariant_id = item.productvariant_id;
        if (userID > 0) {
          var exist = await db.checkExistCart([userID, productvariant_id]);
          if (exist != false) {
            var getData = await db.getCartQuantity([userID, productvariant_id]);
            if (getData != false) {
              quantity = parseInt(getData[0].amount) + parseInt(quantity);
            }
            else {
              error++;
              break;
            }
          }
        }
        stock = item.stockamount;
        if (stock < quantity) {
          if (getData) {
            amountErr = stock - getData[0].amount;
          }
          else 
            amountErr = stock;
          error ++;
          break;
        }

        break;
      }
    }
  }
  else return res.send({state: -1, err: 'Lỗi hệ thống '});
  
  if (error > 0) {
    res.send({state: 0, err: "Không được vượt quá kho hàng", amountErr: amountErr});
  }
  else {
    res.send({state: 1, stock: stock, productvariant_id: productvariant_id, price: price});
  }
}

exports.postAddToCart = async (req, res, next) => {
  const {pdvID, amount} = req.body;
  //check user logged
  const userInfo = req.session.Userinfo;

  if (pdvID != '' && amount != '') {
    //check exist
    const exist = await db.checkExistCart([userInfo.id, pdvID]);
    const cartCount = await db.getCart([userInfo.id]);
    var stockDB = await db.getStockAmount([pdvID]);
    if (exist != false && stockDB != false) { //if exist before
      //check db + amount > stock
        if (parseInt(exist.amount) + parseInt(amount) > stockDB.stockamount) {
          return res.status(500).json({err: 'Vượt quá số lượng trong kho'});
        }
        else {
          //update
          const updateCart = await db.updateCart([parseInt(exist.amount) + parseInt(amount), userInfo.id, pdvID]);
          if (updateCart == true) return res.send({state: 1});
          else return res.status(500).json({err: 'Lỗi hệ thống'});
        } 
    }
    else if (exist == false && stockDB != false){
      //create new one
      const cart = await db.insertCart([userInfo.id, pdvID, amount]);
      if (cart == true) {
        req.session.cart = req.session.cart + 1;
        return res.send({state: 1, cart: cartCount.length  + 1});
      }
      else return res.status(500).json({err: 'Lỗi hệ thống'});
    }
  }
  else res.send({state: -1, err: 'Dữ liệu trống'});
}

exports.postUpdateToCart = async (req, res, next) => {
  const {pdvID, amount} = req.body;
  const userInfo = req.session.Userinfo;

  if (pdvID != '' && amount != '') {
    var stockDB = await db.getStockAmount([pdvID]);
    if (stockDB < amount) {
      return res.send({state: -1, err: 'Vượt quá giới hạn trong kho'});
    }
    else {
      const updateCart = await db.updateCart([amount, userInfo.id, pdvID]);
      if (updateCart == true) return res.send({state: 1});
      else return res.send({state: -1, err: 'Lỗi hệ thống'});
    }
  }
  else res.send({state: -1, err: 'Dữ liệu trống'});
}

exports.getCart = async (req, res, next) => {
  const data = await db.getCartAll([req.session.Userinfo.id]);
  var recommendProduct = [];
  const userInfo = req.session.Userinfo;

  const listRating = await db.getRating();
  var train = new Array();
  listRating.forEach(item => {
    train.push([item.user_id, item.product_id, item.rating])
  })

  var userRecommend = new Array();
  listRating.forEach(item => {
      if (item.user_id == userInfo.id) {
        userRecommend.push([item.user_id, item.product_id, item.rating]);
      }
  })

  const cf = new CF();
  cf.train(train);
  let gt = cf.gt(userRecommend);
  recommendProduct = cf.recommendGT(gt, 6);
  const listPd = await db.getProductDetailByID();
  var recommend = [];
 
  for(let iRecommend in recommendProduct) {
    recommendProduct[iRecommend].forEach(item => {
      recommend.push(item.itemId * 1)
    })
  }

  res.render("./shop/cart/cart", {
    title: "Giỏ hàng",
    userInfo: req.session.Userinfo,
    cart: req.session.cart,
    data: data,
    listPd: listPd,
    recommend: recommend
  });
}

exports.getCartInfo = async (req, res, next) => {
  const data = req.query;
  var amount = 0;
  var price = 0;
  if (data.pvd != '') {
    for(let i of data.pvd) {
      var getData = await db.getCartByUserIdAndPVId([req.session.Userinfo.id, i]);
      amount = parseInt(amount) + parseInt(getData[0].amount);
      price = parseInt(price) + parseInt(getData[0].price) * parseInt(getData[0].amount);
    }
  }

  const addBook = await db.getUserAddressBookExist(1, [req.session.Userinfo.id]);
  if (addBook == true) {
    req.session.checkout = data.pvd;
    req.session.voucher = "";
    return res.send({state: 1, amount: amount, price: price, book: 1});
  }
  else return res.send({state: 1, amount: amount, price: price, book: 0});

}

exports.postDeleteCart = async (req, res, next) => {
  const cartID = req.body.cartId;

  const delCart = await db.deleteCart([cartID]);
  if (delCart == true) {
    if (req.session.cart == 0) 
      req.session.cart = 0;
    else req.session.cart -= 1;
    return res.send({state: 1});
  }
  else return res.send({state: 0});
}

exports.getCheckout = async (req, res, next) => {
  const addBook = await db.getUserAddressBook([req.session.Userinfo.id]);
  const data = req.session.checkout;

  var total = 0;
  var arrData = [];
  if (data != '') {
    for(let i of data) {
      var getData = await db.getCartCheckOut([req.session.Userinfo.id, i]);
      arrData.push(getData);
    }
  }

  const all = [];
  const a = await Promise.all(arrData.map(async item => {
  const shop_id = item[0].shop_id;
  const pvd_id = item[0].pvd_id;
  var voucher = "";
  if (all.findIndex(x => x.shopId == shop_id) < 0){
    if (req.session.voucher) {
      const index = req.session.voucher.findIndex(i => Number(i.shopId) == Number(shop_id));
      if (index > -1) voucher = req.session.voucher[index];
    }
    
    all.push({
      shopId: shop_id,
      shopName: item[0].shop,
      fee: 0,
      products: [],
      voucher: voucher
    })
  }
  const index = all.findIndex(x => x.shopId == shop_id);
      if(all[index].products.findIndex(x => x.pvdId == pvd_id) < 0){
        const shopBook = await db.getShopAddressBook([shop_id]);
        //ship
        const shipping = await fetch(`https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee?service_id=53320&insurance_value=500000&from_district_id=${shopBook[0].district_code}&to_district_id=${addBook[0].district_code}&to_ward_code=${addBook[0].ward_code}&height=${item[0].h}&length=${item[0].l}&weight=${item[0].weight}&width=${item[0].w}`, {
      'method': 'GET',
      'headers': {
        'Connection': 'keep-alive',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.66',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document',
        'token': '09d8cf6a-c357-11eb-8ea7-7ad2d1e1ce1c',
        'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
       // 'Cookie': x.cookie,
        'gzip': true,
    }
    }).then(res => res.json())
    .then(data => {
      const fee = data.data;
      all[index].fee = fee.total  * item[0].amount;
      all[index].products.push({
        pvdId: pvd_id,
        name: item[0].name,
        amount: item[0].amount,
        price: item[0].price,
        color: item[0].color,
        size: item[0].size,
        cover: item[0].cover,
        fee: fee.total  * item[0].amount
      });
      total += fee.total  * item[0].amount + item[0].price  * item[0].amount
      return fee.total  * item[0].amount;
    })
    .catch(err => console.log(err));
      }
      
    }))
  req.session.total = total;
  //console.log(util.inspect(all, {showHidden: false, depth: null}))
  req.session.order = '';
  req.session.order = all;
  res.render('./shop/cart/checkout', {
    cart: req.session.cart, 
    user: req.user,
    userInfo: req.session.Userinfo,
    book: addBook,
    data: all,
    shipFee: 0
  });
  
}

exports.postCheckout = async (req, res, next) => {
  const dateFormat = require('dateformat');
  const amount = req.body.arrAmount.split(",");
  const pvd = req.body.arrPVD.split(",");
  const shop_id = req.body.arrShop.split(",");
  const ship = req.body.arrShip.split(",");
  const userInfo = req.session.Userinfo;
  const paymentMethod = req.body.paymentmethod;
  const now = new Date(); 
  const total = req.session.total * 100;

  if (paymentMethod == 2) {
    try {
      //code vnpay here
      var ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

      var tmnCode = process.env.TMNCODE // .ev
      var secretKey =  process.env.SECRETKEY//.ev
      var vnpUrl = 'http://sandbox.vnpayment.vn/paymentv2/vpcpay.html' //.ev
      var returnUrl = process.env.RETURNURL //.ev

      var date = new Date();

      var createDate = dateFormat(date, 'yyyymmddHHmmss');
      var orderId = makeid(10);
      //var bankCode = req.body.bankCode;

      var orderInfo = 'Thanh toan mua hang';
      var orderType = '230001';
      var locale = '';
      if(locale === null || locale === ''){
      locale = 'vn';
      }
      var currCode = 'VND';
      var vnp_Params = {};
      vnp_Params['vnp_Version'] = '2.0.0';
      vnp_Params['vnp_Command'] = 'pay';
      vnp_Params['vnp_TmnCode'] = tmnCode;
      // vnp_Params['vnp_Merchant'] = ''
      vnp_Params['vnp_Locale'] = locale;
      vnp_Params['vnp_CurrCode'] = currCode;
      vnp_Params['vnp_TxnRef'] = orderId;
      vnp_Params['vnp_OrderInfo'] = orderInfo;
      vnp_Params['vnp_OrderType'] = orderType;
      vnp_Params['vnp_Amount'] = total;
      vnp_Params['vnp_ReturnUrl'] = returnUrl;
      vnp_Params['vnp_IpAddr'] = ipAddr;
      vnp_Params['vnp_CreateDate'] = createDate;
      // if(bankCode !== null && bankCode !== ''){
      //     vnp_Params['vnp_BankCode'] = bankCode;
      // }

      vnp_Params = sortObject(vnp_Params);

      var querystring = require('qs');
      var signData = secretKey + querystring.stringify(vnp_Params, { encode: false });

      var sha256 = require('sha256');

      var secureHash = sha256(signData);

      vnp_Params['vnp_SecureHashType'] =  'SHA256';
      vnp_Params['vnp_SecureHash'] = secureHash;
      vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: true });

      req.session.pdv = '';
      req.session.pdv = pvd;
      return res.redirect(vnpUrl)
    }
    catch (error) {
      console.log('Error when post checkout vnpay', error);
      return error;
    }
  }

  try {
      //update sản phẩm trong kho
      for (let pdvID of pvd) {
        var exist = await db.checkExistCart([userInfo.id, pdvID]);
        if (exist == false) return res.status(500).json({err: "sản phẩm không có trong giỏ hàng"});
        else {
          var getStock = await db.getStockAmount([pdvID]);
          
          const subAmount = getStock.stockamount - exist.amount;
          var updCart = await db.updateProductVariantAmount([subAmount, pdvID]);
          const getProduct = await db.getProductByPDVID([pdvID]);
          if (getProduct != false) {
            const createRating = await db.insertUserRating([userInfo.id, getProduct.id]);
          }
        }
      }

      for (let pdvID of pvd) {
        var delCart = await db.deleteCartByUser([userInfo.id, pdvID]);
      }

      //insert purchase
      const purchase_id = await db.insertPurchase([userInfo.id, paymentMethod, now, 0]);
      if (purchase_id != false) {
        //insert address order
        const addOrder = await db.getUserAddressBook([userInfo.id]);
        if (addOrder != false) {
          const addressOrder = [purchase_id, addOrder[0].province_name, addOrder[0].district_name, addOrder[0].ward_name, addOrder[0].identity_name, addOrder[0].fullname, addOrder[0].phone];
          const insertAddOrd = await db.insertAddressOrder(addressOrder);
        }
        //insert order
        const data = req.session.order;
        data.map(async item => {
          //save order 
          const order_id = await db.insertOrder([purchase_id, item.shopId, item.fee, now, 0]);
          var discount = 0;
          if (item.voucher) discount = item.voucher.discount;
          item.products.map(async i => {
            //save orderdetail
            var variant = `${i.color} ${i.size}`;
            
            const orderDetail = await db.insertOrderDetail([order_id, i.pvdId, i.name, variant, i.amount, i.price, i.cover, discount]);
            
          })
        })
      }
  }
  catch (error) {
    console.log('Error when post checkout', error);
    return error;
  }
  //update cart.length
  const cart = await db.getCart([userInfo.id]);
  req.session.cart = cart.length;

  req.session.order = '';
  res.redirect('/user/purchase/?type=confirm');
}

exports.getCheckoutedMoMo = (req, res, next) => {
  const param = req.query
  var serectkey = "OLU5tyy5L35dOPdhbuZuvja0ewTyywqq"
  var status = 0;
  var rawSignature ="partnerCode="+param.partnerCode+"&accessKey="+param.accessKey+"&requestId="+param.requestId+"&amount="+param.amount+"&orderId="+param.orderId+"&orderInfo="+param.orderInfo+"&orderType="+param.orderType+"&transId="+param.transId+"&message="+param.message+"&localMessage="+param.localMessage+"&responseTime="+param.responseTime+"&errorCode="+param.errorCode+"&payType="+param.payType+"&extraData="+param.extraData
    //signature
  var signature = crypto.createHmac('sha256', serectkey)
                  .update(rawSignature)
                  .digest('hex');

  if (signature == req.query.signature) {
    if (param.errorCode == '0') {
      status = 1;
      //xử lý db 
    }
    else status = 0;
  } else status = -1;
  console.log(status)
  res.render('./shop/cart/payment', {
    status: status, 
    cart: req.session.cart, 
    userInfo: req.session.Userinfo
  })
}

exports.postCheckoutedMoMo = (req, res, next) => {
  console.log('POST HERE')
  const param = req.query
  var serectkey = "OLU5tyy5L35dOPdhbuZuvja0ewTyywqq"
  var status = 0;
  var rawSignature ="partnerCode="+param.partnerCode+"&accessKey="+param.accessKey+"&requestId="+param.requestId+"&amount="+param.amount+"&orderId="+param.orderId+"&orderInfo="+param.orderInfo+"&orderType="+param.orderType+"&transId="+param.transId+"&message="+param.message+"&localMessage="+param.localMessage+"&responseTime="+param.responseTime+"&errorCode="+param.errorCode+"&payType="+param.payType+"&extraData="+param.extraData
    //signature
  var signature = crypto.createHmac('sha256', serectkey)
    .update(rawSignature)
    .digest('hex');
  
  if (signature == req.query.signature) {
    if (param.errorCode == '0') {
      //update order
    }
    else status = 0;
  } else status = -1;

  console.log('status', status)
}

exports.getCheckoutedVNPay = async (req, res, next) => {
  var vnp_Params = req.query;
  var secureHash = vnp_Params['vnp_SecureHash'];
  var status = 0;

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);
  var secretKey =  process.env.SECRETKEY//.ev

  var querystring = require('qs');
  var signData = secretKey + querystring.stringify(vnp_Params, { encode: false });

  var sha256 = require('sha256');

  var checkSum = sha256(signData);

  if(secureHash === checkSum) {
    //chờ deloy sẽ dùng cho route post 
    var rspCode = vnp_Params['vnp_ResponseCode'];
    if (rspCode == "00") {
      const pvd = req.session.pdv;
      const userInfo = req.session.Userinfo;
      status = 1;
      const now = new Date(); 
      const checkRef = await db.checkPurchasePayRef([vnp_Params['vnp_TxnRef']]);
      
      if (!checkRef) {
        //save db
        try {
          //update sản phẩm trong kho
          for (let pdvID of pvd) {
            var exist = await db.checkExistCart([userInfo.id, pdvID]);
            if (exist == false) return res.status(500).json({err: "sản phẩm không có trong giỏ hàng"});
            else {
              var getStock = await db.getStockAmount([pdvID]);
              
              const subAmount = getStock.stockamount - exist.amount;
              var updCart = await db.updateProductVariantAmount([subAmount, pdvID]);
              const getProduct = await db.getProductByPDVID([pdvID]);
              if (getProduct != false) {
                const createRating = await db.insertUserRating([userInfo.id, getProduct.id]);
              }
            }
          }
    
          for (let pdvID of pvd) {
            var delCart = await db.deleteCartByUser([userInfo.id, pdvID]);
          }
    
          //insert purchase
          const purchase_id = await db.insertPurchase([userInfo.id, 2, now, vnp_Params['vnp_TxnRef']]);
          if (purchase_id != false) {
            //insert address order
            const addOrder = await db.getUserAddressBook([userInfo.id]);
            if (addOrder != false) {
              const addressOrder = [purchase_id, addOrder[0].province_name, addOrder[0].district_name, addOrder[0].ward_name, addOrder[0].identity_name, addOrder[0].fullname, addOrder[0].phone];
              const insertAddOrd = await db.insertAddressOrder(addressOrder);
            }
            //insert order
            const data = req.session.order;
            data.map(async item => {
              //save order 
              const order_id = await db.insertOrder([purchase_id, item.shopId, item.fee, now, 0]);
              var discount = 0;
              if (item.voucher) discount = item.voucher.discount;
              item.products.map(async i => {
                //save orderdetail
                var variant = `${i.color} ${i.size}`;
                const orderDetail = await db.insertOrderDetail([order_id, i.pvdId, i.name, variant, i.amount, i.price, i.cover, discount]);
              })
            })
          }
        }
      catch (error) {
        console.log('Error when post checkout', error);
        return error;
      }
      //update cart.length
      const cart = await db.getCart([userInfo.id]);
      req.session.cart = cart.length;

      req.session.order = '';
    }
      
    }
    else status = 0; 
  }
  else status = -1;

  res.render('./shop/cart/payment', {
    status: status, 
    cart: req.session.cart, 
    userInfo: req.session.Userinfo
  })
}

exports.postProductBuy = (req, res, next) => {
  var productId = req.params.productId;
  var color = req.body.color;
  var size = req.body.size;
  var amount = req.body.amount;
  var price = req.body.price;
  var imgSrc = req.body.img_main;
  var name = req.body.name_prod;
  var count = 1;
  var check = 0;
  
  if (!req.session.cart)
  {
    req.session.cart = [];

    req.session.cart.push({
      productId: productId,
      color: color,
      size: size,
      amount: amount,
      price: price,
      imgSrc: imgSrc,
      name: name,
      count: count
    });
  }
  else
  {
    req.session.cart.forEach((item) => {
      if (item.color == color && item.size == size && item.name == name)
      {
        item.amount = parseInt(item.amount, 10) + parseInt(amount, 10); 
        check = 1;   
      }
    });

    if (check != 1)
    {
      req.session.cart.push({
      productId: productId,
      color: color,
      size: size,
      amount: amount,
      price: price,
      imgSrc: imgSrc,
      name: name,
      count: req.session.cart.length + 1
      });
    }
  }

  res.redirect('/shop/cart');
}

exports.postProductFilter = async (req, res, next) => {
  const cateOneID = req.body.cateOneId;
  const optionSelect = req.body.optionSelect;
  const group_rating = req.body.group_rating;
  const group_city = req.body.group_brand;
  const cate1 = await db.getCategoryLevelOne();
  const cate2 = await db.getCategoryLevelTwoAll();
  const product = await db.getProductByCateOne(group_city, optionSelect, group_rating, [cateOneID]);
  const count = await db.getCountProductSelled();
 
  var bind = new Array;
  const b = await fetch('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
    'method': 'GET',
    'headers': {
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Upgrade-Insecure-Requests': '1',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.66',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'token': '09d8cf6a-c357-11eb-8ea7-7ad2d1e1ce1c',
      'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
     // 'Cookie': x.cookie,
      'gzip': true,
  }
  }).then(res => res.json())
  .then(data => {
    const address = data.data;
    address.forEach(iCity => {
    bind.push({id: iCity.ProvinceID, name: iCity.ProvinceName});
    })
    return bind;
  })
  .catch(err => console.log(err))

  res.render("./shop/product/products", {
    title: "Trang chủ",
    userInfo: req.session.Userinfo,
    cart: req.session.cart,
    cate1: cate1,
    cate2: cate2,
    product: product,
    key: cateOneID,
    bind: b,
    count: count
  });
}

exports.postProductSortBy = async (req, res, next) => {
  const cateOneID = req.body.cateOneId;
  const optionSelect = req.body.optionSelect;
  const cate1 = await db.getCategoryLevelOne();
  const cate2 = await db.getCategoryLevelTwoAll();
  const product = await db.getProductByCateOne(0, optionSelect, 1, [cateOneID]);
  const count = await db.getCountProductSelled();
console.log(cateOneID, optionSelect)
  var bind = new Array;
  const b = await fetch('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
    'method': 'GET',
    'headers': {
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Upgrade-Insecure-Requests': '1',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.66',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'token': '09d8cf6a-c357-11eb-8ea7-7ad2d1e1ce1c',
      'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
     // 'Cookie': x.cookie,
      'gzip': true,
  }
  }).then(res => res.json())
  .then(data => {
    const address = data.data;
    address.forEach(iCity => {
    bind.push({id: iCity.ProvinceID, name: iCity.ProvinceName});
    })
    return bind;
  })
  .catch(err => console.log(err))
 
  res.render("./shop/product/products", {
    title: "Trang chủ",
    userInfo: req.session.Userinfo,
    cart: req.session.cart,
    cate1: cate1,
    cate2: cate2,
    product: product,
    key: cateOneID,
    bind: b,
    count: count
  });
}

exports.getDeleteCart = (req, res, next) => {
 var iCart = req.query.iCart;

 if (iCart == 1)
 {
   req.session.cart.shift();
 }
 else
 {
  req.session.cart.splice(iCart-1,1);
 }

 if (req.session.cart == '')
      {
        req.session.cart = null;
      }

 res.send({done:1});
}

//magege shop
exports.getShop = (req, res, next) => {
  res.render('shop/admin/login');
}

exports.postShop = async (req, res, next) => {
  const {username, password} = req.body;
   
    const data = await db.checkUserExist(3, [username]); 
    if (data) {
      const userPass = await db.getUserInfo(3,[username]);
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

//api call
exports.getCity = async (req, res, next) => {
  var bind = new Array;
  fetch('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
    'method': 'GET',
    'headers': {
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Upgrade-Insecure-Requests': '1',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.66',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'token': '09d8cf6a-c357-11eb-8ea7-7ad2d1e1ce1c',
      'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
     // 'Cookie': x.cookie,
      'gzip': true,
  }
  }).then(res => res.json())
  .then(data => {
    const address = data.data;
    address.forEach(iCity => {
    bind.push({id: iCity.ProvinceID, name: iCity.ProvinceName});
    })
  
    res.send(JSON.stringify(bind));
  })
  .catch(err => console.log(err))
}

exports.getBindingDistrict = async (req, res, next) => {
const cityID = req.query.cityId;
var bind = new Array;

fetch(`https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${cityID}`, {
  'method': 'GET',
  'headers': {
  'Connection': 'keep-alive',
  'Pragma': 'no-cache',
  'Cache-Control': 'no-cache',
  'Upgrade-Insecure-Requests': '1',
  //'Origin': 'https://danhmuchanhchinh.gso.gov.vn',
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.66',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-User': '?1',
  'Sec-Fetch-Dest': 'document',
  'token': '09d8cf6a-c357-11eb-8ea7-7ad2d1e1ce1c',
  // 'Referer': 'https://danhmuchanhchinh.gso.gov.vn/',
  'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
  // 'Cookie': x.cookie,
  'gzip': true,
}
}).then(res => res.json())
.then(data => {
  const address = data.data;

  address.forEach(iDistrict => {
  bind.push({id: iDistrict.DistrictID, name: iDistrict.DistrictName});
  })

  res.send(JSON.stringify(bind));
})
.catch(err => console.log(err))
}

exports.getBindingWard = async (req, res, next) => {
var bind = new Array;
var districtID = req.query.districtId;
fetch(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${districtID}`, {
  'method': 'GET',
  'headers': {
  'Connection': 'keep-alive',
  'Pragma': 'no-cache',
  'Cache-Control': 'no-cache',
  'Upgrade-Insecure-Requests': '1',
  //'Origin': 'https://danhmuchanhchinh.gso.gov.vn',
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.66',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-User': '?1',
  'Sec-Fetch-Dest': 'document',
  'token': '09d8cf6a-c357-11eb-8ea7-7ad2d1e1ce1c',
  // 'Referer': 'https://danhmuchanhchinh.gso.gov.vn/',
  'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
  // 'Cookie': x.cookie,
  'gzip': true,
}
}).then(res => res.json())
.then(data => {
  const address = data.data;
  address.forEach(iWard => {
  bind.push({id: iWard.WardCode, name: iWard.WardName});
  })

  res.send(JSON.stringify(bind));
})
.catch(err => console.log(err))
}

exports.getProductCate = async (req, res, next) => {
  const id = req.body.cate;
  var userInfo = null;
  var recommendProduct = [];
  
  if (req.session.Userinfo) {
    userInfo = req.session.Userinfo;

    //handle recommend system
    //1. get array rating(user_id, product_id, rating)
    const listRating = await db.getRating();
    var train = new Array();
    listRating.forEach(item => {
      train.push([item.user_id, item.product_id, item.rating])
    })

    // var userRecommend = new Array();
    // listRating.forEach(item => {
    //     if (item.user_id == userInfo.id) {
    //       userRecommend.push([item.user_id, item.product_id, item.rating]);
    //     } 
    // })

    var result = {};
    var result2 = {};
    train.forEach(value => {
      if (!result[value[0]]) {
        result[value[0]] = {};
      }
      result[value[0]][value[1]] = { rating: Number(value[2])};

      if (!result2[value[1]]) {
        result2[value[1]] = {};
      }
      result2[value[1]][value[0]] = { rating: Number(value[2])};
    })

    const ratingsGroupedByUser = result;
    const ratingsGroupedByMovie = result2;
    
    const cfItemBasedRecommendation = CF.predictWithCfItemBased(
      ratingsGroupedByUser, 
      ratingsGroupedByMovie,
      userInfo.id
    ); 
    recommendProduct = cfItemBasedRecommendation.map(item => {
        return item.productId;
    })
  }

  const category = await db.getCategoryLevelOne();
  const products = await db.getListNewProduct();
  const topSell = await db.getListSeleldProduct([id]);
  const listPd = await db.getProductDetailByID();

  res.render('index', { 
    title: 'Trang chủ', 
    userInfo: userInfo, 
    cart: req.session.cart, 
    category: category,
    products: products,
    top: topSell,
    listPd: listPd,
    recommend: recommendProduct
  });
}

exports.getCheckVoucher = async (req, res, next) => {
  const shopId = req.query.shopId;
  const code = req.query.code;
  const total = req.query.total;

  const check = await db.checkVoucher([code, shopId]);

    if (check != false) { //voucher đúng
      if (req.session.voucher) { //đã tồn tại
        //check pos 
        const index = req.session.voucher.findIndex(i => Number(i.shopId) == Number(shopId));
        if (index > -1) {
          //đã tồn tại thì update
          req.session.voucher[index].discount = check.discount;
        }
        //thêm mới
        else {
          req.session.voucher.push({shopId: shopId, discount: check.discount, code: code});
        }
      }
      else {
        req.session.voucher = [];
        req.session.voucher.push({shopId: Number(shopId), discount: check.discount, code: code});
      }
      
      return res.send({data: 1, discount: total*(check.discount/100)*-1, total: total - total*(check.discount/100)});
    } else return res.send({data: 0});
}

function MoMo() {
  if (paymentMethod == 2) {
    // handle momo
    var endpoint = "https://test-payment.momo.vn/gw_payment/transactionProcessor"
    var hostname = "https://test-payment.momo.vn"
    var path = "/gw_payment/transactionProcessor"
    var partnerCode = "MOMOIIQA20210611" 
    var accessKey = "Nn42tKQPrrX98XRq"
    var serectkey = "OLU5tyy5L35dOPdhbuZuvja0ewTyywqq"
    var orderInfo = "pay with MoMo"
    var returnUrl = "http://localhost:3000/checkout/returnUrl"
    var notifyurl = "http://localhost:3000/checkout/notifyUrl "
    var orderId = "ABB25"
    var requestId = "ABB25"
    var requestType = "captureMoMoWallet"
    var extraData = "email=abc@gmail.com"
    var strTotal = ""+total
    
    var rawSignature ="partnerCode="+partnerCode+"&accessKey="+accessKey+"&requestId="+requestId+"&amount="+strTotal+"&orderId="+orderId+"&orderInfo="+orderInfo+"&returnUrl="+returnUrl+"&notifyUrl="+notifyurl+"&extraData="+extraData
    //signature
    var signature = crypto.createHmac('sha256', serectkey)
                    .update(rawSignature)
                    .digest('hex');
    console.log(signature)
    var body = JSON.stringify({
        partnerCode : partnerCode,
        accessKey : accessKey,
        requestId : requestId,
        amount : strTotal,
        orderId : orderId,
        orderInfo : orderInfo,
        returnUrl : returnUrl,
        notifyUrl : notifyurl,
        extraData : extraData,
        requestType : requestType,
        signature : signature,
    })
    //Create the HTTPS objects
    var options = {
        hostname: 'test-payment.momo.vn',
        port: 443,
        path: '/gw_payment/transactionProcessor',
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
        }
    };

    console.log('SENDING...')
    var reqPay = https.request(options, (resp) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers: ${JSON.stringify(resp.headers)}`);
        resp.setEncoding('utf8');
        resp.on('data', (body) => {
          console.log('Body');
          console.log(body);
          console.log('payURL');
          const payUrl = JSON.parse(body).payUrl;
          console.log(payUrl);
          return res.redirect(payUrl);
        });
        resp.on('end', () => {
          console.log('No more data in response.');
        });
    });
    reqPay.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
      });
      
      // write data to request body
      reqPay.write(body);
      reqPay.end();
  }
 
}



function sortObject(o) {
  var sorted = {},
      key, a = [];

  for (key in o) {
      if (o.hasOwnProperty(key)) {
          a.push(key);
      }
  }

  a.sort();

  for (key = 0; key < a.length; key++) {
      sorted[a[key]] = o[a[key]];
  }
  return sorted;
}

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}