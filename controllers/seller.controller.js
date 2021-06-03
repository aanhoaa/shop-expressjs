const passport = require("passport");
const multer = require('multer');
const User = require("../models/user.model");
const Category = require("../models/category.model");
const Material = require("../models/material.model");
const Brand = require("../models/brand.model");
const Product = require("../models/product.model");
const Supplier = require("../models/supplier.model");
const Inventory = require("../models/inventory.model");
const Import = require("../models/import.model");
const { count } = require("../models/user.model");
const Order = require("../models/order.model");
const db = require('../helpers/db.helper');
const cloudinary = require('cloudinary');
var bcrypt = require("bcryptjs");
const jwtHelper = require("../helpers/jwt.helper"); 

cloudinary.config({
    cloud_name: 'do3we3jk1',
    api_key: 554259798325127,
    api_secret: 'EidUs6TZ54dIS1HRxdurHuQS4hw'
});

// SET STORAGE
var storage = multer.diskStorage({});

var upload = multer({ storage: storage });

exports.handleImg = upload.fields([
    {
        name: 'image_product',
        maxCount: 1
    },
    {
        name: 'image_product_multiple1',
        maxCount: 1
    },
    {
        name: 'image_product_multiple2',
        maxCount: 1
    },
    {
        name: 'image_product_multiple3',
        maxCount: 1
    }
])

exports.getLogin = (req, res, next) => {  
    if (req.session.token) 
    res.redirect('/seller');
    else
    res.render('shop/admin/login');
}

