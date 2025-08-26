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
// ✅ Pool de conexiones que funciona tanto en Railway como local
const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MYSQLHOST || process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
  user: process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "123456789",
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || "Sistema_Vacunacion",
  waitForConnections: true,
  ssl: process.env.MYSQLHOST?.includes("railway") 
    ? { rejectUnauthorized: true } // 🔹 Railway requiere SSL
    : undefined,
});

// ✅ Prueba de conexión al iniciar
(async () => {
  try {
    const conn = await db.getConnection();
    console.log("✅ Conectado a la base de datos:", process.env.MYSQLDATABASE);
    conn.release();
  } catch (err) {
    console.error("❌ Error conectando a la base de datos:", err.message);
  }
})();

module.exports = db;


