const passport = require("passport");
const multer = require('multer');
const Category = require("../models/category.model");

const db = require('../helpers/db.helper');
const cloudinary = require('cloudinary');
var bcrypt = require("bcryptjs");
const jwtHelper = require("../helpers/jwt.helper"); 
const Validator = require("fastest-validator");

cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.APIKEY,
    api_secret: process.env.APISECRET
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

exports.postRegister = async (req, res, next) => {  
    const v = new Validator({
        useNewCustomCheckerFunction: true, 
        messages: {
          unique: "The username is already exist"
      }
      });
      const schema = {
        $$async: true,
        fullname: {type: 'string'},
        phone: {type: 'string', min: 10, max: 10},
        address: {type: 'string'},
        name: {type: 'string'},
        username: {
          type: 'string', min: 6, max: 255,
          custom: async (username, errors) => {
            const data = await db.checkExistShopByName([username]);
            if (data == true) {
              errors.push({ type: "unique", actual: 123 });
            }
            return username;
          }
        },
        email: {type: 'email'},
        password: {type: 'string', min: 6, max: 50},
        repassword: {type: 'string', min: 6, max: 50},
      }
  
      const check = v.compile(schema);
      const user = {
        fullname: req.body.fullname,
        phone: req.body.phone,
        address: req.body.address,
        username: req.body.username,
        email: req.body.email,
        name: req.body.name,
        password: req.body.password,
        repassword: req.body.repassword
      }
      const getCheck = await check(user);

      if (getCheck == true) {
        //save to db
        //const save = await db.insertUser(Object.values(user));
        if (user.repassword == user.password) {
          // create confirm token email
          const confirmToken = makeid(10);
          const hash = bcrypt.hashSync(user.password, 10);
          const userId = await db.insertShop([user.fullname, user.phone, user.email, user.name, user.username, hash, user.address]);
          if (userId)
          {
            //get data
            const userInfo = {
              id: userId,
              username: user.username,
              role: 'shop',
            };
  
            const accessToken = await jwtHelper.generateToken(userInfo, process.env.SECRETKEY, '1h');
            req.session.token = accessToken;
            req.session.shopInfo = userInfo;
            //screen waiting for approve
            return res.redirect('/seller');
          }
        }
        else {
          req.flash('info', 'Xác nhận mật khẩu không khớp');
          res.redirect('/register');
        }
      }
      else {
        var count = 0;
        getCheck.forEach(i => {
          if (i.actual == 123) {
            count ++;
          }
        })
  
        if (count > 0) {
          req.flash('info', 'Tài khoản đã tồn tại');
          res.redirect('/register');
        }
        else res.status(500).json({state: 0});
      }
}

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
        const accessToken = await jwtHelper.generateToken(userInfo, process.env.SIGNATURETOKEN, '1h');
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
  //res.render('./admin/dashboard')
    const shopId = req.jwtDecoded.data.id;
    var oData = new Array;
    const data = await db.getProductSeller([shopId]);

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
    res.render('./admin/index', {seller: req.session.shopInfo, data: oData})
}

exports.getAddressBook = async (req, res, next) => {
  const addressDB = await db.getShopAddressBook([req.jwtDecoded.data.id]);

  res.render('./admin/profile/address-book', {seller: req.session.shopInfo, address: addressDB});
}

