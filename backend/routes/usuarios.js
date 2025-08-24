const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const registrarBitacora = require("../utils/registrarBitacora");

//////////////////////
// 🚩 REGISTRAR USUARIO
//////////////////////
router.post("/", async (req, res) => {
  const {
    nombre_completo,
    dni,
    edad,
    fecha_nacimiento,
    direccion,
    area_laboral,
    cargo,
    telefono,
    correo,
    password,
  } = req.body;

  if (!nombre_completo || !dni || !telefono || !correo || !password || !area_laboral || !cargo) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO usuarios 
        (nombre_completo, dni, edad, fecha_nacimiento, direccion, area_laboral, cargo, telefono, correo, password, activo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        nombre_completo,
        dni,
        edad,
        fecha_nacimiento,
        direccion,
        area_laboral,
        cargo,
        telefono,
        correo,
        hashedPassword,
      ]
    );

    await db.execute(
      "INSERT INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)",
      [result.insertId, 4]
    );

    await registrarBitacora(
      "Registro de nuevo usuario",
      req.usuario?.nombre_completo || "Sistema",
      result.insertId
    );

    res.status(201).json({ message: "Usuario registrado", id: result.insertId });
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    if (error.code === "ER_DUP_ENTRY") {
      const campo = error.message.includes("dni") ? "DNI" : "correo";
      return res.status(400).json({ error: `El ${campo} ya está registrado` });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//////////////////////////
// 🚩 OBTENER USUARIO POR DNI
//////////////////////////
router.get("/dni/:dni", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM usuarios WHERE dni = ?", [req.params.dni]);
    if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener usuario por DNI:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

////////////////////////////
// 🚩 OBTENER USUARIO POR ID
////////////////////////////
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM usuarios WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener usuario por ID:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

///////////////////////////////
// 🚩 ACTUALIZAR USUARIO POR ID
///////////////////////////////
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const requiredFields = ['nombre_completo', 'dni', 'telefono', 'correo', 'area_laboral', 'cargo'];
    const missingFields = requiredFields.filter(field => !updateData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Faltan campos obligatorios: ${missingFields.join(', ')}`,
        code: 'MISSING_FIELDS'
      });
    }

    if (updateData.fecha_nacimiento && !updateData.fecha_nacimiento.includes(' ')) {
      updateData.fecha_nacimiento = `${updateData.fecha_nacimiento} 00:00:00`;
    }

    const [result] = await db.execute(
      `UPDATE usuarios SET 
        nombre_completo = ?, dni = ?, edad = ?, fecha_nacimiento = ?, direccion = ?,
        area_laboral = ?, cargo = ?, telefono = ?, correo = ?, activo = ?
      WHERE id = ?`,
      [
        updateData.nombre_completo,
        updateData.dni,
        updateData.edad || null,
        updateData.fecha_nacimiento || null,
        updateData.direccion || null,
        updateData.area_laboral,
        updateData.cargo,
        updateData.telefono,
        updateData.correo,
        updateData.activo !== undefined ? updateData.activo : 1,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Usuario no encontrado", code: 'USER_NOT_FOUND' });
    }

    const [updatedUser] = await db.execute("SELECT * FROM usuarios WHERE id = ?", [id]);
    const userResponse = {
      ...updatedUser[0],
      fecha_nacimiento: updatedUser[0].fecha_nacimiento?.toISOString().split('T')[0] || null
    };

    res.json({
      success: true,
      message: "Usuario actualizado correctamente",
      data: userResponse
    });

  } catch (error) {
    console.error("💥 Error en actualización de usuario:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        error: "El DNI o correo ya está registrado",
        code: 'DUPLICATE_ENTRY'
      });
    }
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      code: 'INTERNAL_ERROR'
    });
  }
});


/////////////////////////////////////
// 🚩 ACTIVAR O DESACTIVAR USUARIO
/////////////////////////////////////
router.patch("/:id/estado", async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  if (activo === undefined) {
    return res.status(400).json({ error: "El campo 'activo' es obligatorio" });
  }

  try {
    const [result] = await db.execute(
      "UPDATE usuarios SET activo = ? WHERE id = ?",
      [activo ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Opcional: guardar en bitácora
    await registrarBitacora(
      `Cambio de estado del usuario a ${activo ? "activo" : "inactivo"}`,
      req.usuario?.nombre_completo || "Sistema",
      id
    );

    res.json({ success: true, message: `Usuario ${activo ? "activado" : "desactivado"} correctamente` });
  } catch (error) {
    console.error("❌ Error al cambiar estado del usuario:", error);
    res.status(500).json({ error: "Error interno al cambiar estado del usuario" });
  }
});


///////////////////////////
// 🚩 ELIMINAR USUARIO
///////////////////////////
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.execute("DELETE FROM usuarios WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error interno al eliminar usuario" });
  }
});

//////////////////////////////////////
// 🚩 OBTENER TODOS LOS USUARIOS CON ROLES
//////////////////////////////////////
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        u.id,
        u.nombre_completo,
        u.dni,
        u.edad,
        u.fecha_nacimiento,
        u.direccion,
        u.area_laboral,
        u.cargo,
        u.telefono,
        u.correo,
        u.activo,
        IFNULL(
          JSON_ARRAYAGG(
            JSON_OBJECT('id', r.id, 'nombre', r.nombre)
          ),
          JSON_ARRAY()
        ) AS roles
      FROM usuarios u
      LEFT JOIN usuario_rol ur ON ur.usuario_id = u.id
      LEFT JOIN roles r ON ur.rol_id = r.id
      GROUP BY u.id
      ORDER BY u.nombre_completo
    `);

    const usuarios = rows.map((u) => ({
      ...u,
      roles: JSON.parse(u.roles).filter((r) => r.id !== null),
    }));

    res.json(usuarios);
  } catch (error) {
    console.error("❌ Error al obtener usuarios con roles:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/////////////////////////////
// 🚩 ACTUALIZAR ROLES
/////////////////////////////
router.put("/:usuarioId/roles", async (req, res) => {
  const { usuarioId } = req.params;
  const { roles } = req.body;

  if (!Array.isArray(roles)) {
    return res.status(400).json({ error: "El campo 'roles' debe ser un array de IDs de roles" });
  }

  try {
    await db.execute("DELETE FROM usuario_rol WHERE usuario_id = ?", [usuarioId]);
    for (const rolId of roles) {
      await db.execute("INSERT INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)", [usuarioId, rolId]);
    }
    const [rolesAsignados] = await db.execute(`
      SELECT r.id, r.nombre
      FROM usuario_rol ur
      JOIN roles r ON ur.rol_id = r.id
      WHERE ur.usuario_id = ?`, [usuarioId]);

    res.json({ roles: rolesAsignados });
  } catch (error) {
    console.error("❌ Error al actualizar roles del usuario:", error);
    res.status(500).json({ error: "Error interno al actualizar roles" });
  }
});

module.exports = router;
