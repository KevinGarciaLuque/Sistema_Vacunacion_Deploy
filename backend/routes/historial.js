const express = require("express");
const router = express.Router();
const db = require("../config/db");

//******* Obtener historial por DNI ***********//
router.get("/:dni", async (req, res) => {
  const { dni } = req.params;
  if (!dni) return res.status(400).json({ error: "El DNI es obligatorio." });

  try {
    const [userResults] = await db.execute(
      "SELECT * FROM usuarios WHERE dni = ?",
      [dni]
    );

    if (userResults.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const [historial] = await db.execute(
      `SELECT hv.id, v.nombre AS nombre_vacuna, v.fabricante, hv.dosis, hv.fecha_aplicacion,
              hv.proxima_dosis, hv.estado, hv.responsable, hv.vacuna_id, hv.usuario_id,
              hv.lote, hv.via_administracion, hv.sitio_aplicacion
       FROM historial_vacunas hv
       JOIN vacunas v ON hv.vacuna_id = v.id
       WHERE hv.usuario_id = ?
       ORDER BY hv.fecha_aplicacion DESC`,
      [userResults[0].id]
    );

    res.status(200).json({
      usuario: userResults[0],
      historial,
    });
  } catch (error) {
    console.error("❌ Error al obtener historial:", error);
    res.status(500).json({ error: "Error interno al obtener historial" });
  }
});

//******* Obtener historial por usuario_id ***********//
router.get("/usuario/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;
  if (!usuario_id) return res.status(400).json({ error: "El usuario_id es obligatorio." });

  try {
    const [historial] = await db.execute(
      `SELECT hv.id,
              v.nombre AS nombre_vacuna,
              v.fabricante,
              hv.dosis,
              hv.fecha_aplicacion,
              hv.proxima_dosis,
              hv.estado,
              COALESCE(hv.responsable, v.responsable) AS responsable,
              hv.vacuna_id,
              hv.usuario_id,
              hv.lote,
              hv.via_administracion,
              hv.sitio_aplicacion
       FROM historial_vacunas hv
       JOIN vacunas v ON hv.vacuna_id = v.id
       WHERE hv.usuario_id = ?
       ORDER BY hv.fecha_aplicacion DESC`,
      [usuario_id]
    );

    res.status(200).json(historial);
  } catch (error) {
    console.error("❌ Error al obtener historial por usuario_id:", error);
    res.status(500).json({ error: "Error interno al obtener historial por usuario" });
  }
});

//******* Registrar nueva vacunación evitando duplicados ***********//
//******* Registrar nueva vacunación evitando duplicados de dosis ***********//
router.post("/", async (req, res) => {
  const {
    usuario_id,
    vacuna_id,
    dosis,
    fecha_aplicacion,
    proxima_dosis,
    estado,
    responsable,
    via_administracion,
    sitio_aplicacion,
    lote // ✅ agregar para recibir del frontend
  } = req.body;

  if (![usuario_id, vacuna_id, dosis, fecha_aplicacion, responsable].every(Boolean)) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  try {
    // 🚩 VALIDACIÓN: verificar si ya existe la misma dosis de la misma vacuna
    const [existing] = await db.execute(
      `SELECT id, fecha_aplicacion FROM historial_vacunas
       WHERE usuario_id = ? AND vacuna_id = ? AND dosis = ?`,
      [usuario_id, vacuna_id, dosis]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: `El usuario ya tiene registrada esta vacuna con la dosis ${dosis} (fecha: ${new Date(existing[0].fecha_aplicacion).toLocaleDateString('es-ES')}). No se puede registrar de nuevo.`,
      });
    }

    // ✅ Agregar 'lote' al insert
    const [result] = await db.execute(
      `INSERT INTO historial_vacunas 
        (usuario_id, vacuna_id, dosis, fecha_aplicacion, proxima_dosis, estado, responsable, via_administracion, sitio_aplicacion, lote)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario_id,
        vacuna_id,
        dosis,
        fecha_aplicacion,
        proxima_dosis || null,
        estado || "Pendiente",
        responsable,
        via_administracion || null,
        sitio_aplicacion || null,
        lote || null // ✅ ahora se insertará en la tabla correctamente
      ]
    );

    res.status(201).json({
      id: result.insertId,
      mensaje: "✅ Vacuna registrada con éxito",
    });
  } catch (error) {
    console.error("❌ Error al registrar vacunación:", error.message);
    res.status(500).json({ error: "Error al registrar vacunación" });
  }
});


//******* Actualizar vacuna aplicada ***********//
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { fecha_aplicacion, responsable } = req.body;

  if (!fecha_aplicacion || !responsable) {
    return res
      .status(400)
      .json({ error: "Fecha de aplicación y responsable son obligatorios." });
  }

  try {
    await db.execute(
      `UPDATE historial_vacunas
       SET fecha_aplicacion = ?, responsable = ?
       WHERE id = ?`,
      [fecha_aplicacion, responsable, id]
    );

    res.status(200).json({ mensaje: "✅ Vacuna actualizada correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar vacunación:", error.message);
    res.status(500).json({ error: "Error al actualizar vacunación" });
  }
});

//******* Eliminar vacuna aplicada ***********//
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute(`DELETE FROM historial_vacunas WHERE id = ?`, [id]);
    res.status(200).json({ mensaje: "✅ Vacuna eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar vacunación:", error.message);
    res.status(500).json({ error: "Error al eliminar vacunación" });
  }
});

module.exports = router;
