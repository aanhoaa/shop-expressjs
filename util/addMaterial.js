require('dotenv').config();

const mongoose = require("mongoose");
const Material = require('../models/material.model');

const urlConnect = process.env.DB;
// Connect to database
mongoose.connect(urlConnect, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
  if (err) {
    console.log("Fail to connect db");
  }
  console.log('Connect successfullyy!!');

  var cottonMate = new Material({
    name: "Cotton"
  });

  var lenMate = new Material({
    name: "Len"
  });
  
  var longcuuMate = new Material({
    name: "Lông cừu"
  });

  var kakiMate = new Material({
    name: "Kaki"
  });

  cottonMate.save(function(err) {
    if (err) throw err;
    console.log("Trousers Category successfully saved.");
  });

  lenMate.save(function(err) {
    if (err) throw err;
    console.log("Trousers Category successfully saved.");
  });

  longcuuMate.save(function(err) {
    if (err) throw err;
    console.log("Trousers Category successfully saved.");
  });

  kakiMate.save(function(err) {
    if (err) throw err;
    console.log("Trousers Category successfully saved.");
  });

});
