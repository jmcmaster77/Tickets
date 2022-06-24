const express = require("express");
const rutas = express.Router();

rutas.get("/", (req, res) => {
  res.render("index");


});
module.exports = rutas;
