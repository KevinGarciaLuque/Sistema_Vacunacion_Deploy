////////////////////////////Para Trabjar Local//////////////////////////////////////
/*const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456789", // <-- Clave por defecto actualizada
  database: process.env.DB_NAME || "sistema_vacunacion",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306, // <-- Puerto explícito
});

module.exports = db;*/




// db.js////////////Conexión a la base de datos MySQL DBeaver Railway ////////////
const mysql = require("mysql2/promise");
require("dotenv").config();

/**
 * Railway (cuando linkeas el servicio MySQL) inyecta:
 *  MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE
 * Localmente usamos DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 */

const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MYSQLHOST || process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
  user: process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "123456789",
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || "sistema_vacunacion",
  waitForConnections: true
});

module.exports = db;


