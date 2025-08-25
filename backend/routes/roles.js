const express = require("express");
const router = express.Router();
const db = require("../config/db");

///////////////////////////////
// 🚩 OBTENER TODOS LOS ROLES
///////////////////////////////
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM roles ORDER BY nombre");
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.error("❌ Error al obtener roles:", error);
    res.status(500).json({ error: "Error al obtener la lista de roles" });
  }
});

//////////////////////////////////////
// 🚩 OBTENER ROLES DE UN USUARIO
//////////////////////////////////////
router.get("/usuario/:usuarioId", async (req, res) => {
  const { usuarioId } = req.params;
  try {
    const [roles] = await db.execute(
      `SELECT r.id, r.nombre 
       FROM usuario_rol ur
       JOIN roles r ON ur.rol_id = r.id
       WHERE ur.usuario_id = ?`,
      [usuarioId]
    );

    res.json(Array.isArray(roles) ? roles : []);
  } catch (error) {
    console.error("❌ Error al obtener roles del usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//////////////////////////////////////////////////
// 🚩 OBTENER TODOS LOS USUARIOS CON SUS ROLES
//////////////////////////////////////////////////
router.get("/usuarios-con-roles", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        u.id, u.nombre_completo, u.dni, u.area_laboral,
        IFNULL(
          JSON_ARRAYAGG(
            IF(r.id IS NOT NULL, JSON_OBJECT('id', r.id, 'nombre', r.nombre), NULL)
          ), JSON_ARRAY()
        ) AS roles
      FROM usuarios u
      LEFT JOIN usuario_rol ur ON ur.usuario_id = u.id
      LEFT JOIN roles r ON ur.rol_id = r.id
      GROUP BY u.id
      ORDER BY u.nombre_completo
    `);

    const usuarios = rows.map((u) => ({
      ...u,
      roles:
        typeof u.roles === "string" && u.roles.length > 0
          ? JSON.parse(u.roles).filter((r) => r && r.id !== null)
          : [],
    }));

    res.json(usuarios);
  } catch (error) {
    console.error("❌ Error al obtener usuarios con roles:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//////////////////////////
// 🚩 CREAR NUEVO ROL
//////////////////////////
router.post("/", async (req, res) => {
  const { nombre } = req.body;
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: "El nombre del rol es obligatorio" });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO roles (nombre, activo) VALUES (?, 1)",
      [nombre.trim()]
    );

    const [nuevoRol] = await db.execute("SELECT * FROM roles WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json(nuevoRol[0]);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "El nombre del rol ya existe" });
    }
    console.error("❌ Error al crear rol:", error);
    res.status(500).json({ error: "Error al crear el rol" });
  }
});

//////////////////////////
// 🚩 ACTUALIZAR ROL
//////////////////////////
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: "El nombre del rol es obligatorio" });
  }

  try {
    const [result] = await db.execute(
      "UPDATE roles SET nombre = ? WHERE id = ?",
      [nombre.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }

    const [rolActualizado] = await db.execute(
      "SELECT * FROM roles WHERE id = ?",
      [id]
    );
    res.json(rolActualizado[0]);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "El nombre del rol ya existe" });
    }
    console.error("❌ Error al actualizar rol:", error);
    res.status(500).json({ error: "Error al actualizar el rol" });
  }
});

//////////////////////////
// 🚩 ELIMINAR ROL
//////////////////////////
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar si está en uso
    const [usuariosConRol] = await db.execute(
      "SELECT COUNT(*) as count FROM usuario_rol WHERE rol_id = ?",
      [id]
    );
    if (usuariosConRol[0].count > 0) {
      return res.status(400).json({
        error: "No se puede eliminar el rol porque está asignado a usuarios",
      });
    }

    // Proteger rol de Administrador
    const [role] = await db.execute("SELECT nombre FROM roles WHERE id = ?", [
      id,
    ]);
    if (role[0]?.nombre?.toLowerCase() === "administrador") {
      return res
        .status(400)
        .json({ error: "No se puede eliminar el rol de Administrador" });
    }

    const [result] = await db.execute("DELETE FROM roles WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }

    res.json({ message: "Rol eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar rol:", error);
    res.status(500).json({ error: "Error al eliminar el rol" });
  }
});

/////////////////////////////////
// 🚩 ACTIVAR / DESACTIVAR ROL
/////////////////////////////////
router.patch("/:id/estado", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute("SELECT activo FROM roles WHERE id = ?", [
      id,
    ]);

    if (result.length === 0) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }

    const estadoActual = Number(result[0].activo);
    const nuevoEstado = estadoActual === 1 ? 0 : 1;

    await db.execute("UPDATE roles SET activo = ? WHERE id = ?", [
      nuevoEstado,
      id,
    ]);

    res.json({
      message: `Rol ${nuevoEstado ? "activado" : "desactivado"} correctamente`,
      id,
      activo: nuevoEstado,
    });
  } catch (error) {
    console.error("❌ Error al cambiar estado del rol:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
