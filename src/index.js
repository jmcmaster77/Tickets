const express = require("express");
const morgan = require("morgan");
const colors = require("colors");
const { engine } = require("express-handlebars"); // modificando el engine
const path = require("path");
require("dotenv").config();
const flash = require("connect-flash");
const session = require("express-session");
const toastr = require("express-toastr");
const MySQLStore = require("express-mysql-session");
const passport = require("passport");
const cors = require("cors");
const { database } = require("./keys");

// inicializaciones
const app = express();
require("./lib/passport");

// configuraciones
app.set("port", process.env.PORT || process.env.AppPort);
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  engine({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: ".hbs",
    helpers: require("./lib/handlebars"),
  })
);
app.set("view engine", ".hbs");
// Middlewares (app de intercambio)
app.use(
  session({
    secret: "ticketssqlnodesession",
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database),
  })
);
app.use(flash());
app.use(toastr());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
//Variables Globales

// la url de acceso a la aplicacion en este caso el nombre del servidor donde esta alojado bebe
app.locals.serverurl = "http://gdragon:3000";
//los mensajes
app.use((req, res, next) => {
  app.locals.success = req.flash("success");
  app.locals.message = req.flash("message");
  res.locals.toastr = req.toastr.render();
  app.locals.user = req.user;
  
 

  //console.log("Datos del req.user : ",req.user);
  // console.log("variable global usuario: ",app.locals.user);
  next();
});

//Rutas
app.use(require("./rutas/"));
app.use(require("./rutas/authentication"));
app.use(require("./rutas/consultas"));
app.use(require("./rutas/opeconcursos"));
app.use(require("./rutas/opeuser"));
app.use(require("./rutas/rutasv"));
// ruta del proyecto anterior

//Public
app.use(express.static(path.join(__dirname, "public")));

// hora local
var fecha = new Date();
var hora = new Date();
fecha = fecha.toLocaleDateString();
hora = hora.toLocaleTimeString();

console.log(`started at ${fecha} | ${hora}`.underline.red.bgBlack);
// Starting the Server
app.listen(app.get("port"), () => {
  mensaje = "Servidor en el puerto: " + app.get("port");
  console.log(colors.underline.black.bgWhite(mensaje));
  //   console.log(colors.underline.red.bgWhite("Prueba"));
});
