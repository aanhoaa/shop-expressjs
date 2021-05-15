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

exports.getIndexShop = (req, res, next) => {
    Order.find().then((data) => {
      console.log(data)
    })
    res.render('index', { title: 'Shop', user: req.user, cart: req.session.cart });
}

exports.getProducts = (req, res, next) => {
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
                listProduct.push(prod);
                //console.log(prod)
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

exports.getProductDetail = (req, res, next) => {
  var promises = [];
  var productId = req.params.productId;
  var brand = '';
  var material = '';
  var listSize = [];
  var listColor = new Array;
  var listRelative = [];

  
  
  Product.findById(productId, function(err, data) {
    if (err) console.log(err);
    else
    {
      data.viewCounts += 1/2;
      data.save();
      
      Product.find().then((data2) => {
        data2.forEach((item) => {
          if (item.price > 0)
          {
            if (item._id != productId)
            {
              if (item.productType.main.id === data.productType.main.id)
              {
                listRelative.push(item);
              }
            }
          }
        })
      })
        promises.push(
          Brand.findById(data.brand, function(err, brd) {
            if (err) console.log(err);
            else{
              brand = brd.name;
            }
          })
        )

        promises.push(
          Material.findById(data.materials, function(err, mate) {
            if (err) console.log(err);
            else{
              material = mate.name;
            }
          })
        )
        
        var list = [];
        data.subId.size.forEach((subSize) => {
          listSize.push({name: subSize.name, price: subSize.price});

          subSize.color.forEach((subColor) => {
            list.push({size: subSize.name, color: subColor.name, amount: subColor.amount, price: subSize.price})
          })
        });
       
        data.subId.size[0].color.forEach((subColor) => {
          var codeColor = '';
          switch(subColor.name)
          {
            case ('orange'):
            {
              codeColor = 'color1';
              break;
            }
            case ('olivaceous'):
            {
              codeColor = 'color2';
              break;
            }
            case ('green'):
            {
              codeColor = 'color3';
              break;
            }
            case ('blue'):
            {
              codeColor = 'color4';
              break;
            }
            case ('sky'):
            {
              codeColor = 'color5';
              break;
            }
            case ('yellow'):
            {
              codeColor = 'color6';
              break;
            }
            case ('greenish'):
            {
              codeColor = 'color7';
              break;
            }
            case ('red'):
            {
              codeColor = 'color8';
              break;
            }
            default:
            {
              codeColor = 'no-color-img';
              break;
            }     
          }

          listColor.push({'name': subColor.name, 'code': codeColor});
        })

        //console.log(list)
        Promise.all(promises).then(() => 
          res.render("./shop/product/productDetail", {
            user: req.user,
            data: data,
            subImg: data.subImages,
            img: data.images,
            brand: brand,
            material: material,
            size: listSize,
            color: listColor,
            list: list,
            cart: req.session.cart,
            listRelative: listRelative
          })
        );
    }
  });
}

exports.getProductDetailInfo = (req, res, next) => {
  var productId = req.params.productId;
  var size = req.query.size_val;
  var color = req.query.color_val;
  var oData = new Array;
  var promises = [];

  Product.findById(productId, function(err, data) {
    if (err) console.log(err);
    else
    {
      data.subId.size.forEach((subSize) => {
        if (subSize.name === size)
        {
          //promises.push(
            subSize.color.forEach((subColor) => {
              if (subColor.name === color)
              {
                oData.push({amount: subColor.amount, price: subSize.price})
              }
            })
         // )
        }
      });
      res.send(JSON.stringify(oData))  
    }
  });

  // Promise.all(promises).then(() => 
  //   res.send(JSON.stringify(oData))             
  // );
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

exports.getCart = (req, res, next) => {
  var listProduct = []; 
  
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
                  listProduct.push(prod);
                }
            })
           
            res.render("./shop/cart/cart", {
              title: "Giỏ hàng",
              user: req.user,
              trendings: products,
              products: listProduct,
              cart: req.session.cart
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

exports.getCheckout = (req, res, next) => {
   res.render('./shop/cart/checkout', {cart: req.session.cart, user: req.user});
}

exports.postCheckout = (req, res, next) => {
  var promises = [];
  var okay = 0;
  var type = req.body.type_of_payment;
  var item = [];
  var total = 0;

  req.session.cart.forEach((subCart) => {
    item.push(
      {
        name: subCart.name, 
        sku: 'item', 
        price: Number(parseInt(subCart.price, 10)/23000).toFixed(2).toString(),
        currency: "USD",
        quantity: parseInt(subCart.amount, 10)
      }
      )

      total += parseInt(subCart.price, 10)/23000 * parseInt(subCart.amount, 10);
  })

 // console.log(item)
if (type === 'paypal')
{
  var create_payment_json = {
    "intent": "authorize",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3000/shop/checkouted",
      "cancel_url": "http://cancel.url"
  },
    "transactions": [{
        "item_list": {
            "items": item
        },
        "amount": {
            "currency": "USD",
            "total": Number(total).toFixed(2).toString()
        },
        "description": "This is the payment description."
    }]
  };
  
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
          }
        }
    }
  });
}
else
{
  var order = new Order({
    user: req.user._id,
    cart: req.session.cart,
    status: 0,
    statusDelivery: 0,
    statusToStore: -1
  })

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
      res.redirect(`/user/${order._id}`);
    } 
  })
  );
}

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