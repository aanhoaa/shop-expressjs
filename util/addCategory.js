require('dotenv').config();

const mongoose = require("mongoose");
const Category = require('../models/category.model');

const urlConnect = process.env.DB;
// Connect to database
mongoose.connect(urlConnect, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
  if (err) {
    console.log("Fail to connect db");
  }
  console.log('Connect successfullyy!!');

  // var shirtCate = new Category({
  //   name: "Áo"
  // });

  var trousersCate = new Category({
    name: "Quần"
  });

  // var shoesCate = new Category({
  //   name: "Giày"
  // });

  // var accessoriesCate = new Category({
  //   name: "Phụ kiện"
  // });

  // shirtCate.save(function(err) {
  //   if (err) throw err;
  //   console.log("Shirt Category successfully saved.");
  // });

  trousersCate.save(function(err) {
    if (err) throw err;
    console.log("Trousers Category successfully saved.");
  });

  // shoesCate.save(function(err) {
  //   if (err) throw err;
  //   console.log(" Shoes Category successfully saved.");
  // });

  // accessoriesCate.save(function(err) {
  //   if (err) throw err;
  //   console.log(" Accessories Category successfully saved.");
  // });

});
