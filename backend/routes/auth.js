const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const enviarCorreo = require("../utils/enviarCorreo");

// ===================== LOGIN =====================
router.post("/login", async (req, res) => {
  const { dni, password } = req.body;

  if (!dni || !password) {
    return res.status(400).json({ success: false, message: "DNI y contraseña son obligatorios." });
  }

  try {
    const [users] = await db.execute(
      `SELECT u.id, u.nombre_completo, u.dni, u.password, u.activo, u.correo,
              GROUP_CONCAT(r.nombre) AS roles
       FROM usuarios u
       LEFT JOIN usuario_rol ur ON u.id = ur.usuario_id
       LEFT JOIN roles r ON ur.rol_id = r.id
       WHERE u.dni = ?
       GROUP BY u.id`,
      [dni]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: "Credenciales incorrectas." });
    }

    const user = users[0];

    if (!user.activo) {
      return res.status(403).json({ success: false, message: "Cuenta desactivada. Contacte al administrador." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Credenciales incorrectas." });
    }

    const [permisosRows] = await db.execute(
      `SELECT DISTINCT p.nombre
       FROM usuario_rol ur
       JOIN rol_permiso rp ON ur.rol_id = rp.rol_id
       JOIN permisos p ON rp.permiso_id = p.id
       WHERE ur.usuario_id = ?`,
      [user.id]
    );

    const permisos = permisosRows.map((p) => p.nombre);
    const rolesArray = user.roles ? user.roles.split(",") : [];

    const token = jwt.sign(
      { id: user.id, dni: user.dni, roles: rolesArray, permisos },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "8h" }
    );

    await db.execute(
      "INSERT INTO bitacora (usuario_id, accion, realizado_por) VALUES (?, ?, ?)",
      [user.id, "Inicio de sesión", user.nombre_completo]
    );

    res.json({
      success: true,
      token,
      usuario: {
        id: user.id,
        nombre_completo: user.nombre_completo,
        dni: user.dni,
        correo: user.correo,
        roles: rolesArray,
        permisos,
      },
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ success: false, message: "Error en el servidor." });
  }
});

// ===================== SOLICITAR CÓDIGO DE RECUPERACIÓN =====================
router.post("/olvido-contrasena", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "El correo es obligatorio." });

  try {
    const [users] = await db.execute(
      "SELECT id, nombre_completo FROM usuarios WHERE correo = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "No se encontró un usuario con este correo." });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await db.execute(
      "INSERT INTO codigos_verificacion (email, codigo, expires_at) VALUES (?, ?, ?)",
      [email, codigo, expiresAt]
    );

    await enviarCorreo(
      email,
      "Código de recuperación de contraseña",
      `<p>Su código de verificación es: <b>${codigo}</b></p><p>Este código es válido por 15 minutos.</p>`
    );

    console.log(`✅ Código enviado a ${email}: ${codigo}`);

    res.json({ message: "Código de verificación enviado a su correo." });
  } catch (error) {
    console.error("❌ Error en /olvido-contrasena:", error);
    res.status(500).json({ message: "Error al enviar el código de verificación." });
  }
});

// ===================== VERIFICAR CÓDIGO =====================
router.post("/verificar-codigo", async (req, res) => {
  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ message: "Correo y código son obligatorios." });
  }

  try {
    const [results] = await db.execute(
      "SELECT * FROM codigos_verificacion WHERE email = ? AND codigo = ? AND expires_at > NOW()",
      [email, codigo]
    );

    if (results.length === 0) {
      return res.status(400).json({ message: "Código inválido o expirado." });
    }

    res.json({ message: "Código verificado correctamente." });
  } catch (error) {
    console.error("❌ Error en /verificar-codigo:", error);
    res.status(500).json({ message: "Error al verificar el código." });
  }
});

// ===================== RESTABLECER CONTRASEÑA =====================
router.post("/restablecer-contrasena", async (req, res) => {
  const { email, codigo, nuevaContraseña } = req.body;

  if (!email || !codigo || !nuevaContraseña) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  try {
    const [results] = await db.execute(
      "SELECT * FROM codigos_verificacion WHERE email = ? AND codigo = ? AND expires_at > NOW()",
      [email, codigo]
    );

    if (results.length === 0) {
      return res.status(400).json({ message: "Código inválido o expirado." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaContraseña, salt);

    await db.execute("UPDATE usuarios SET password = ? WHERE correo = ?", [hashedPassword, email]);
    await db.execute("DELETE FROM codigos_verificacion WHERE email = ?", [email]);

    console.log(`✅ Contraseña restablecida correctamente para ${email}`);

    res.json({ message: "Contraseña restablecida correctamente. Ya puede iniciar sesión." });
  } catch (error) {
    console.error("❌ Error en /restablecer-contrasena:", error);
    res.status(500).json({ message: "Error al restablecer la contraseña." });
  }
});

module.exports = router;
