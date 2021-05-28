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

  const product = await db.getProductByCateOne([cateOneID]);
  res.render("./shop/product/products", {
    title: "Trang chủ",
    userInfo: req.session.Userinfo,
    cart: req.session.cart,
    cate1: cate1,
    cate2: cate2,
    product: product,
  });
}

exports.getProductDetail = async (req, res, next) => {
  const productId = req.params.productId;
  const data = await db.getProductAllById([productId]);
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
    console.log(min, max)
    res.render("./shop/product/productDetail", {
      user: req.user,
      userInfo: req.session.Userinfo,
      cart: req.session.cart,
      data: data,
      only: onlyOne,
      min: min,
      max: max
    })
  }
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
  
  var arrData = [];
  if (data != '') {
    for(let i of data) {
      var getData = await db.getCartCheckOut([req.session.Userinfo.id, i]);
      arrData.push(getData);
    }
  }
  const all = [];
  arrData.map(item => {
    const shop_id = item[0].shop_id;
    const pvd_id = item[0].pvd_id;
    if (all.findIndex(x => x.shopId == shop_id) < 0){
      all.push({
        shopId: shop_id,
        shopName: item[0].shop,
        products: []
      })
    }
    const index = all.findIndex(x => x.shopId == shop_id);
    if(all[index].products.findIndex(x => x.pvdId == pvd_id) < 0){
      all[index].products.push({
        pvdId: pvd_id,
        name: item[0].name,
        amount: item[0].amount,
        price: item[0].price,
        color: item[0].color,
        size: item[0].size,
        cover: item[0].covers
      })
    }
  })

  //console.log(util.inspect(all, {showHidden: false, depth: null}))
  req.session.order = '';
  req.session.order = all;

  res.render('./shop/cart/checkout', {
    cart: req.session.cart, 
    user: req.user,
    userInfo: req.session.Userinfo,
    book: addBook,
    data: arrData
  });
}

exports.postCheckout = async (req, res, next) => {
  const amount = req.body.arrAmount.split(",");
  const pvd = req.body.arrPVD.split(",");
  const shop_id = req.body.arrShop.split(",");
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
          const order_id = await db.insertOrder([purchase_id, item.shopId, 30000, now, 0]);
          item.products.map(async i => {
            //save orderdetail
            var variant = `${i.color} ${i.size}`;
            const orderDetail = await db.insertOrderDetail([order_id, i.pvdId, i.name, variant, i.amount, i.price, 0]);
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
  res.redirect('/user/account/address');
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

exports.postProductFilter = (req, res, next) => {
  var listProduct = [];
  var listBrand = [];
  var listMaterial = [];
  var listCate = [];

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
          listChild.push({name: child.childName})
        })
        listCate.push({name: item.name, list: listChild})
    })
  });

  var 
      brand = req.body.group_brand,
      color = req.body.group_color, 
      size = req.body.group_size, 
      material = req.body.group_material,
      price = req.body.group_price,
      category = req.body.category_id;
  console.log(price)
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
                if (brand !== undefined)
                {
                  if (prod.brand === brand)
                      listProduct.push(prod);
                }
                else
                {
                  listProduct.push(prod);
                }
                if (material !== undefined)
                {
                  for(let i =0; i < listProduct.length; i++)
                  {
                    if (listProduct[i].materials !== material)
                    {
                      if (i == 0)
                      {
                        listProduct.shift();
                      }
                      else
                      {
                        listProduct.splice(1, i);
                      }
                    }
                  }
               }
               if (color !== undefined)
               {
                  for(let i = 0; i < listProduct.length; i++)
                  {
                    var count = listProduct[i].subId.size[0].color.length;
                    listProduct[i].subId.size[0].color.forEach((subColor) => {
                      if (subColor.name !== color)
                      {
                        count --;
                      }

                      if (count === 0)
                      {
                        if (i == 0)
                        {
                          listProduct.shift();
                        }
                        else
                        {
                          listProduct.splice(1, i);
                        }
                      }
                    })
                  }
                }
                if (size !== undefined)
                {
                  for(let i = 0; i < listProduct.length; i++)
                  {
                    var count = listProduct[i].subId.size.length;
                    listProduct[i].subId.size.forEach((subSize) => {
                      if (subSize.name !== size)
                      {
                        count --;
                      }
                      if (count === 0)
                      {
                        if (i == 0)
                        {
                          listProduct.shift();
                        }
                        else
                        {
                          listProduct.splice(1, i);
                        }
                      }
                    })
                  }
                }

                if (price !== undefined)
                {
                  for(let i = 0; i < listProduct.length; i++)
                  {
                    var count = listProduct[i].subId.size.length;
                    listProduct[i].subId.size.forEach((subSize) => {
                      switch (price) 
                      {
                        case '1':
                        {
                          if (subSize.price > 3000000) count --;
                          if (count === 0)
                          {
                            if (i == 0)
                            {
                              listProduct.shift();
                            }
                            else
                            {
                              listProduct.splice(1, i);
                            }
                          }
                          break;
                        }
                        case '2':
                        {
                          console.log('here')
                          if (subSize.price < 3000000 || subSize.price > 500000) count --;
                          if (count === 0)
                          {
                            if (i == 0)
                            {
                              listProduct.shift();
                            }
                            else
                            {
                              listProduct.splice(1, i);
                            }
                          }
                          break;
                        }
                        case '3':
                        {
                          if (subSize.price < 500000 || subSize.price > 1000000) count --;
                          if (count === 0)
                          {
                            if (i == 0)
                            {
                              listProduct.shift();
                            }
                            else
                            {
                              listProduct.splice(1, i);
                            }
                          }
                          break;
                        }
                        case '4':
                        {
                          if (subSize.price < 10000000) count --;
                          if (count === 0)
                          {
                            if (i == 0)
                            {
                              listProduct.shift();
                            }
                            else
                            {
                              listProduct.splice(1, i);
                            }
                          }
                          break;
                        }
                      }
                    })
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
              listMaterial: listMaterial
            });
        });
    })
    .catch(err => {
      console.log(err);
    });
}

exports.postProductSortBy = (req, res, next) => {
  var listProduct = [];  
  var listBrand = [];
  var listMaterial = [];
  var listCate = [];
  var option = req.body.optionSelect;
  var sortby = req.body.sortby;
  var sort = {};
  sort[option] = sortby;

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
        .sort(sort)
        .then(products2 => {
      
            products2.forEach((prod) => {
                if (prod.price > 0)
                {
                  listProduct.push(prod);
                }
            })
           
            res.render("./shop/product/products", {
              title: "Trang chủ",
              user: req.user,
              trendings: products,
              products: listProduct,
              cart: req.session.cart,
              listBrand: listBrand,
              listMaterial: listMaterial
            });
        });
    })
    .catch(err => {
      console.log(err);
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