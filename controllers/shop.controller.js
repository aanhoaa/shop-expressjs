const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Users = require("../models/user.model");
const Brand = require("../models/brand.model");
const Material = require("../models/material.model");
const Inventory = require("../models/inventory.model");
const Order = require("../models/order.model");
const paypal = require('paypal-rest-sdk');
const jwtHelper = require("../helpers/jwt.helper"); 
const db = require('../helpers/db.helper');
var bcrypt = require("bcryptjs");
const util = require('util')
const fetch = require('node-fetch');

// exports.getIndexShop = (req, res, next) => {
//     Order.find().then((data) => {
//       console.log(data)
//     })
//     res.render('index', { title: 'Shop', user: req.user, cart: req.session.cart });
// }

exports.getProducts = async (req, res, next) => {
  const cateOneID = req.params.cateOneId;
  const cate1 = await db.getCategoryLevelOne();
  const cate2 = await db.getCategoryLevelTwoAll();

  const product = await db.getProductByCateOne(1, 1, [cateOneID]);
  res.render("./shop/product/products", {
    title: "Trang chủ",
    userInfo: req.session.Userinfo,
    cart: req.session.cart,
    cate1: cate1,
    cate2: cate2,
    product: product,
    key: cateOneID
  });
}

exports.getProductsCateTwo = async (req, res, next) => {
  const cateTwoID = req.params.cateTwoId;
  const cate1 = await db.getCategoryLevelOne();
  const cate2 = await db.getCategoryLevelTwoAll();

  const product = await db.getProductByCateTwo(1, 1, [cateTwoID]);
  res.render("./shop/product/cate", {
    title: "Trang chủ",
    userInfo: req.session.Userinfo,
    cart: req.session.cart,
    cate1: cate1,
    cate2: cate2,
    product: product,
    key: cateTwoID
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

  console.log(req.session.recent)
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

  res.render("./shop/cart/cart", {
    title: "Giỏ hàng",
    userInfo: req.session.Userinfo,
    cart: req.session.cart,
    data: data
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

  const addBook = await db.getUserAddressBookExist([req.session.Userinfo.id]);
  if (addBook == true) {
    req.session.checkout = data.pvd;
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
  var ship = 0;
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
      if (all.findIndex(x => x.shopId == shop_id) < 0){
        all.push({
          shopId: shop_id,
          shopName: item[0].shop,
          fee: 0,
          products: []
        })
      }
      const index = all.findIndex(x => x.shopId == shop_id);
      if(all[index].products.findIndex(x => x.pvdId == pvd_id) < 0){
        //ship
        const shipping = await fetch(`https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee?service_id=53320&insurance_value=500000&from_district_id=1542&to_district_id=${addBook[0].district_code}&to_ward_code=${addBook[0].ward_code}&height=${item[0].h}&length=${item[0].l}&weight=${item[0].weight}&width=${item[0].w}`, {
      'method': 'GET',
      'headers': {
        'Connection': 'keep-alive',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
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
      return fee.total  * item[0].amount;
    })
    .catch(err => console.log(err));
      }
      
    }))

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
  const amount = req.body.arrAmount.split(",");
  const pvd = req.body.arrPVD.split(",");
  const shop_id = req.body.arrShop.split(",");
  const ship = req.body.arrShip.split(",");
  const userInfo = req.session.Userinfo;
  const paymentMethod = req.body.paymentmethod;
  const now = new Date();
 
  try {
      //update sản phẩm trong kho
      for (let pdvID of pvd) {
        var exist = await db.checkExistCart([userInfo.id, pdvID]);
        if (exist == false) return res.status(500).json({err: "sản phẩm không có trong giỏ hàng"});
        else {
          var getStock = await db.getStockAmount([pdvID]);
          
          const subAmount = getStock.stockamount - exist.amount;
          var updCart = await db.updateProductVariantAmount([subAmount, pdvID]);
        }
      }

      for (let pdvID of pvd) {
        var delCart = await db.deleteCartByUser([req.session.Userinfo.id, pdvID]);
      }

      //insert purchase
      const purchase_id = await db.insertPurchase([userInfo.id, paymentMethod, now]);
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
          item.products.map(async i => {
            //save orderdetail
            var variant = `${i.color} ${i.size}`;
            const orderDetail = await db.insertOrderDetail([order_id, i.pvdId, i.name, variant, i.amount, i.price, i.cover, 0]);
            
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
  const cate1 = await db.getCategoryLevelOne();
  const cate2 = await db.getCategoryLevelTwoAll();
  const product = await db.getProductByCateOne(optionSelect, group_rating, [cateOneID]);
 
  res.render("./shop/product/products", {
    title: "Trang chủ",
    userInfo: req.session.Userinfo,
    cart: req.session.cart,
    cate1: cate1,
    cate2: cate2,
    product: product,
    key: cateOneID
  });
}

exports.postProductSortBy = async (req, res, next) => {
  const cateOneID = req.body.cateOneId;
  const optionSelect = req.body.optionSelect;
  const cate1 = await db.getCategoryLevelOne();
  const cate2 = await db.getCategoryLevelTwoAll();
  const product = await db.getProductByCateOne(optionSelect, 1, [cateOneID]);
 
  res.render("./shop/product/products", {
    title: "Trang chủ",
    userInfo: req.session.Userinfo,
    cart: req.session.cart,
    cate1: cate1,
    cate2: cate2,
    product: product,
    key: cateOneID
  });
}

exports.postProductCateFilter = (req, res, next) => {
  var listProduct = [];  
  var listBrand = [];
  var listMaterial = [];
  var listCate = [];
  var cate = req.body.cate;
  var child = req.body.child;

  Brand.find().then((data) => {
    data.forEach((item) => {
      listBrand.push({id: item._id, name: item.name})
    })
  });

  Material.find().then((data) => {
    data.forEach((item) => {
      listMaterial.push({id: item._id, name: item.name})
    })
  });

  Category.find().then((data) => {
    data.forEach((item) => {
      var listChild = [];
        item.childCateName.forEach((child) => {
          listChild.push({id: child._id, name: child.childName})
        })
        listCate.push({name: item.name, id: item._id, list: listChild})
    })
  });

    Product.find()
    .limit(8)
    .then(products => {
      Product.find()
        .limit(8)
        .sort({"viewCounts": -1})
        .then(products2 => {
      
            products2.forEach((prod) => {
                if (prod.price > 0)
               {
                
                if (prod.productType.main.id === cate)
                {
                  if (child)
                  {
                    if (prod.productType.sub.id === child)
                    {
                      listProduct.push(prod);
                    }
                  }
                  else
                  {
                    listProduct.push(prod);
                  }
                }
               }
            })

            res.render("./shop/product/products", {
              title: "Trang chủ",
              user: req.user,
              trendings: products,
              products: listProduct,
              cart: req.session.cart,
              listBrand: listBrand,
              listMaterial: listMaterial,
              listCate: listCate
            });
        });
    })
    .catch(err => {
      console.log(err);
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








exports.getCheckouted = (req, res, next) => {
  var promises = [];
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  var total = 0;

  req.session.cart.forEach((subCart) => {
    total += parseInt(subCart.price, 10)/23000 * parseInt(subCart.amount, 10);
  })

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": Number(total.toFixed(2).toString())
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) 
    {
       res.render('cancle');
    } 
    else 
    {
        var order = new Order({
          user: req.user._id,
          cart: req.session.cart,
          status: 1,
          statusDelivery: 0,
          statusToStore: -1
        });
      
        //update data in product, inventory
        req.session.cart.forEach((prod) => {
          promises.push(
            Product.findById(prod.productId, function(err, data) {
              if (err) console.log(err);
              else{
                data.subId.size.forEach((subSize) => {
                  if (prod.size === subSize.name)
                  {
                    subSize.color.forEach((subColor) => {
                      if (prod.color === subColor.name)
                      {
                        subColor.amount -= prod.amount;
                        data.save();
                      }
                    })
                  }
        
                  for (let i = 0; i < data.listInventory.length; i++) {
                    Inventory.findById(data.listInventory[i], function(err, ivent) {
                      if (err) console.log(err);
                      else{
                        if (prod.size === ivent.sizeId && prod.color === ivent.colorId)
                        {
                          ivent.amount -= prod.amount;
                          ivent.save();
                        }
                      }
                    })
                    
                  }
                })
              }
            })
          )
        })
      
        Promise.all(promises).then(() => 
        order.save((err)=>{
          if (err) throw err;
          else
          {
            req.session.cart = null;
            res.redirect('/user');
          } 
        })
        );
      }
})
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