exports.postAddressBook = async (req, res, next) => {
    const v = new Validator();
    const schema = {
    fullname: 'string',
    phone: {type: 'string', length: 10},
    city: 'string',
    district: 'string',
    ward: 'string',
    identity: 'string|min:3|max: 50',
    nameCity: 'string',
    nameDistrict: 'string',
    nameWard: 'string',
  }
  const check = v.compile(schema);
  const address = {
    fullname: req.body.fullname,
    phone: req.body.phone,
    city: req.body.city,
    district: req.body.district,
    ward: req.body.ward,
    identity: req.body.identity,
    nameCity: req.body.nameCity,
    nameDistrict: req.body.nameDistrict,
    nameWard: req.body.nameWard
  }
  const getCheck = await check(address);
  if (getCheck == true) {
      const seller = req.session.shopInfo;
    //save db
    //save to identity
    try {
      const exist = await db.getUserAddressBookExist(2, [seller.id]);
      const ident_id = await db.insertUserIdentityDetail([address.identity]);

      if (ident_id) {
        const ward_id = await db.insertUserWard([ident_id, address.ward, address.nameWard]);
        if (ward_id) {
          const district_id = await db.insertUserDistrict([ward_id, address.district, address.nameDistrict]);
          if (district_id) {
            const province_id = await db.insertUserProvince([district_id, address.city, address.nameCity]);
            if (province_id) {
              if (exist == false) {
                const addressBook = await db.insertShopAddressBook([0, seller.id, province_id, address.fullname, address.phone, 1]);
                if (addressBook == true) res.redirect('/seller/profile/address-book');
                else res.status(500).json({state: 0, type: 'Address fail'});
              }
              else {
                const addressBook = await db.insertShopAddressBook([0, seller.id, province_id, address.fullname, address.phone, 0]);
                if (addressBook == true) res.redirect('/seller/profile/address-book');
                else res.status(500).json({state: 0, type: 'Address fail'});
              }
            }
          }
        }
      }
    }
    catch (error) {
      return res.status(500).json({state: 0, type: 'Save fail'});
    }  
  }
  else return res.status(500).json({state: 0, type: getCheck});
}

exports.postUpdateAddressBook = async (req, res, next) => {
    const bookId = req.params.bookId;
    const v = new Validator();
    const schema = {
      fullname: 'string',
      phone: {type: 'string', length: 10},
      city: 'string',
      district: 'string',
      ward: 'string',
      identity: 'string|min:3|max: 50',
      nameCity: 'string',
      nameDistrict: 'string',
      nameWard: 'string',
    }
    const check = v.compile(schema);
    const address = {
      fullname: req.body.fullname,
      phone: req.body.phone,
      city: req.body.city,
      district: req.body.district,
      ward: req.body.ward,
      identity: req.body.identity,
      nameCity: req.body.nameCity,
      nameDistrict: req.body.nameDistrict,
      nameWard: req.body.nameWard
    }
    const getCheck = await check(address);
  
    if (getCheck == true) {
      try {
        const addressDB = await db.getAddressBookById([bookId]);
        if (addressDB) {
          if (addressDB[0].fullname != address.fullname 
              || addressDB[0].phone != address.phone) {
              //update addressbook
              const updateAB = await db.updateUserAdressBook([addressDB[0].book_id, address.fullname, address.phone]);
          }
  
          if (addressDB[0].province_code != address.city) {
            //update all
            const updateProvince = await db.updateUserProvince([addressDB[0].province_id, address.city, address.nameCity]);
            const updateDistrict = await db.updateUserDistrict([addressDB[0].district_id, address.district, address.nameDistrict]);
            const updateWard = await db.updateUserWard([addressDB[0].ward_id, address.ward, address.nameWard]);
          }
          else if (addressDB[0].district_code != address.district) {
            //update district
            //update ward
            const updateDistrict = await db.updateUserDistrict([addressDB[0].district_id, address.district, address.nameDistrict]);
            const updateWard = await db.updateUserWard([addressDB[0].ward_id, address.ward, address.nameWard]);
          }
          else  if (addressDB[0].ward_code != address.ward){
            //update ward
            const updateWard = await db.updateUserWard([addressDB[0].ward_id, address.nameWard]);
          }
  
          if (addressDB[0].identity_name != address.identity) {
            //update identity
            const updateWard = await db.updateUserIdentity([addressDB[0].identity_id, address.identity]);
          }
        }
        else res.status(500).json({state: 0, type: getCheck});
        res.redirect('/seller/profile/address-book');
      }
      catch (error) {
        return res.status(500).json({state: 0, type: 'Update fail', err: error});
      }  
    }
}

