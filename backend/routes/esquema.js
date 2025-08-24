const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Obtener todos los esquemas, o filtrado por vacuna
router.get("/", async (req, res) => {
  try {
    const { vacuna_id } = req.query;
    let query = "SELECT * FROM esquema_vacunacion";
    let params = [];
    if (vacuna_id) {
      query += " WHERE vacuna_id = ?";
      params.push(vacuna_id);
    }
    const [result] = await db.execute(query, params);
    res.json(result);
  } catch (error) {
    console.error("❌ Error al obtener esquemas:", error);
    res.status(500).json({ error: "Error al obtener los esquemas" });
  }
});

// Registrar nuevo esquema
router.post("/", async (req, res) => {
  const { vacuna_id, edad_recomendada, grupo_riesgo, tipo_dosis } = req.body;

  if (!vacuna_id || !edad_recomendada) {
    return res.status(400).json({
      error: "❌ Los datos del esquema de vacunación son obligatorios.",
    });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO esquema_vacunacion (vacuna_id, edad_recomendada, grupo_riesgo, tipo_dosis)
       VALUES (?, ?, ?, ?)`,
      [vacuna_id, edad_recomendada, grupo_riesgo || null, tipo_dosis || null]
    );
    res.status(201).json({
      id: result.insertId,
      mensaje: "✅ Esquema de vacunación registrado",
    });
  } catch (error) {
    console.error("❌ Error al registrar esquema:", error);
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// Actualizar un esquema de vacunación
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { vacuna_id, edad_recomendada, grupo_riesgo, tipo_dosis } = req.body;

  if (!vacuna_id || !edad_recomendada) {
    return res.status(400).json({
      error: "❌ Los datos del esquema de vacunación son obligatorios.",
    });
  }

  try {
    const [result] = await db.execute(
      `UPDATE esquema_vacunacion SET vacuna_id = ?, edad_recomendada = ?, grupo_riesgo = ?, tipo_dosis = ? WHERE id = ?`,
      [
        vacuna_id,
        edad_recomendada,
        grupo_riesgo || null,
        tipo_dosis || null,
        id,
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Esquema no encontrado." });
    }
    res.json({ mensaje: "✅ Esquema actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar esquema:", error);
    res.status(500).json({ error: "Error al actualizar esquema" });
  }
});

// Eliminar un esquema de vacunación
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute(
      "DELETE FROM esquema_vacunacion WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Esquema no encontrado." });
    }
    res.json({ mensaje: "✅ Esquema eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar esquema:", error);
    res.status(500).json({ error: "Error al eliminar esquema" });
  }
});

module.exports = router;
