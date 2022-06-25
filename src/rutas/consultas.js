const express = require("express");
const consultas = express.Router();
const { isLoggedIn } = require("../lib/auth");
const cola = require("../databases");
const date = require("date-and-time");
const { application } = require("express");

const { emailsending } = require("./email");

consultas.get("/listauserdt", async (req, res) => {
  const data = await cola.query("SELECT * FROM usuarios");

  res.json(data);
  // console.log(registros); // para verificar la consulta de bd
  // res.send("Registros leidos"); // respuesta basica mas iva
});

consultas.get("/listauserdtu", async (req, res) => {
  const data = await cola.query(
    "SELECT * FROM usuarios WHERE tipo = 'Usuario' OR tipo = 'Promotor'"
  );

  res.json(data);
  // console.log(registros); // para verificar la consulta de bd
  // res.send("Registros leidos"); // respuesta basica mas iva
});

async function cformat() {
  for (i = 0; i < results.length; i++) {
    results[i].creado = date.format(results[i].creado, "DD-MM-YYYY HH:mm");
  }

  return results;

  // dando formato al timestamp que mariadb me lo transaforma en la consulta pero en un formato XXXXXL
  // datos.creado = date.format(datos.creado, "DD-MM-YYYY HH:mm");
}
consultas.get("/consultap", isLoggedIn, (req, res) => {
  const serverurl = req.app.locals.serverurl;
  res.render("consultap", { serverurl });
});

consultas.get("/consultapr/:id", async (req, res) => {
  const { id } = req.params;

  results = await cola.query("SELECT * FROM ventas WHERE id_promotor = ?", [
    id,
  ]);

  if (results.length > 0) {
    datos = await cformat(results);

    res.json(datos);
    // console.log(data);
  } else {
    req.toastr.info(
      "NO hay registros",
      (title = "Sistema"),
      (options = {
        timeOut: "1550",
        closeButton: true,
        progressBar: true,
      })
    );
  }
});

consultas.get("/consultau", isLoggedIn, (req, res) => {
  const serverurl = req.app.locals.serverurl;
  res.render("consultau", { serverurl });
});

consultas.get("/consultadtu", async (req, res) => {
  results = await cola.query("SELECT * FROM ventas");

  if (results.length > 0) {
    datos = await cformat(results);

    res.json(datos);
    // console.log(data);
  } else {
    req.toastr.info(
      "NO hay registros",
      (title = "Sistema"),
      (options = {
        timeOut: "1550",
        closeButton: true,
        progressBar: true,
      })
    );
  }
});

consultas.get("/consultaad", isLoggedIn, (req, res) => {
  const serverurl = req.app.locals.serverurl;
  res.render("consultaad", { serverurl });
});

consultas.get("/consultadta", async (req, res) => {
  results = await cola.query("SELECT * FROM ventas");

  if (results.length > 0) {
    datos = await cformat(results);

    res.json(datos);
    // console.log(data);
  } else {
    req.toastr.info(
      "NO hay registros",
      (title = "Sistema"),
      (options = {
        timeOut: "1550",
        closeButton: true,
        progressBar: true,
      })
    );
  }
});

consultas.get("/recibo/:id", async (req, res) => {
  const { id } = req.params;

  const drecibo = await cola.query("SELECT * FROM ventas WHERE id = ?", [id]);
  // res.render("recibo", { datos: drecibo[0] });
  const datos = drecibo[0];
  const registro = await cola.query(
    "SELECT * FROM concursos WHERE idconcurso = ?",
    [datos.idconcurso]
  );
  const datosc = registro[0];
  
  // dando formato al timestamp que mariadb me lo transaforma en la consulta pero en un formato XXXXXL
  datos.creado = date.format(datos.creado, "DD-MM-YYYY HH:mm");
  res.render("recibo", { datos, datosc });
});

