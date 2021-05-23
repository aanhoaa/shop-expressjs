const db = require('../helpers/db.helper');
var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwtHelper = require("../helpers/jwt.helper"); 
const Validator = require("fastest-validator");
const mailer = require('../helpers/mailer');
const fs = require('fs');

exports.getUserProfile = async (req, res, next) => {
  const data = await db.getUserInfo(2, [req.jwtDecoded.data.username]);
  const userInfo = {
    username: data.username,
    gender: data.gender
  }

  const birthday = getdate(data.birthday);
  if (data) {
    res.render('auth/user/user-profile', {userInfo: userInfo, user: data, birthday: birthday, cart: req.session.cart});
  }
};

exports.postUserProfile = async (req, res, next) => {
  const v = new Validator();
  const schema = {
    fullname: {type: 'string'},
    email: {type: 'email'},
    phone: { type: "string", positive: true, integer: true, length: 10},
    gender: {type: "number", numberMin: 0, numberMax: 2, integer: true, length: 1, 
    custom: (v, error) => {
      if (v < 0 || v > 2) errors.push({ type: "gender false" });
      return v;
    }
    },
    birthday: {type: "date"}
  };

  const check = v.compile(schema);
  const userInfo =  { 
    fullname: req.body.fullname,
    email: req.body.email,
    phone: req.body.phone,
    gender: req.body.gender * 1,
    birthday: new Date(req.body.birthday)
  } 

  const getCheck = await check(userInfo);
  if (getCheck == true) {
    //update
    const update = await db.updateUserProfile([
        req.jwtDecoded.data.id, userInfo.fullname, 
        userInfo.email, userInfo.phone, userInfo.gender, userInfo.birthday
    ]);
      
    if (update == true) res.redirect('/user/account/profile');
    else res.status(500).json({state: 0, type: 'Update fail'});
  }
  else return res.status(500).json({state: 0, type: getCheck});
};

exports.getUserAddressBook = async (req, res, next) => {
  const data = await db.getUserInfo(2, [req.jwtDecoded.data.username]);
  const userInfo = {
    username: data.username,
    gender: data.gender
  }

  const addressDB = await db.getUserAddressBook([req.jwtDecoded.data.id]);
  if (data) {
    res.render('auth/user/user-addressBook', {userInfo: userInfo, user: data, cart: req.session.cart, address: addressDB});
  }
};

