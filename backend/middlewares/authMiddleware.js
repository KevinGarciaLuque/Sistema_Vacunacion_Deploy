const jwt = require("jsonwebtoken");
const db = require("../config/db");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token no proporcionado o formato inválido",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");

    const [rows] = await db.execute(
      `
      SELECT u.id, u.nombre_completo, u.dni, u.activo, 
             GROUP_CONCAT(r.nombre) AS roles
      FROM usuarios u
      LEFT JOIN usuario_rol ur ON u.id = ur.usuario_id
      LEFT JOIN roles r ON ur.rol_id = r.id
      WHERE u.id = ?
      GROUP BY u.id
      `,
      [decoded.id]
    );

    if (!rows.length || rows[0].activo === 0) {
      return res.status(403).json({
        success: false,
        message: "Usuario no encontrado o cuenta inactiva",
      });
    }

    // Inyectar el usuario en la solicitud
    req.usuario = {
      id: rows[0].id,
      nombre_completo: rows[0].nombre_completo,
      dni: rows[0].dni,
      roles: rows[0].roles ? rows[0].roles.split(",") : [],
    };

    next();
  } catch (error) {
    console.error("❌ Error en autenticación:", error.message);

    const isExpired = error instanceof jwt.TokenExpiredError;

    res.status(401).json({
      success: false,
      message: isExpired
        ? "Sesión expirada. Por favor inicia sesión de nuevo."
        : error.message || "Token inválido o no autorizado",
    });
  }
};

module.exports = authMiddleware;
