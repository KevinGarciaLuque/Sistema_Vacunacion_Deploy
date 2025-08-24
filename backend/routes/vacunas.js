const express = require("express");
const router = express.Router();
const db = require("../config/db");
const registrarBitacora = require("../utils/registrarBitacora");

// ✅ Registrar nueva vacuna con lote, fecha_lote, responsable y stock_disponible
router.post("/", async (req, res) => {
  const {
    nombre,
    fabricante,
    dosis_requeridas,
    intervalo_dias,
    lote,
    fecha_lote,
    responsable,
    stock_disponible,
  } = req.body;

  if (
    !nombre ||
    !fabricante ||
    !dosis_requeridas ||
    !intervalo_dias ||
    !lote ||
    !fecha_lote ||
    !responsable ||
    stock_disponible === undefined
  ) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO vacunas 
      (nombre, fabricante, dosis_requeridas, intervalo_dias, lote, fecha_lote, responsable, stock_disponible, activa)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        nombre,
        fabricante,
        dosis_requeridas,
        intervalo_dias,
        lote,
        fecha_lote,
        responsable,
        stock_disponible,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      mensaje: "✅ Vacuna registrada con éxito",
    });
  } catch (error) {
    console.error("❌ Error al registrar vacuna:", error.message);
    res.status(500).json({ error: "Error al registrar la vacuna." });
  }
});


// ✅ Obtener todas las vacunas
router.get("/", async (req, res) => {
  try {
    const [results] = await db.execute(
      `SELECT id, nombre, fabricante, dosis_requeridas, intervalo_dias, lote, fecha_lote, responsable, stock_disponible, activa FROM vacunas`
    );
    res.json(results);
  } catch (error) {
    console.error("❌ Error al obtener vacunas:", error.message);
    res.status(500).json({ error: "Error al obtener vacunas." });
  }
});

// ✅ Obtener vacuna por ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.execute(
      `SELECT id, nombre, fabricante, dosis_requeridas, intervalo_dias, lote, fecha_lote, responsable, stock_disponible, activa FROM vacunas WHERE id = ?`,
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Vacuna no encontrada." });
    }

    res.json(results[0]);
  } catch (error) {
    console.error("❌ Error al obtener vacuna:", error.message);
    res.status(500).json({ error: "Error al obtener la vacuna." });
  }
});

// ✅ Actualizar vacuna
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, fabricante, dosis_requeridas, intervalo_dias, lote, fecha_lote, responsable, stock_disponible } = req.body;

  if (!nombre || !fabricante || !dosis_requeridas || !intervalo_dias || !lote || !fecha_lote || !responsable || stock_disponible === undefined) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  try {
    const [result] = await db.execute(
      `UPDATE vacunas SET nombre = ?, fabricante = ?, dosis_requeridas = ?, intervalo_dias = ?, lote = ?, fecha_lote = ?, responsable = ?, stock_disponible = ? WHERE id = ?`,
      [nombre, fabricante, dosis_requeridas, intervalo_dias, lote, fecha_lote, responsable, stock_disponible, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vacuna no encontrada." });
    }

    await registrarBitacora(
      `Actualización de vacuna ID ${id}`,
      req.usuario?.nombre_completo || "Sistema"
    );

    res.json({ mensaje: "✅ Vacuna actualizada con éxito" });
  } catch (error) {
    console.error("❌ Error al actualizar vacuna:", error.message);
    res.status(500).json({ error: "Error al actualizar la vacuna." });
  }
});

// ✅ Eliminar vacuna
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute(`DELETE FROM vacunas WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vacuna no encontrada." });
    }

    await registrarBitacora(
      `Eliminación de vacuna ID ${id}`,
      req.usuario?.nombre_completo || "Sistema"
    );

    res.json({ mensaje: "✅ Vacuna eliminada con éxito" });
  } catch (error) {
    console.error("❌ Error al eliminar vacuna:", error.message);
    res.status(500).json({ error: "Error al eliminar la vacuna." });
  }
});

// ✅ Activar/desactivar vacuna
router.patch("/:id/estado", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.execute(`SELECT activa FROM vacunas WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Vacuna no encontrada." });
    }

    const estadoActual = rows[0].activa;
    const nuevoEstado = estadoActual === 1 ? 0 : 1;

    await db.execute(`UPDATE vacunas SET activa = ? WHERE id = ?`, [nuevoEstado, id]);

    await registrarBitacora(
      `${nuevoEstado ? "Activación" : "Desactivación"} de vacuna ID ${id}`,
      req.usuario?.nombre_completo || "Sistema"
    );

    res.json({
      mensaje: `✅ Vacuna ${nuevoEstado ? "activada" : "desactivada"} correctamente`,
      id,
      activa: nuevoEstado,
    });
  } catch (error) {
    console.error("❌ Error al cambiar estado de vacuna:", error.message);
    res.status(500).json({ error: "Error al cambiar estado de la vacuna." });
  }
});

// ✅ Restar stock disponible de una vacuna
router.patch("/:id/restar-stock", async (req, res) => {
  const { id } = req.params;
  try {
    const [vacuna] = await db.execute(`SELECT stock_disponible FROM vacunas WHERE id = ?`, [id]);
    if (vacuna.length === 0) {
      return res.status(404).json({ error: "Vacuna no encontrada." });
    }

    if (vacuna[0].stock_disponible <= 0) {
      return res.status(400).json({ error: "Stock insuficiente para esta vacuna." });
    }

    await db.execute(`UPDATE vacunas SET stock_disponible = stock_disponible - 1 WHERE id = ?`, [id]);

    await registrarBitacora(
      `Aplicación de vacuna ID ${id} - stock restado`,
      req.usuario?.nombre_completo || "Sistema"
    );

    res.json({ mensaje: "✅ Stock de vacuna actualizado correctamente." });
  } catch (error) {
    console.error("❌ Error al restar stock de vacuna:", error.message);
    res.status(500).json({ error: "Error al actualizar el stock de la vacuna." });
  }
});


// ✅ Obtener cantidad de vacunas aplicadas HOY por ID
router.get("/:id/aplicadas-hoy", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute(
      `SELECT COUNT(*) as total_aplicadas 
       FROM historial_vacunas 
       WHERE vacuna_id = ? 
       AND DATE(fecha_aplicacion) = CURDATE()`,
      [id]
    );

    res.json({ total_aplicadas: result[0].total_aplicadas });
  } catch (error) {
    console.error("❌ Error al obtener las aplicaciones de hoy:", error.message);
    res.status(500).json({ error: "Error al consultar las vacunas aplicadas hoy." });
  }
});


module.exports = router;