exports.postDeleteAddressBook = async (req, res, next) => {
    const bookID = req.body.bookID;
    const addressDB = await db.getAddressBookById([bookID]);
    if (addressDB != false) {
      //delte addB
      const deleteAB = await db.deleteUserAddressBook([bookID]);
      const deleteP = await db.deleteUserProvince([addressDB.province_id]);
      const deleteD = await db.deleteUserDistrict([addressDB.district_id]);
      const deleteW = await db.deleteUserWard([addressDB.ward_id]);
      const deleteIdentity = await db.deleteUserIdentityDetail([addressDB.identity_id]);
  
      if (deleteAB) {
        res.send({ state: 1});
      }
      else res.status(500).json({status: 'delete fail'});
    }
    else res.status(500).json({status: 'delete fail'});
}
  
exports.postSetAddressDefault = async (req, res, next) => {
const bookID = req.body.bookID;
const addressDB = await db.getShopAddressBook([req.jwtDecoded.data.id]);

    if (addressDB != false) {
        var count = 0;
        for (let i = 0; i < addressDB.length; i++) {
        if (addressDB[i].isdefault == 1) {
            const setZero = await db.updateUserAddressBookDefault([addressDB[i].book_id, 0]);
            count++;
        }
        else if (addressDB[i].book_id == bookID) {
            //set to 1
            const setOne= await db.updateUserAddressBookDefault([addressDB[i].book_id, 1]);
            count++;
        }
        if (count == 2) {
            return res.send({ state: 1});
        }
        }
    }
    res.status(500).json({status: 'Set default fail'});
}

exports.getAddProduct = async (req, res, next) => {
  const data = await db.getCategoryHasValue();
  
  res.render('./admin/product/addProduct', {seller: req.session.shopInfo, data: data});
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

exports.getSales = async (req, res, next) => {
  const data = await db.getCategoryLevelTwoByShop([req.session.shopInfo.id]);
  const getVoucher = await db.getVoucher([req.session.shopInfo.id]);

//check db để set status khi hết ngày - nhập code => check ngày kết thúc
  res.render('./admin/sales/sales', {seller: req.session.shopInfo, data: data, voucher: getVoucher});
}

exports.postSales = async (req, res, next) => {
  const data = req.body;
  
  if (data.name == "" || data.category == "" || data.discount == "" || data.dateStart == "" || data.dateEnd == "" || data.code == "")
  return res.status(500).json({status: 'Sale data field missing'});

  try {
    const insert = await db.insertVoucher([data.category, req.session.shopInfo.id, data.name, data.code, 1, data.discount, data.dateStart, data.dateEnd]);
    if (insert == true) return res.redirect('/seller/sales');
    else res.status(500).json({status: 'Insert db fail!!!'});
  } catch (error) {
    console.log('err at create sales', error);
    return error;
  }
}

exports.getEditSales = async (req, res, next) => {
  const voucherId = req.params.voucherId;
  const data = await db.getCategoryLevelTwoByShop([req.session.shopInfo.id]);
  const getVoucher = await db.getVoucherByID([req.session.shopInfo.id, voucherId]);
  var now = Date.now();
  var status = 0;
  var statusStart = fn_DateCompare(now, getVoucher[0].timestart)
  var statusEnd = fn_DateCompare(now, getVoucher[0].timeend)
  if (statusStart < 0 ) status = 1; //chưa diễn ra
  else if (statusEnd < 0) status = 0; // đang
  else status = -1; // đã hết

  res.render('./admin/sales/sales-edit', {
    seller: req.session.shopInfo, 
    data: data,
    voucher: getVoucher,
    status: status
  });
}

exports.postEditSales = async (req, res, next) => {
  const voucherId = req.params.voucherId;
  const data = req.body;
  const getVoucher = await db.getVoucherByID([req.session.shopInfo.id, voucherId]);
  var now = Date.now();
  var status = 0;
  var statusStart = fn_DateCompare(now, getVoucher[0].timestart)
  var statusEnd = fn_DateCompare(now, getVoucher[0].timeend)
  if (statusStart < 0 ) status = 1; //chưa diễn ra
  else if (statusEnd < 0) status = 0; // đang
  else status = -1; // đã hết

  if (status == 1) {
    if (data.name == "" || data.category == "" || data.discount == "" || data.dateStart == "" || data.dateEnd == "")
    return res.status(500).json({status: 'Sale data field missing'});

    const update1 = await db.updateVoucher(1, [data.name, data.dateStart, data.dateEnd, data.category, data.discount, voucherId]);
    return res.redirect('/seller/sales/');
  }

  if (status == 0) {
    if (data.name == "" || data.category == "" || data.dateEnd == "")
    return res.status(500).json({status: 'Sale data field missing'});

    const update2 = await db.updateVoucher(2, [data.name, data.dateEnd, data.category, voucherId]);
    return res.redirect('/seller/sales/');
  }

  if (status == -1) return res.redirect('/seller/sales/');
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
            return res.redirect('/seller');
            else res.status(500).json({status: 'Thêm thất bại'});
        })
    }
    else {
        //productvariant without variant
        var savePDV = [productId, 1, name, SKU, price, stock];
        var productVariantId = await db.insertProductVariant(savePDV);

        if (productVariantId)
            return res.redirect('/seller');
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
        seller: req.session.shopInfo,
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

    res.render('./admin/inventory/inventoryDetail', {seller: req.session.shopInfo,data: data})
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
    const shopId = req.session.shopInfo.id;
    //check to addressbook
    const addBook = await db.getShopAddressBookByShopId([shopId]);
    if (!addBook) {
        return res.send({state: 2});
    }

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
    var orderCount = 0;
    const all = [];
    if (arrData.length > 0)
    arrData.map(item => {
     if (item.status == type || type == 5) {
        const order_id = item.order_id;
        const shop_id = item.shop_id;
        const pdv_id = item.pdv_id;
        if (all.findIndex(x => x.orderId == order_id) < 0){
            orderCount++;
          all.push({
            orderId: order_id,
            status: item.status,
            username: item.username,
            payment: item.payment_id,
            province: item.province,
            district: item.district,
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
            discount: item.discount
          })
        }
     }
    })
  
    res.render('./admin/order/order', {seller: req.session.shopInfo, data: all, type: type, count: orderCount});
}