consultas.get("/recibotest/:id", async (req, res) => {
  const { id } = req.params;

  const drecibo = await cola.query("SELECT * FROM ventas WHERE id = ?", [id]);
  // res.render("recibo", { datos: drecibo[0] });
  const datos = drecibo[0];

  // dando formato al timestamp que mariadb me lo transaforma en la consulta pero en un formato XXXXXL
  datos.creado = date.format(datos.creado, "DD-MM-YYYY HH:mm");
  res.json(datos);
});

consultas.get("/recibop/:id", async (req, res) => {
  const { id } = req.params;
  const drecibo = await cola.query("SELECT * FROM ventas WHERE id = ?", [id]);
  var datos = drecibo[0];

  if (datos.idventam != 0) {
    // venta multiple bebe
    const ventam = await cola.query("SELECT * FROM ventasm WHERE id = ?", [
      datos.idventam,
    ]);

    const ventas = await cola.query("SELECT * FROM ventas WHERE idventam = ?", [
      datos.idventam,
    ]);

    const registro = await cola.query(
      "SELECT * FROM concursos WHERE idconcurso = ?",
      [ventas[0].idconcurso]
    );
    const datosc = registro[0];

    var codventa = new Array();
    var numeros = new Array();
    var grantotal = 0;
    var cantdenum = ventam[0].cantdenum;

    for (i = 0; i < cantdenum; i++) {
      codventa.push(ventas[i].id);
      numeros.push(ventas[i].numero);
      grantotal = grantotal + ventas[i].monto;
    }

    // dando formato al timestamp que mariadb me lo transaforma en la consulta pero en un formato XXXXXL
    var creado = date.format(ventas[0].creado, "DD-MM-YYYY HH:mm");

    var datos = {
      id: codventa,
      creado: creado,
      idconcurso: ventas[0].idconcurso,
      titulo: ventas[0].titulo,
      cedula: ventas[0].cedula,
      nombre: ventas[0].nombre,
      apellido: ventas[0].apellido,
      numcontacto: ventas[0].numcontacto,
      email: ventas[0].email,
      mpago: ventas[0].mpago,
      ref: ventas[0].ref,
      monto: ventas[0].monto,
      grantotal,
      id_promotor: ventas[0].id_promotor,
      idventam: datos.idventam,
    };

    res.render("recibomp", { datos, datosc, numeros });
  } else {
    const registro = await cola.query(
      "SELECT * FROM concursos WHERE idconcurso = ?",
      [datos.idconcurso]
    );
    const datosc = registro[0];
    // dando formato al timestamp que mariadb me lo transaforma en la consulta pero en un formato XXXXXL
    datos.creado = date.format(datos.creado, "DD-MM-YYYY HH:mm");
    res.render("recibop", { datos, datosc });
  }
});

consultas.get("/recibou/:id", async (req, res) => {
  const { id } = req.params;
  const drecibo = await cola.query("SELECT * FROM ventas WHERE id = ?", [id]);
  var datos = drecibo[0];

  if (datos.idventam != 0) {
    // venta multiple bebe
    const ventam = await cola.query("SELECT * FROM ventasm WHERE id = ?", [
      datos.idventam,
    ]);

    const ventas = await cola.query("SELECT * FROM ventas WHERE idventam = ?", [
      datos.idventam,
    ]);
    const registro = await cola.query(
      "SELECT * FROM concursos WHERE idconcurso = ?",
      [ventas[0].idconcurso]
    );
    const datosc = registro[0];

    var codventa = new Array();
    var numeros = new Array();
    var grantotal = 0;
    var cantdenum = ventam[0].cantdenum;

    for (i = 0; i < cantdenum; i++) {
      codventa.push(ventas[i].id);
      numeros.push(ventas[i].numero);
      grantotal = grantotal + ventas[i].monto;
    }

    // dando formato al timestamp que mariadb me lo transaforma en la consulta pero en un formato XXXXXL
    var creado = date.format(ventas[0].creado, "DD-MM-YYYY HH:mm");

    var datos = {
      id: codventa,
      creado: creado,
      idconcurso: ventas[0].idconcurso,
      titulo: ventas[0].titulo,
      cedula: ventas[0].cedula,
      nombre: ventas[0].nombre,
      apellido: ventas[0].apellido,
      numcontacto: ventas[0].numcontacto,
      email: ventas[0].email,
      mpago: ventas[0].mpago,
      ref: ventas[0].ref,
      monto: ventas[0].monto,
      grantotal,
      id_promotor: ventas[0].id_promotor,
      idventam: datos.idventam,
    };

    res.render("recibomu", { datos, datosc, numeros });
  } else {
    // dando formato al timestamp que mariadb me lo transaforma en la consulta pero en un formato XXXXXL
    const registro = await cola.query(
      "SELECT * FROM concursos WHERE idconcurso = ?",
      [datos.idconcurso]
    );
    const datosc = registro[0];
    datos.creado = date.format(datos.creado, "DD-MM-YYYY HH:mm");
    res.render("recibou", { datos, datosc });
  }
});