exports.postLogin = async (req, res, next) => {
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
        req.session.shopInfo = userInfo;
        const accessToken = await jwtHelper.generateToken(userInfo, 'secret', '1h');

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
    const shopId = req.jwtDecoded.data.id;
    var oData = new Array;
    const data = await db.getProductByShop([shopId]);

    for(let i = 0; i< data.length; i++) {
        var info = await db.getProductVariantInfo([data[i].id]);
        var violate = '';
        if (data[i].status == -1) {
            violate = await db.getProductViolate([data[i].id]);
        }
        if (violate != '') {
            var time = violate[0].updated_at.toString();
            
            oData.push(
                {
                    name: data[i].name, sku: data[i].sku, classify: info, 
                    id: data[i].id, status: data[i].status,
                    vname: violate[0].name, vreason: violate[0].reason, 
                    vsuggestion: violate[0].suggestion, vtime: getdate(time.substring(0, time.length-1))
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
    
    res.render('./admin/index', {data: oData})
}

exports.getCategory = (req, res, next) => {
    res.render('./admin/category/category');
}

exports.getAddCategory = (req, res, next) => {
    const message = req.flash("error")[0];
    res.render('./admin/category/addCategory');
}

exports.postAddCategory = (req, res, next) => { 
    Category.findById(req.body.id, function(err, data) {
        if (err) console.log(err);
        else {
            data.childCateName.push({childName: req.body.childCateName});
            data.save();
            req.flash('success_msg', 'Thêm thành công');
            res.redirect('/admin/category/add/');
        }
    });
}

exports.getEditCategory = (req, res, next) => {
    var parentId = req.params.parentId;
    var childId = req.params.childId;

    Category.find().then((data)=>{
        res.render('./admin/category/editCategory', {parentId: parentId, childId: childId, data: data});
    })
}

exports.postEditCategory = (req, res, next) => {
    var parentId = req.params.parentId;
    var childId = req.params.childId;

    Category.findById(parentId, function(err, data){
        if (err) console.log(err);
        else {
            data.childCateName.forEach((item)=>{
                if (item._id == childId)
                {
                    item.childName = req.body.childCateName;
                    data.save();
                    res.redirect('/admin/category/');
                }
            })
        }
    })
}

exports.getDeleteCategory = (req, res, next) => {
    var parentId = req.params.parentId;
    var childId = req.params.childId;

    Category.findById(parentId, function(err, data){
        if (err) console.log(err);
        else {
            data.childCateName.forEach((item)=>{
                if (item._id == childId)
                {
                    var index = data.childCateName.indexOf(item);
                    
                    if (index > -1)
                    {
                        data.childCateName.splice(index, 1);
                        data.save();
                        res.redirect('/admin/category/');
                    }
                }
            })   
        }
    })
}

exports.getAddProduct = async (req, res, next) => {
   
    const data = await db.getCategoryLevelOne();
    
    res.render('./admin/product/addProduct', {data: data});
}

exports.getBindingCategory = async (req, res, next) => {
    var parentId = req.params.parentId;
    var bind = new Array;

    const data = await db.getCategoryLevelTwo([parentId]);
    data.forEach(item => {
        bind.push({id: item.id, name: item.name});
    })

    res.send(JSON.stringify(bind));
}

exports.postAddProduct = async (req, res, next) => {
    const shopId = req.jwtDecoded.data.id;
    const SKU = '';
    const price = 0;
    const stock = 0;
    const status = 0;
    const {brand, cate1, cate2, material, name, sku, description, size, color} = req.body;
    var arrSize, arrColor;
    var arrVariantId = [];
    const imgCover = req.files.path;

    //check before save db
    if (brand == '' || cate1 == '' || cate2 == '' || name == '' || material == '' || imgCover == '')
        return res.status(500).json();

    if (size != '' || color != '') {
        //save to variant detail
        if (size != '')
            arrSize = size.split(',');
        else arrSize = [1];
        if (color != '')
            arrColor = color.split(',');
        else arrColor = [1];

        arrSize.forEach(item => {
            arrColor.forEach(async i => {
                
                if (item == 1)
                    var saveVD = [{Color: i}];
                else if (i == 1) {
                    var saveVD = [{Size: item}];
                } else {
                    var saveVD = [{Size: item, Color: i}];
                }
                
                var variantId = await db.insertVariantDetail(saveVD);
                if (variantId) arrVariantId.push(variantId);
                else return res.status(500).json();
            })
        })
        
    }

    //save to product
    const savePD = [cate1, cate2, shopId, name , description, status, material, sku];
    const productId = await db.insertProduct(savePD);

   if (productId) {
    //save to images
    const saveImgCover =  await cloudinary.v2.uploader.upload(req.files['image_product'][0].path);
    const imgCover = saveImgCover.secure_url;
    var sub1 = '';
    var sub2 = '';
    var sub3 = '';

    if (req.files['image_product_multiple1']) {
        var saveImgSub =  await cloudinary.v2.uploader.upload(req.files['image_product_multiple1'][0].path);
        sub1 = saveImgSub.secure_url;
    }
    else sub1 = '';

    if (req.files['image_product_multiple2']) {
        var saveImgSub =  await cloudinary.v2.uploader.upload(req.files['image_product_multiple2'][0].path);
        sub2 = saveImgSub.secure_url;
    }
    else sub2 = '';

    if (req.files['image_product_multiple3']) {
        var saveImgSub =  await cloudinary.v2.uploader.upload(req.files['image_product_multiple3'][0].path);
        sub3 = saveImgSub.secure_url;
    }
    else sub3 = '';
    
   var imgSave = {cover: imgCover, sub1: sub1, sub2: sub2, sub3: sub3};

   var saveToImg = await db.insertImages([productId, imgSave]);

    //save to product variant
    if (arrVariantId != '') {
        arrVariantId.forEach(async variant_id => {
            var savePDV = [productId, variant_id, name, SKU, price, stock];
            var productVariantId = await db.insertProductVariant(savePDV);
            
            if (productVariantId)
                res.redirect('/seller');
            else res.status(500).json({status: 'Thêm thất bại'});
        })
    }
    else {
        //productvariant without variant
        var savePDV = [productId, 1, name, SKU, price, stock];
        var productVariantId = await db.insertProductVariant(savePDV);

        if (productVariantId)
            res.redirect('/seller');
        else res.status(500).json({status: 'Thêm thất bại'});
    }
   }
}

exports.getEditProduct = async (req, res, next) => {
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
        arrSize.push(i.Size);
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
    
    res.render('./admin/product/editProduct', {
        name: productInfo[0].name,
        category1: cate1,
        category2: cate2,
        cate1: productInfo[0].categorylevel1_id,
        cate2: productInfo[0].categorylevel2_id,
        sku: productInfo[0].sku,
        size: strSize, 
        color: strColor,
        imgCover: img[0].url.cover,
        imgSub: arrImgSub
    }); 
}

exports.postEditProduct = async (req, res, next) => {
    var productId = req.params.productId;
    const {cate1, cate2, material, name, sku, description} = req.body;
    var arrImg = [];

    //check before update
    if (cate1 == '' || cate2 == '' || name == '' || material == '')
        return res.status(500).json();

    const uProduct = [name, cate1, cate2, sku, material, description, productId];
    const update = await db.updateProduct(uProduct);

    //handle img
    const img = await db.getImages([productId]);

    var sub1 = img[0].url.sub1;
    var sub2 = img[0].url.sub2;
    var sub3 = img[0].url.sub3;
    var saveImgCover = img[0].url.cover;

    if (req.files['image_product'])
    {
        const upToCloud =  await cloudinary.v2.uploader.upload(req.files['image_product'][0].path);
        saveImgCover = upToCloud.secure_url;
    }

    if (sub1 != '') {
        if (!req.body.img1)
            sub1 = '';
    }

    if (sub2 != '') {
        if (!req.body.img2)
            sub2 = '';
    }

    if (sub2 != '') {
        if (!req.body.img2)
            sub2 = '';
    }

    if (req.files['image_product_multiple1']) {
        var saveImgSub =  await cloudinary.v2.uploader.upload(req.files['image_product_multiple1'][0].path);
        sub1 = saveImgSub.secure_url;
    }

    if (req.files['image_product_multiple2']) {
        var saveImgSub =  await cloudinary.v2.uploader.upload(req.files['image_product_multiple2'][0].path);
        sub2 = saveImgSub.secure_url;
    }

    if (req.files['image_product_multiple3']) {
        var saveImgSub =  await cloudinary.v2.uploader.upload(req.files['image_product_multiple3'][0].path);
        sub3 = saveImgSub.secure_url;
    }
    
   var imgUpdate = {cover: saveImgCover, sub1: sub1, sub2: sub2, sub3: sub3};

   const updateImg = await db.updateImages([imgUpdate, productId]);
    
    if (update && updateImg) res.redirect('/seller');
    else return res.status(500).json();
}

exports.getEditProductVariant = async (req, res, next) => {
    const productId = req.params.productId;
    const data = await db.getProductVariantInfo([productId]);

    res.render('./admin/inventory/inventoryDetail', {data: data})
}

exports.postEditProductVariant = async (req, res, next) => {
    const {productId, sku, price, stock, width, length, height, weight} = req.body;
    var count = 0;

    for(let i = 0; i < productId.length; i++) {
        if (sku[i] == '--') sku[i] = '';
        var dataUpdate = [sku[i], price[i], stock[i], width[i], length[i], height[i], weight[i], productId[i]];
        var updateDB = await db.updateProductVariant(dataUpdate);
        if (updateDB == true) count++;
    }

    if (count == productId.length)res.send({ state: 1 });
    else res.send({ state: 0 });
}

exports.postShowProduct = async (req, res, next) => {
    const productId = req.params.productId;

    const data = await db.getProductVariantInfo([productId]);
    var count = 0;
    data.forEach(item => {
       if (item.price <= 1000) 
       count++;
    })

    if (count > 0) {
        return res.send({ state: 0 });  
    }

    if (data[0].status == 1)
        var updateDB = await db.updateProductStatus([0, productId]);
    else var updateDB = await db.updateProductStatus([1, productId]); 

    if (updateDB) res.send({ state: 1});
}

exports.postDeleteProduct = async (req, res, next) => {

    if (!req.body.arrProduct)
        return res.status(500).json();

    const arrProduct = req.body.arrProduct;
    var str = '';
    var arrId = [];
    var arrVariantId = [];
    
    for(let i = 0; i < arrProduct.length + 1; i++) {
       if (i > 0) {
        if (i == arrProduct.length) {
            str+= `$${i}`;
        }
         else str+= `$${i}, `;
       }

        if (i < arrProduct.length) {
            arrId.push(arrProduct[i]);
            var data = await db.getProductVariant([arrProduct[i]]);
            data.forEach(item => {
                arrVariantId.push(item.variant_id);
            })
        }
    }

    var strVar = '';
    var arrVar = [];

    for(let i = 0; i < arrVariantId.length + 1; i++) {
        if (i > 0) {
         if (i == arrVariantId.length) {
            strVar+= `$${i}`;
         }
          else strVar+= `$${i}, `;
        }
 
         if (i < arrVariantId.length) {
             arrVar.push(arrVariantId[i]);
         }
    }

    const deleteProduct = await db.deleteProduct(arrId, str);
    const deleteProductV = await db.deleteProductVariant(arrId, str);
    const deleteProductI = await db.deleteProductIamges(arrId, str);
    const deleteVariantDetail = await db.deleteVariantDetail(arrVar, strVar);

    if (deleteProduct && deleteProductV && deleteProductI && deleteVariantDetail) res.send({ state: 1});
    else res.status(500).json();
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
    
    const shopId = req.session.shopInfo.id;
    const arrData = await db.getOrderByShopId([shopId]);
  
    const all = [];
    arrData.map(item => {
     if (item.status == type || type == 5) {
        const order_id = item.order_id;
        const shop_id = item.shop_id;
        const pdv_id = item.pdv_id;
        if (all.findIndex(x => x.orderId == order_id) < 0){
          
          all.push({
            orderId: order_id,
            status: item.status,
            username: item.username,
            payment: item.payment_id,
            province: item.province,
            district: item.district,
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
            fee: item.shippingfee
          })
        }
     }
    })
  
    res.render('./admin/order/order', {data: all, type: type});
}

exports.getOrderDetail = async (req, res, next) => {
    const orderId = req.params.orderId;
    const address = await db.getOrderAddressById([orderId]);
    const products = await db.getOrderDetailByOrderId([orderId])
    const orderInfo = await db.getOrderById([orderId]);
    
    res.render('./admin/order/orderDetail', {info: orderInfo, address: address, products: products});
}

exports.putDeliveryOrder = async (req, res, next) => {
    const orderId = req.body.orderId;
    if (orderId) {
        const update = await db.updateOrder([2, orderId]);
        if (update == true) return res.send({state: 1});
        else return res.send({state: 0});
    }
    else res.send({state: -1});
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
