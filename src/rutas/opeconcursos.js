const express = require("express");
const rutasc = express.Router();
const { isLoggedIn } = require("../lib/auth");
const pool = require("../databases");
const toastr = require("toastr");
const date = require("date-and-time");
const consultas = require("./consultas");

/// Registro de Concursos

rutasc.get("/rconcurso", isLoggedIn, async (req, res) => {
  res.render("rconcurso");
});

rutasc.post("/rconcurso", isLoggedIn, async (req, res) => {
  let { titulo, descripcion, cnum } = req.body;
  var go = true;
  if (titulo == "") {
    var go = false;
    req.toastr.error(
      "Se require el titulo",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1250",
      })
    );
    res.redirect("/rconcurso");
  } else if (descripcion == "") {
    var go = false;
    req.toastr.error(
      "Se require la descripción",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1250",
      })
    );
    res.redirect("/rconcurso");
  }

  const concurso = {
    titulo,
    descripcion,
    cnum,
    registradox: req.app.locals.user.id,
  };

  if (go) {
    try {
      const registro = await pool.query("INSERT INTO concursos SET ?", [
        concurso,
      ]);

      // carga de los numeros del concurso en la base de datos
      await registrarnum(registro.insertId, cnum);

      req.toastr.success(
        "Concurso registrado",
        (title = "Systema"),
        (options = {
          closeButton: true,
          progressBar: true,
          timeOut: "1250",
        })
      );
      res.redirect("/rconcurso");
    } catch (error) {
      console.log(error);
    }
  }
});

// Registro de numeros de cada concurso
async function registrarnum(idconcurso, cnum) {
  var estado = 0;
  if (cnum == 99) {
    var sql = "insert into numeros set numero=?, estado=?, idconcurso=?";
    for (i = 0; i < 100; i++) {
      if (i < 10) {
        num = "0" + String(i);
        await pool.query(sql, [num, estado, idconcurso]);
      } else {
        num = String(i);
        await pool.query(sql, [num, estado, idconcurso]);
      }
    }
  } else if (cnum == 999) {
    var sql = "insert into numeros set numero=?, estado=?, idconcurso=?";
    for (i = 0; i < 1000; i++) {
      if (i < 10) {
        num = "0" + String(i);
        await pool.query(sql, [num, estado, idconcurso]);
      } else {
        num = String(i);
        await pool.query(sql, [num, estado, idconcurso]);
      }
    }
  }
}

async function cformat() {
  for (i = 0; i < registros.length; i++) {
    registros[i].creado = date.format(registros[i].creado, "DD-MM-YYYY HH:mm");
  }

  return registros;

  // dando formato al timestamp que mariadb me lo transaforma en la consulta pero en un formato XXXXXL
  // datos.creado = date.format(datos.creado, "DD-MM-YYYY HH:mm");
}

// consulta del data table del admin

rutasc.get("/cconcursoad", isLoggedIn, async (req, res) => {
  const serverurl = req.app.locals.serverurl;
  res.render("cconcursoad", { serverurl });
});

// enviando datos a dt conculta del admin

rutasc.get("/cconcursoaddt", async (req, res) => {
  registros = await pool.query("SELECT * FROM concursos");
  if (registros.length > 0) {
    datos = await cformat(registros);

    res.json(datos);
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
    res.redirect("/admin");
  }
});

// carga el formulario de edicion del titutlo y desc del concurso

rutasc.get("/edconcurso/:id", async (req, res) => {
  const { id } = req.params;
  const registros = await pool.query(
    "SELECT * FROM concursos WHERE idconcurso=?",
    [id]
  );
  // console.log(registros[0]); // esto es para obtener los datos del objeto
  res.render("edconcurso", { datos: registros[0] });
});

// recibiendo los datos del formulario de edicion del concurso

rutasc.post("/edconcurso/:id", async (req, res) => {
  var go = true;
  const { id } = req.params;
  let { titulo, descripcion } = req.body;

  if (titulo == "") {
    var go = false;
    req.toastr.error(
      "Se require el titulo",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1250",
      })
    );
    res.redirect("/edconcurso/" + id);
  } else if (descripcion == "") {
    var go = false;
    req.toastr.error(
      "Se require la descripción",
      (title = "Error"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1250",
      })
    );
    res.redirect("/edconcurso/" + id);
  }

  const datos = {
    titulo,
    descripcion,
    editadox: req.app.locals.user.id,
  };

  if (go) {
    await pool.query("UPDATE concursos set ? WHERE idconcurso = ?", [
      datos,
      id,
    ]);
    req.toastr.info(
      "Concurso editado",
      (title = "Sistema"),
      (options = {
        timeOut: "1250",
        closeButton: true,
        progressBar: true,
      })
    );
    res.redirect("/edconcurso/" + id);
  }
});

//  consulta de concurso por el usuario /cconcursou

rutasc.get("/cconcursou", isLoggedIn, async (req, res) => {
  const serverurl = req.app.locals.serverurl;
  res.render("cconcursou", { serverurl });
});

// envio de datos al dt

rutasc.get("/cconcursoudt", async (req, res) => {
  registros = await pool.query("SELECT * FROM concursos");
  if (registros.length > 0) {
    datos = await cformat(registros);

    res.json(datos);
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
    res.redirect("/profile");
  }
});

// Mostrar concursos

rutasc.get("/mconcursos", isLoggedIn, async (req, res) => {
  registros = await pool.query("SELECT * FROM concursos");
  if (registros.length > 0) {
    datos = await cformat(registros);
      res.render("mconcursos", { datos });
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
    res.redirect("/profile");
  }
});

//  Muestra los numeros del concurso para venta del numero 

rutasc.get("/concurso/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  registros = await pool.query("SELECT * FROM numeros WHERE idconcurso = ?", [
    id,
  ]);
  concurso = await pool.query("SELECT * FROM concursos WHERE idconcurso = ?", [
    id,
  ]);
  
  res.render("concurso", { registros, idconcurso:id, concurso: concurso[0] });
});

rutasc.get("/concurso/actualizar/:id", (req, res) => {
  const { id } = req.params;
  try {
    req.toastr.info(
      "Atualizacion OK",
      (title = "Systema"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1000",
      })
    );
    res.redirect("/concurso/" + id);
  } catch (error) {
    console.log(error);
  }
});

//  Muestra los numeros del concurso para venta multiple 

rutasc.get("/concursom/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  registros = await pool.query("SELECT * FROM numeros WHERE idconcurso = ?", [
    id,
  ]);
  concurso = await pool.query("SELECT * FROM concursos WHERE idconcurso = ?", [
    id,
  ]);
  
  res.render("concursom", { registros, idconcurso:id, concurso: concurso[0] });
});

rutasc.get("/concursom/actualizar/:id", (req, res) => {
  const { id } = req.params;
  try {
    req.toastr.info(
      "Atualizacion OK",
      (title = "Systema"),
      (options = {
        closeButton: true,
        progressBar: true,
        timeOut: "1000",
      })
    );
    res.redirect("/concursom/" + id);
  } catch (error) {
    console.log(error);
  }
});

module.exports = rutasc;