consultas.get("/reciboad/:id", async (req, res) => {
  const { id } = req.params;
  const drecibo = await cola.query("SELECT * FROM ventas WHERE id = ?", [id]);
  var datos = drecibo[0];
  if (datos.idventam != 0) {
    // venta multiple bebe
    const ventam = await cola.query("SELECT * FROM ventasm WHERE id = ?", [
      datos.idventam,
    ]);

    const ventas = await cola.query("SELECT * FROM ventas WHERE idventam = ?", [
      datos.idventam,
    ]);
    const registro = await cola.query(
      "SELECT * FROM concursos WHERE idconcurso = ?",
      [ventas[0].idconcurso]
    );
    const datosc = registro[0];

    var codventa = new Array();
    var numeros = new Array();
    var grantotal = 0;
    var cantdenum = ventam[0].cantdenum;

    for (i = 0; i < cantdenum; i++) {
      codventa.push(ventas[i].id);
      numeros.push(ventas[i].numero);
      grantotal = grantotal + ventas[i].monto;
    }

    // dando formato al timestamp que mariadb me lo transaforma en la consulta pero en un formato XXXXXL
    var creado = date.format(ventas[0].creado, "DD-MM-YYYY HH:mm");

    var datos = {
      id: codventa,
      creado: creado,
      idconcurso: ventas[0].idconcurso,
      titulo: ventas[0].titulo,
      cedula: ventas[0].cedula,
      nombre: ventas[0].nombre,
      apellido: ventas[0].apellido,
      numcontacto: ventas[0].numcontacto,
      email: ventas[0].email,
      mpago: ventas[0].mpago,
      ref: ventas[0].ref,
      monto: ventas[0].monto,
      grantotal,
      id_promotor: ventas[0].id_promotor,
      idventam: datos.idventam,
    };

    res.render("recibomad", { datos, datosc, numeros });
  } else {
    const registro = await cola.query(
      "SELECT * FROM concursos WHERE idconcurso = ?",
      [datos.idconcurso]
    );
    const datosc = registro[0];
    // dando formato al timestamp que mariadb me lo transaforma en la consulta pero en un formato XXXXXL
    datos.creado = date.format(datos.creado, "DD-MM-YYYY HH:mm");
    res.render("reciboad", { datos, datosc });
  }
});

// Reenvio de correo al cliente papu

consultas.get("/reenvioe/:id", async (req, res) => {
  const { id } = req.params;

  const drecibo = await cola.query("SELECT * FROM ventas WHERE id = ?", [id]);
  // res.render("recibo", { datos: drecibo[0] });
  const datos = drecibo[0];
  const registro = await cola.query(
    "SELECT * FROM concursos WHERE idconcurso = ?",
    [datos.idconcurso]
  );
  const datosc = registro[0];
  // dando formato al timestamp que mariadb me lo transaforma en la consulta pero en un formato XXXXXL
  datos.creado = date.format(datos.creado, "DD-MM-YYYY HH:mm");

  emailsending(datos, datosc);

  req.toastr.info(
    "Correo del recibo reenviado al cliente",
    (title = "Sistema"),
    (options = {
      timeOut: "1550",
      closeButton: true,
      progressBar: true,
    })
  );

  res.redirect("/consultau");
});

module.exports = consultas;
