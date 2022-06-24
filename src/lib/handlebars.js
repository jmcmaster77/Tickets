const { format } = require("timeago.js");

const helpers = {};

helpers.timeago = (timestamp) => {
  return format(timestamp);
};

function esadministrador(rol) {
  if (rol == "Administrador") {
    resultado = true;
  } else {
    resultado = false;
  }
  return resultado;
}

helpers.ifadministrador = (rol) => {
  return esadministrador(rol);
};

function esusuario(rol) {
  if (rol == "Usuario") {
    resultado = true;
  } else {
    resultado = false;
  }
  return resultado;
}

helpers.ifusuario = (rol) => {
  return esusuario(rol);
};

function espromotor(rol) {
  if (rol == "Promotor") {
    resultado = true;
  } else {
    resultado = false;
  }
  return resultado;
}

helpers.ifpromotor = (rol) => {
  return espromotor(rol);
};

module.exports = helpers;