exports.getOrderDetail = async (req, res, next) => {
    const orderId = req.params.orderId;
    const address = await db.getOrderAddressById([orderId]);
    const products = await db.getOrderDetailByOrderId([orderId])
    const orderInfo = await db.getOrderById([orderId]);

    res.render('./admin/order/orderDetail', {
        seller: req.session.shopInfo,info: orderInfo, 
        address: address, products: products
    });
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

exports.putDeliveredOrder = async (req, res, next) => {
    const orderId = req.body.orderId;
    if (orderId) {
        const info = await db.getUserAndProductByOrderId([orderId]);
        for(let i of info) {
          const updateSelled = await db.updateProductSelled([i.sum, i.id]); 
        }
       
        const products = await db.getOrderDetailByOrderId([orderId]);
        var total = 0;
        for(let i of products) {
          total += i.amount*i.price;
        }
        total += products[0].shippingfee;
        
        //update wallet
        const addWallet = await db.updateShopWallet(orderId, [total, req.session.shopInfo.id]);
        const update = await db.updateOrderAndPaid([3, orderId]);
        console.log(req.session.shopInfo.id, addWallet)
        if (update == true && addWallet == true) {console.log('done') ; return res.send({state: 1});}
        else return res.send({state: 0});
    }
    else res.send({state: -1});
}

exports.getIncome = async (req, res, next) => {
  var type = req.query.type;
  var type1 = 0, type2 = 0;
  switch(type) {
      case 'will-pay':
          type = 0;
          type1 = 0;
          type2 = 3
          break;
      case 'paid':
          type = 3;
          type1 = 2;
          type2 = 4
          break;
      default:
          type = 0;
          type1 = 0;
          type2 = 3;
  } 
  
  const shopInfo = req.session.shopInfo;
  const getWillPay = await db.getShopWillPay([shopInfo.id]);
  var willPay = 0;
  var paidThisWeek = 0;
  var paidThisMonth = 0;
  var paidAll = 0;
  if (getWillPay) willPay = getWillPay.sum == null?0:getWillPay.sum; 
  const getPaidCurrentWeek = await db.getShopPaidCurrentWeek([getMonday(new Date()), getLastSunday(new Date()), shopInfo.id]);
  if (getPaidCurrentWeek) paidThisWeek = getPaidCurrentWeek.sum == null?0:getPaidCurrentWeek.sum;
  const getPaidCurentMonth = await db.getShopPaidCurrentMonth(currentMonth(), [shopInfo.id]);
  if (getPaidCurentMonth) paidThisMonth = getPaidCurentMonth.sum == null?0:getPaidCurentMonth.sum;
  const getPaidAll = await db.getShopPaidAll([shopInfo.id]);
  if (getPaidAll) paidAll = getPaidAll.sum == null?0:getPaidAll.sum;

  //load detail
  const arrData = await db.getOrderByShopId([shopInfo.id]);
  var orderCount = 0;
  const all = [];
  if (arrData.length > 0)
  arrData.map(item => {
    if (item.status >= type1 && item.status < type2 ) {
      const order_id = item.order_id;
      const shop_id = item.shop_id;
      const pdv_id = item.pdv_id;
      if (all.findIndex(x => x.orderId == order_id) < 0){
          orderCount++;
        all.push({
          orderId: order_id,
          status: item.status,
          username: item.username,
          payment: item.payment_id,
          province: item.province,
          district: item.district,
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
          discount: item.discount
        })
      }
    }
  })

  res.render('./admin/finance/income', {
    seller: shopInfo,
    willPay: willPay,
    paidThisWeek: paidThisWeek,
    paidThisMonth: paidThisMonth,
    paidAll: paidAll,
    data: all, 
    type: type, 
    count: orderCount
  });
}

exports.postBindingIncome = async (req, res, next) => {
  const option = req.body.optionSelect;
  if (!option) return res.send({state: 0});

  const shopInfo = req.session.shopInfo;
  const getWillPay = await db.getShopWillPay([shopInfo.id]);
  var willPay = 0;
  var paidThisWeek = 0;
  var paidThisMonth = 0;
  var paidAll = 0;
  if (getWillPay) willPay = getWillPay.sum == null?0:getWillPay.sum; 
  const getPaidCurrentWeek = await db.getShopPaidCurrentWeek([getMonday(new Date()), getLastSunday(new Date()), shopInfo.id]);
  if (getPaidCurrentWeek) paidThisWeek = getPaidCurrentWeek.sum == null?0:getPaidCurrentWeek.sum;
  const getPaidCurentMonth = await db.getShopPaidCurrentMonth(currentMonth(), [shopInfo.id]);
  if (getPaidCurentMonth) paidThisMonth = getPaidCurentMonth.sum == null?0:getPaidCurentMonth.sum;
  const getPaidAll = await db.getShopPaidAll([shopInfo.id]);
  if (getPaidAll) paidAll = getPaidAll.sum == null?0:getPaidAll.sum;

  var type = req.query.type;
  var date1 = '2021-1-1', date2 = '2021-1-10';

  var sql = "";
  switch(option) {
    case '1':
      date1 = getMonday(new Date());
      date2 = getLastSunday(new Date());
      break;
    case '2':
      var date = new Date(), y = date.getFullYear(), m = date.getMonth();
      var firstDay = formatSQLDate(new Date(y, m, 1));
      var lastDay = formatSQLDate(new Date(y, m + 1, 1));
      date1 = firstDay;
      date2 = lastDay;
      break;
    case '3':
      var date = new Date(), y = date.getFullYear(), m = date.getMonth() - 3;
      var firstDay = formatSQLDate(new Date(y, m, 1));
      var lastDay = formatSQLDate(new Date(y, m + 4, 1));
      date1 = firstDay;
      date2 = lastDay;
      break;
  } 

    //load detail
  const arrData = await db.getOrderByShopId([shopInfo.id]);
  var orderCount = 0;
  const all = [];
  arrData.map(item => {
    if (item.status == 3 ) { 
      if (fn_DateCompare(formatSQLDate(item.created_at), date1) >= 0 && fn_DateCompare(formatSQLDate(item.created_at), date2) == -1) {
      const order_id = item.order_id;
      const shop_id = item.shop_id;
      const pdv_id = item.pdv_id;
      if (all.findIndex(x => x.orderId == order_id) < 0){
          orderCount++;
        all.push({
          orderId: order_id,
          status: item.status,
          username: item.username,
          payment: item.payment_id,
          province: item.province,
          district: item.district,
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
          discount: item.discount
        })
      }
    }
  }
  })

  res.render('./admin/finance/income', {
    seller: shopInfo,
    willPay: willPay,
    paidThisWeek: paidThisWeek,
    paidThisMonth: paidThisMonth,
    paidAll: paidAll,
    data: all, 
    type: type, 
    count: orderCount
  });
}

exports.getWallet = async (req, res, next) => {
  const shopInfo = req.session.shopInfo;
  var currency = 0;

  const shop = await db.getShopById([shopInfo.id]);
  if (shop != false) {
    currency = shop[0].wallet;
  }
 
  res.render('./admin/finance/wallet', {
    seller: shopInfo,
    wallet: currency
  });
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

function getMonday(d) {
  d = new Date(d);
  var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
  
  d.setDate(diff);
  var dd = d.getDate();
  var mm = d.getMonth() + 1;
  var yy = d.getFullYear(); 
  var someFormattedDate = yy + '-' + mm + '-' + dd;
  return someFormattedDate;
}

function getLastSunday(d) {
  var t = new Date(d);
  t.setDate(t.getDate() - t.getDay() + 8);
  var dd = t.getDate();
  var mm = t.getMonth() + 1;
  var yy = t.getFullYear(); 
  var someFormattedDate = yy + '-' + mm + '-' + dd;
  return someFormattedDate;
}

function currentMonth() {
  var date = new Date(), y = date.getFullYear(), m = date.getMonth();
  var firstDay = formatSQLDate(new Date(y, m, 1));
  var lastDay = formatSQLDate(new Date(y, m + 1, 1));

  var sql = `a.created_at >= ${firstDay} and a.created_at < ${lastDay}`
  return sql;
}

function formatDate(tt) {
  var date = new Date(tt);
  var MyDate = new Date(date);
  var MyDateString;

  MyDate.setDate(MyDate.getDate());


  MyDateString = ('0' + MyDate.getDate()).slice(-2) + '/' + ('0' + (MyDate.getMonth()+1)).slice(-2) + '/' + MyDate.getFullYear();

  return MyDateString;
}

function formatSQLDate(tt) {
  var date = new Date(tt);
  var MyDate = new Date(date);
  var MyDateString;

  MyDate.setDate(MyDate.getDate());

  MyDateString = "'" + MyDate.getFullYear() + '-' + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-' + ('0' + MyDate.getDate()).slice(-2) + "'";

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

function getDate(tt) {
  var date = new Date(tt);
  var MyDate = new Date(date);
  var MyDateString;

  MyDate.setDate(MyDate.getDate());
  var hour = MyDate.getHours();
  var minutes = MyDate.getMinutes();
  var end = 'AM';
  if (hour > 11) {
    end = 'PM';
    hour -= 12;
  }
 
  MyDateString = ('0' + MyDate.getDate()).slice(-2) + '/' + ('0' + (MyDate.getMonth()+1)).slice(-2) + '/' + MyDate.getFullYear() + ' '+ hour + ':' + minutes + ' ' + end;

  return MyDateString;
}