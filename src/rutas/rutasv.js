const express = require("express");
const rutasv = express.Router();
const { isLoggedIn } = require("../lib/auth");
const cola = require("../databases");
const { application } = require("express");
const colors = require("colors");
const { timeago } = require("../lib/handlebars");
const date = require("date-and-time");
const { emailsending, emailsendingm } = require("./email");

// registro dev ventas

// rutasv.get("/rventas", isLoggedIn, (req, res) => {
//   res.render("rventas");
// });

var go = true;
rutasv.post("/rventas", isLoggedIn, async (req, res) => {
  var go = true;
  const idpromotor = req.app.locals.user.id;

  let {
    inputidconcurso,
    inputnv,
    nombre,
    apellido,
    ci,
    ncontacto,
    correo,
    mpago,
    ref,
    monto,
  } = req.body;

  //  buscando el titulo del Concurso
  async function btituloc() {
    const registro = await cola.query(
      "SELECT titulo FROM concursos WHERE idconcurso = ?",
      [inputidconcurso]
    );
    return registro[0].titulo;
  }

  // realizando las validaciones

  if (nombre == "") {
    var go = false;
    req.toastr.error(
      "Se require el nombre",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1550",
      })
    );
    res.redirect("/concurso/" + inputidconcurso);
  } else if (apellido == "") {
    var go = false;
    req.toastr.error(
      "Se require el apellido",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1550",
      })
    );
    res.redirect("/concurso/" + inputidconcurso);
  } else if (ci == "") {
    var go = false;
    req.toastr.error(
      "Se require el numero de cedula",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1550",
      })
    );
    res.redirect("/concurso/" + inputidconcurso);
  } else if (ncontacto == "") {
    var go = false;
    req.toastr.error(
      "Se require el numero de contacto",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1550",
      })
    );
    res.redirect("/concurso/" + inputidconcurso);
  } else if (correo == "") {
    var go = false;
    req.toastr.error(
      "Se require el correo electronico",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1550",
      })
    );
    res.redirect("/concurso/" + inputidconcurso);
  } else if (monto == "") {
    var go = false;
    req.toastr.error(
      "Se require el monto del importe",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1550",
      })
    );
    res.redirect("/concurso/" + inputidconcurso);
  } else if (mpago == "Seleccionar método de pago") {
    var go = false;
    req.toastr.error(
      "Seleccionar método de pago",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1550",
      })
    );
    res.redirect("/concurso/" + inputidconcurso);
  }
  if (ref == "") {
    if (mpago == "efectivo_Bsd" || mpago == "efectivo_Div") {
      ref = "N/A";
    } else if (mpago == "pago_movil" || mpago == "transferencia") {
      var go = false;
      req.toastr.error(
        "Se require la referencia",
        (title = "Error"),
        (options = {
          closeButton: true,
          progressBar: true,
          timeOut: "1550",
        })
      );
      res.redirect("/concurso/" + inputidconcurso);
    }
  }

  //  armando el paquete para registrar la venta
  const venta = {
    idconcurso: inputidconcurso,
    titulo: await btituloc(),
    numero: inputnv,
    cedula: ci,
    nombre: nombre,
    apellido: apellido,
    numcontacto: ncontacto,
    email: correo,
    mpago: mpago,
    ref: ref,
    monto: monto,
    id_promotor: idpromotor,
  };

  if (go) {
    var sql =
      "update numeros set estado = 1 where numero = ? and idconcurso = ?";
    await cola.query(sql, [inputnv, inputidconcurso]);
    sql = "INSERT INTO ventas SET ?";
    const codventa = await cola.query(sql, [venta]);
    req.toastr.success(
      "Venta Registrada",
      (title = "Systema"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1250",
      })
    );
    // emitir el recibo
    res.redirect("/dprecibo/" + codventa.insertId);
  }
});

rutasv.get("/dprecibo/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;

  res.render("ventareporte", { id: id });
});

// ten esto a la mano por si hay que registrar varios de un solo carajaso
// Se implementa el envio de correo mientras se genera el recibo

rutasv.post("/recibo/:id", async (req, res) => {
  const { id } = req.params;

  const drecibo = await cola.query("SELECT * FROM ventas WHERE id = ?", [id]);
  // res.render("recibo", { datos: drecibo[0] });
  const datos = drecibo[0];
  const registro = await cola.query("SELECT * FROM concursos WHERE idconcurso = ?", [datos.idconcurso])
  const datosc = registro[0]
  // dando formato al timestamp que mariadb me lo transaforma en la consulta pero en un formato XXXXXL
  datos.creado = date.format(datos.creado, "DD-MM-YYYY HH:mm");

  // antes de cargar el recibo se procede a enviar el correo y aprovechar los datos del cliente para incluirlos en el email

  emailsending(datos, datosc);

  // y por ultimo se muestra el recibo
  res.render("recibo", { datos, datosc });
});

