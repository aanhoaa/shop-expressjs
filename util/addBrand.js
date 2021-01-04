require('dotenv').config();

const mongoose = require("mongoose");
const Brand = require('../models/brand.model');

const urlConnect = process.env.DB;
// Connect to database
mongoose.connect(urlConnect, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
  if (err) {
    console.log("Fail to connect db");
  }
  console.log('Connect successfullyy!!');

  var zaraBrand = new Brand({
    name: "Zara"
  });

  var mangoBrand = new Brand({
    name: "Mango"
  });
  
  var gucciBrand = new Brand({
    name: "Gucci"
  });

  var supermeBrand = new Brand({
    name: "Superme"
  });

  zaraBrand.save(function(err) {
    if (err) throw err;
    console.log("Zara Brand successfully saved.");
  });

  mangoBrand.save(function(err) {
    if (err) throw err;
    console.log("Mango Brand successfully saved.");
  });

  gucciBrand.save(function(err) {
    if (err) throw err;
    console.log("Gucci Brand successfully saved.");
  });

  supermeBrand.save(function(err) {
    if (err) throw err;
    console.log("Superme Brand successfully saved.");
  });
});
