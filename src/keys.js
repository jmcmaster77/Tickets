require('dotenv').config()
module.exports = {

    database: {
        host: process.env.DBhost,
        port: process.env.DBport,
        user: process.env.DBuser,
        password: process.env.DBpassword,
        database: process.env.DBdatabase,
    }

}