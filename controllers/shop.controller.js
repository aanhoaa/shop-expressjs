const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Users = require("../models/user.model");
const Brand = require("../models/brand.model");
const Material = require("../models/material.model");
const Inventory = require("../models/inventory.model");
const Order = require("../models/order.model");

exports.getIndexShop = (req, res, next) => {
    Order.find().then((data) => {
      console.log(data)
    })
    res.render('index', { title: 'Shop', user: req.user, cart: req.session.cart });
}

exports.getProducts = (req, res, next) => {
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
                //console.log(prod)
               }
            })
           
            res.render("./shop/product/products", {
              title: "Trang chủ",
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

exports.getProductDetail = (req, res, next) => {
  var promises = [];
  var productId = req.params.productId;
  var brand = '';
  var material = '';
  var listSize = [];
  var listColor = new Array;
  
  Product.findById(productId, function(err, data) {
    if (err) console.log(err);
    else
    {
      data.viewCounts += 1/2;
      data.save();
    
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
            cart: req.session.cart
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

exports.getProductFilter = (req, res, next) => {
  var listProduct = [];
  Product.find()
    .limit(8)
    .then(products => {
      Product.find()
        .limit(2)
        .sort({"viewCounts": -1})
        .then(products2 => {
      
            products2.forEach((prod) => {
                if (prod.price > 0)
               {
                listProduct.push(prod);
                
               }
            })

            res.sendFile(path.join(__dirname, '../public', 'shop/product/products.ejs'), listProduct)
           
            // res.render("./shop/product/products", {
            //   title: "Trang chủ",
            //   user: req.user,
            //   trendings: products,
            //   products: listProduct,
            //   cart: req.session.cart
            // });
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
                //console.log(prod)
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
      res.redirect('/shop');
    } 
  })
  );

}