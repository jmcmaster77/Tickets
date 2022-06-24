const express = require("express");
const app = express()
const res = require("express/lib/response");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const cola = require("../databases");
const helpers = require("../lib/helpers");

passport.use(
  "local.signin",
  new LocalStrategy(
    {
      usernameField: "usuario_s",
      passwordField: "clave_s",
      passReqToCallback: true,
    },
    async (req, usuario, clave, done) => {
      // console.log(req.body);
      // console.log(usuario);
      // console.log(clave);
      const registro = await cola.query(
        "SELECT * FROM usuarios WHERE usuario = ?",
        [usuario]
      );

      if (registro.length > 0) {
        const dato = registro[0];
        const validacion = await helpers.matchPassword(clave, dato.clave);

        if (validacion) {
          if (clave == "clave555") {
            done(
              null,
              dato,
              req.toastr.warning(
                "Bienvenido " + dato.nombre + " " + dato.apellido + "\n" + "se esta utilizando clave generica se recomienda cambiar",
                (title = "Sistema"),
                (options = {
                  closeButton: true,
                  progressBar: true,
                  timeOut: "3500",
                })
              )
            );
          } else {
            done(
              null,
              dato,
              req.toastr.success(
                "Bienvenido " + dato.nombre + " " + dato.apellido,
                (title = "Sistema"),
                (options = {
                  closeButton: true,
                  progressBar: true,
                  timeOut: "1550",
                })
              )
            );
          }
        } else {
          done(
            null,
            false,
            req.toastr.error(
              "Usuario y clave incorrecto",
              (title = "Error"),
              (options = {
                closeButton: true,
                progressBar: true,
                timeOut: "1550",
              })
            )
          );
        }
      } else {
        return done(
          null,
          false,
          req.toastr.error(
            "EL usuario no existe",
            (title = "Error"),
            (options = {
              closeButton: true,
              progressBar: true,
              timeOut: "1550",
            })
          )
        );
      }
      passport.serializeUser((user, done) => {
        done(null, user.id);
      });
    }
  )
);

passport.serializeUser((user, done) => {
  // console.log('Serializando a: ',user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const rows = await cola.query("SELECT * FROM usuarios WHERE id = ?", [id]);
  done(null, rows[0]);
});