exports.postUserAddressBook = async (req, res, next) => {
  const v = new Validator();
  const schema = {
    fullname: 'string',
    phone: {type: 'string', length: 10},
    city: 'string|length:2',
    district: 'string|length:3',
    ward: 'string|length:5',
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
    //save db
    //save to identity
    try {
      const exist = await db.getUserAddressBookExist([req.jwtDecoded.data.id]);
      const ident_id = await db.insertUserIdentityDetail([address.identity]);

      if (ident_id) {
        const ward_id = await db.insertUserWard([ident_id, address.ward, address.nameWard]);
        if (ward_id) {
          const district_id = await db.insertUserDistrict([ward_id, address.district, address.nameDistrict]);
          if (district_id) {
            const province_id = await db.insertUserProvince([district_id, address.city, address.nameCity]);
            if (province_id) {
              const addressBook = await db.insertUserAddressBook([req.jwtDecoded.data.id, province_id, address.fullname, address.phone]);
              if (exist == false) {
                const addressBook = await db.insertUserAddressBook([req.jwtDecoded.data.id, province_id, address.fullname, address.phone, 1]);
                if (addressBook == true) res.redirect('/user/account/address');
                else res.status(500).json({state: 0, type: 'Address fail'});
              }
              else {
                const addressBook = await db.insertUserAddressBook([req.jwtDecoded.data.id, province_id, address.fullname, address.phone, 0]);
                if (addressBook == true) res.redirect('/user/account/address');
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
};

exports.postUpdateAddressBook = async (req, res, next) => {
  const bookId = req.params.bookId;
  const v = new Validator();
  const schema = {
    fullname: 'string',
    phone: {type: 'string', length: 10},
    city: 'string|length:2',
    district: 'string|length:3',
    ward: 'string|length:5',
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
          console.log([addressDB[0].province_id, address.city, address.nameCity])
          const updateProvince = await db.updateUserProvince([addressDB[0].province_id, address.city, address.nameCity]);
          const updateDistrict = await db.updateUserDistrict([addressDB[0].district_id, address.district, address.nameDistrict]);
          const updateWard = await db.updateUserWard([addressDB[0].ward_id, address.ward, address.nameWard]);
          console.log(updateProvince)
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
      res.redirect('/user/account/address');
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
  const addressDB = await db.getUserAddressBook([req.jwtDecoded.data.id]);
  
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
        res.send({ state: 1});
      }
    }
  }
  res.status(500).json({status: 'Set default fail'});
}

exports.getCity = async (req, res, next) => {
  var bind = new Array;
  let rawdata = fs.readFileSync('helpers/address.json');
  let address = JSON.parse(rawdata);

  address.forEach(iCity => {
    bind.push({id: iCity.Id, name: iCity.Name});
  })
  
  res.send(JSON.stringify(bind));
}

exports.getBindingDistrict = async (req, res, next) => {
  const cityID = req.query.cityId;
  var district;
  var bind = new Array;

  let rawdata = fs.readFileSync('helpers/address.json');
  let address = JSON.parse(rawdata);

  address.forEach(city => {
    if (city.Id == cityID) {
      district = city.Districts;
    }
  })
  
  if (district != '') {
    district.forEach(item => {
      bind.push({id: item.Id, name: item.Name});
    })
    res.send(JSON.stringify(bind));
  }
  else res.status(500).json({err: 'Load fail'});
}

exports.getBindingWard = async (req, res, next) => {
  const cityID = req.query.cityId;
  var districtID = req.query.districtId;
  var ward;
  var bind = new Array;

  let rawdata = fs.readFileSync('helpers/address.json');
  let address = JSON.parse(rawdata);

  address.forEach(iCity => {
    if (iCity.Id == cityID) {
        iCity.Districts.forEach(iDistrict => {
          if (districtID == iDistrict.Id) {
            ward = iDistrict.Wards;
          }
        })
    }
  })
  
  if (ward != '') {
    ward.forEach(item => {
      bind.push({id: item.Id, name: item.Name});
    })
    res.send(JSON.stringify(bind));
  }
  else res.status(500).json({err: 'Load fail'});
}

exports.getChangePassword = async (req, res, next) => {
  var message = req.flash("info");
  const data = await db.getUserInfo(2, [req.jwtDecoded.data.username]);
  const userInfo = {
    username: data.username,
    gender: data.gender
  }

  res.render('auth/user/user-changePassword', {userInfo: userInfo, cart: req.session.cart, message: message});
}

exports.postChangePassword = async (req, res, next) => {
  const v = new Validator({
    useNewCustomCheckerFunction: true, // using new version
    messages: {
      unique: "Mật khẩu không chính xác"
  }
  });
  const schema = {
    $$async: true,
    password: {type: 'string', min: 6, 
    custom: async (v, error) => {
      const data = await db.getUserInfo(2, [req.jwtDecoded.data.username]);
      if (data) {
        const checkPass = await bcrypt.compare(v, data.password);
        if (!checkPass) {
            error.push({ type: "password wrong", actual: 'password not true', state: 0 });
        }

        return v;
      }
    }
    },
    newpassword: 'string|min:6',
    confirmpassword: 'string|min:6'
  }

  const check = v.compile(schema);
  const changePassword = {
    password: req.body.password,
    newpassword: req.body.newpassword,
    confirmpassword: req.body.confirmpassword
  }

  const getCheck = await check(changePassword);
  if (getCheck == true) {
    if (changePassword.newpassword != changePassword.confirmpassword) {
      return res.status(500).json({error: 'Xác nhận mật khẩu sai'});
    }

    //update db
    const hash = bcrypt.hashSync(changePassword.newpassword, 10);
    const update = await db.updateUserPassword([req.jwtDecoded.data.id, hash]);

    if (update) res.redirect('/user/account/profile');
    else res.status(500).json({state: 0, type: 'Change password fail'});

  }
  else {
    var count = 0;
      getCheck.forEach(i => {
        if (i.state == 0) {
          count ++;
        }
      })

      if (count > 0) {
        req.flash('info', 'Mật khẩu không chính xác');
        res.redirect('/user/account/password');
      }
      else res.status(500).json({error: getCheck});
  }
}

exports.postReset = async (req, res, next) => {
  const data = await db.getUserInfo(2, [req.jwtDecoded.data.username]);
    const generate = makeid(10);
    const hash = bcrypt.hashSync(generate, 10);

    const update = await db.updateUserPassword([req.jwtDecoded.data.id, hash]);

    if (update){
      //send mail
      let send = await mailer.sendMailResetPassword(generate, data.email);
      if (send == true)  res.send({ state: 1});
      else res.status(500).json({err: 'Fail'});
    }
}

//functional
function getdate(tt) {
  var date = new Date(tt);
  var newdate = new Date(date);
  
  var dd = newdate.getDate();
  var mm = newdate.getMonth() + 1;
  var y = newdate.getFullYear();

 
  var someFormattedDate = mm + '/' + dd + '/' + y;
  return someFormattedDate;
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