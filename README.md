Aplicacion para llevar el control de ventas de tickets para concursos,
Varios Perfiles de Usuario 

Se puede realizar ventas multiples usuarios 
Emite recibos 
envios de recibos por email 

Nodejs 
Express
express-handlebars
nodemailer
MySql (MariaDB)
Datatables 

Exportar los Datos a Excel, PDF, 

{
  "name": "ticket",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node src/",
    "test": "nodemon src/"
  },
  "keywords": [],
  "author": "Jorge Martin",
  "license": "ISC",
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "colors": "^1.4.0",
    "connect-flash": "^0.1.1",
    "cors": "^2.8.5",
    "cryptr": "^6.0.3",
    "date-and-time": "^2.3.1",
    "dotenv": "^16.0.1",
    "express": "^4.18.1",
    "express-handlebars": "^6.0.5",
    "express-mysql-session": "^2.1.8",
    "express-session": "^1.17.3",
    "express-toastr": "^2.0.2",
    "express-validator": "^6.14.0",
    "morgan": "^1.10.0",
    "mysql": "^2.18.1",
    "nodemailer": "^6.7.5",
    "passport": "^0.5.2",
    "passport-local": "^1.0.0",
    "timeago.js": "^4.0.2",
    "toastr": "^2.1.4"
  },
  "devDependencies": {
    "nodemon": "^2.0.16"
  }
}