//  ventas multiples

rutasv.post("/rventasm", isLoggedIn, async (req, res) => {
  var go = true;
  const idpromotor = req.app.locals.user.id;
  var numeros = new Array();
  var cadenan = req.body.inputnv;
  numeros = cadenan.split(",");

  let {
    inputidconcurso,
    nombre,
    apellido,
    ci,
    ncontacto,
    correo,
    mpago,
    ref,
    monto,
  } = req.body;

  //  buscando el titulo del Concurso
  async function btituloc() {
    const registro = await cola.query(
      "SELECT titulo FROM concursos WHERE idconcurso = ?",
      [inputidconcurso]
    );
    return registro[0].titulo;
  }

  // realizando las validaciones

  if (nombre == "") {
    var go = false;
    req.toastr.error(
      "Se require el nombre",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1550",
      })
    );
    res.redirect("/concursom/" + inputidconcurso);
  } else if (apellido == "") {
    var go = false;
    req.toastr.error(
      "Se require el apellido",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1550",
      })
    );
    res.redirect("/concursom/" + inputidconcurso);
  } else if (ci == "") {
    var go = false;
    req.toastr.error(
      "Se require el numero de cedula",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1550",
      })
    );
    res.redirect("/concursom/" + inputidconcurso);
  } else if (ncontacto == "") {
    var go = false;
    req.toastr.error(
      "Se require el numero de contacto",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1550",
      })
    );
    res.redirect("/concursom/" + inputidconcurso);
  } else if (correo == "") {
    var go = false;
    req.toastr.error(
      "Se require el correo electronico",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1550",
      })
    );
    res.redirect("/concursom/" + inputidconcurso);
  } else if (monto == "") {
    var go = false;
    req.toastr.error(
      "Se require el monto del importe",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1550",
      })
    );
    res.redirect("/concursom/" + inputidconcurso);
  } else if (mpago == "Seleccionar método de pago") {
    var go = false;
    req.toastr.error(
      "Seleccionar método de pago",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1550",
      })
    );
    res.redirect("/concursom/" + inputidconcurso);
  }
  if (ref == "") {
    if (mpago == "efectivo_Bsd" || mpago == "efectivo_Div") {
      ref = "N/A";
    } else if (mpago == "pago_movil" || mpago == "transferencia") {
      var go = false;
      req.toastr.error(
        "Se require la referencia",
        (title = "Error"),
        (options = {
          closeButton: true,
          progressBar: true,
          timeOut: "1550",
        })
      );
      res.redirect("/concursom/" + inputidconcurso);
    }
  }

  //  armando el paquete y registrando la venta multiple, cambio de estado a los numeros
  // y registrando la venta del numero

  var titulo = await btituloc();

  async function registralo() {
    var codventas = [];

    var sqlactestadonum =
      "update numeros set estado = 1 where numero = ? and idconcurso = ?";
    var sqlregistrov = "INSERT INTO ventas SET ?";
    // generar id de la venta multiple
    var ventam = {
      idconcurso: inputidconcurso,
      cantdenum: numeros.length,
    };
    var idventam = await cola.query("INSERT INTO ventasm set ?", [ventam]);

    for (var i = 0; i < numeros.length; i++) {
      await cola.query(sqlactestadonum, [numeros[i], inputidconcurso]);

      const venta = {
        idconcurso: inputidconcurso,
        titulo: titulo,
        numero: numeros[i],
        cedula: ci,
        nombre: nombre,
        apellido: apellido,
        numcontacto: ncontacto,
        email: correo,
        mpago: mpago,
        ref: ref,
        monto: monto,
        id_promotor: idpromotor,
        idventam: idventam.insertId,
      };
      registro = await cola.query(sqlregistrov, [venta]);
      codventas[i] = registro.insertId;
    }
    registrov = idventam.insertId
    return registrov;
  }

  if (go) {
    registrov = await registralo();

    req.toastr.success(
      "Venta Registrada",
      (title = "Systema"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1250",
      })
    );
    // emitir el recibo

    res.redirect("/dprecibom/" + registrov);
  }
});

//  recibo de la venta multiple

rutasv.get("/dprecibom/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;

  res.render("ventareportem", { id: id });
});

rutasv.post("/recibom/:id", async (req, res) => {
  const { id } = req.params;
  const ventas = await cola.query("SELECT * FROM ventas WHERE idventam = ?", [
    id,
  ]);
  const ventam = await cola.query("SELECT * FROM ventasm WHERE id = ?", [id]);

  const registro = await cola.query("SELECT * FROM concursos WHERE idconcurso = ?", [ventas[0].idconcurso])
  const datosc = registro[0]

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
    idventam: id,
  };

  emailsendingm(datos, datosc, numeros);

  res.render("recibom", { datos, datosc,  numeros });
});

module.exports = rutasv;
