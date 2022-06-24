const mysql = require("mysql");
const { promisify } = require("util");
const colors = require("colors");
const Connection = require("mysql/lib/Connection");

const { database } = require("./keys");
const { connect } = require("./rutas");

const cola = mysql.createPool(database);

cola.getConnection((err, Connection) => {
  if (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error(
        colors.underline.red.bgWhite(
          "La conexion con la base de datos fue cerrada"
        )
      );
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      console.error(
        colors.underline.red.bgWhite("La base de datos tiene muchas conexiones")
      );
    }
    if (err.code === "ECONNREFUSED") {
      console.error(
        colors.underline.red.bgWhite(
          "La conexion con la base de datos fue rechazada"
        )
      );
    }
  }
  if (Connection) Connection.release();
  console.log(colors.underline.green.bgWhite("Base de datos conectada"));
  return;
});

// promisify pool querys
cola.query = promisify(cola.query);

module.exports = cola;
