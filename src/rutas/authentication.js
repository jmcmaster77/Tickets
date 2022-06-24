const express = require("express");
const { mergeFlags } = require("mysql/lib/ConnectionConfig");
const rutas = express.Router();
const passport = require("passport");
const { isLoggedIn, isNotLoggedIn } = require("../lib/auth");

rutas.get("/signin", isNotLoggedIn, (req, res) => {
  res.render("auth/signin");
});

rutas.post("/signin", (req, res, next) => {
  let { usuario_s, clave_s } = req.body;
  if (usuario_s == "") {
    req.toastr.error(
      "El campo usuario no debe estar vacio",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1550",
      })
    );
    res.redirect("/signin");
  } else if (clave_s == "") {
    req.toastr.error(
      "El campo clave no debe estar vacio",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1550",
      })
    );
    res.redirect("/signin");
  } else {
    passport.authenticate("local.signin", {
      successRedirect: "/profile",
      failureRedirect: "/signin",
      failureFlash: true,
    })(req, res, next);
  }
});

// mosca no lo estas utilizando
rutas.get("/signup", isLoggedIn, (req, res) => {
  res.render("auth/signup");
});

// rutas segun perfil

rutas.get("/profile", isLoggedIn, (req, res) => {

  if (req.user.tipo == "Administrador") {
    
    res.render("admin");
  } else if (req.user.tipo == "Usuario") {
    
    res.render("profile");
    // aqui redirijo segun el perfil
  } else if (req.user.tipo == "Promotor") {
    
    res.render("profilep");
    // aqui redirijo segun el perfil
  }
});

rutas.get("/admin", isLoggedIn, (req, res) => {
  if (req.user.tipo == "Administrador") {
    res.render("admin");
  } else {
    res.redirect("/profile");
    // aqui redirijo segun el perfil
  }
});

// seleccion del menu de administrador bebe

rutas.get("/rusuarios", isLoggedIn, (req, res) => {
  if (req.user.tipo == "Administrador") {
    res.render("rusuario");
  } else {
    res.redirect("/profile");
  }
});

//su nombre lo indica

rutas.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

module.exports = rutas;
