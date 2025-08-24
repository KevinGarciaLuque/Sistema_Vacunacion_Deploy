const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ Helper seguro para obtener contenido
// Helper para obtener contenido actual de forma segura
async function obtenerContenidoActual() {
    const [rows] = await db.query("SELECT contenido FROM sobre_nosotros WHERE id = 1");
    if (rows.length > 0 && rows[0].contenido) {
        try {
            // ✅ Si MySQL devuelve objeto, devuélvelo directo
            const contenido = typeof rows[0].contenido === "string"
                ? JSON.parse(rows[0].contenido)
                : rows[0].contenido;

            return contenido;
        } catch (err) {
            console.error("❌ Error al parsear JSON en sobre_nosotros:", err);
            return null;
        }
    } else {
        console.error("❌ Contenido no encontrado o está vacío en sobre_nosotros.");
        return null;
    }
}

// ✅ Obtener todo el contenido
// =============================
// Obtener todo el contenido
// =============================
router.get("/", async (req, res) => {
    try {
        const contenido = await obtenerContenidoActual();
        if (contenido) {
            res.json(contenido);
        } else {
            res.status(404).json({ error: "Contenido no encontrado o inválido" });
        }
    } catch (error) {
        console.error("❌ Error obteniendo contenido:", error);
        res.status(500).json({ error: "Error obteniendo contenido" });
    }
});

// ✅ Actualizar todo el contenido
router.put("/", async (req, res) => {
    const { contenido } = req.body;
    if (!contenido || typeof contenido !== "object") {
        return res.status(400).json({ error: "Contenido inválido para actualizar" });
    }
    try {
        await db.query("UPDATE sobre_nosotros SET contenido = ?, actualizado_en = NOW() WHERE id = 1", [JSON.stringify(contenido)]);
        res.json({ message: "Contenido actualizado correctamente" });
    } catch (err) {
        console.error("❌ Error actualizando contenido:", err);
        res.status(500).json({ error: "Error actualizando contenido" });
    }
});
// =============================
// Agregar nueva sección
// =============================
router.post("/secciones", async (req, res) => {
    const nuevaSeccion = req.body;
    try {
        const contenido = await obtenerContenidoActual();
        if (!contenido || typeof contenido !== "object") {
            return res.status(404).json({ error: "Contenido no encontrado o inválido" });
        }

        if (!Array.isArray(contenido.secciones)) {
            contenido.secciones = [];
        }

        contenido.secciones.push(nuevaSeccion);

        await db.query(
            "UPDATE sobre_nosotros SET contenido = ? WHERE id = 1",
            [JSON.stringify(contenido)]
        );

        res.json({ message: "Sección agregada correctamente", nuevaSeccion });
    } catch (error) {
        console.error("❌ Error agregando sección:", error);
        res.status(500).json({ error: "Error agregando sección", detalles: error.message });
    }
});



// ✅ Editar sección por índice
router.put("/secciones/:index", async (req, res) => {
    const index = parseInt(req.params.index);
    const datosActualizados = req.body;
    if (!datosActualizados || typeof datosActualizados !== "object") {
        return res.status(400).json({ error: "Datos inválidos para actualizar sección" });
    }
    try {
        const contenido = await obtenerContenidoActual();
        if (!contenido) return res.status(404).json({ error: "Contenido no encontrado" });
        if (!Array.isArray(contenido.secciones) || index < 0 || index >= contenido.secciones.length) {
            return res.status(400).json({ error: "Índice de sección inválido" });
        }

        contenido.secciones[index] = datosActualizados;

        await db.query("UPDATE sobre_nosotros SET contenido = ?, actualizado_en = NOW() WHERE id = 1", [JSON.stringify(contenido)]);
        res.json({ message: "Sección actualizada correctamente", datosActualizados });
    } catch (err) {
        console.error("❌ Error actualizando sección:", err);
        res.status(500).json({ error: "Error actualizando sección" });
    }
});

// ✅ Eliminar sección por índice
router.delete("/secciones/:index", async (req, res) => {
    const index = parseInt(req.params.index);
    try {
        const contenido = await obtenerContenidoActual();
        if (!contenido) return res.status(404).json({ error: "Contenido no encontrado" });
        if (!Array.isArray(contenido.secciones) || index < 0 || index >= contenido.secciones.length) {
            return res.status(400).json({ error: "Índice de sección inválido" });
        }

        const seccionEliminada = contenido.secciones.splice(index, 1);
        await db.query("UPDATE sobre_nosotros SET contenido = ?, actualizado_en = NOW() WHERE id = 1", [JSON.stringify(contenido)]);
        res.json({ message: "Sección eliminada correctamente", seccionEliminada });
    } catch (err) {
        console.error("❌ Error eliminando sección:", err);
        res.status(500).json({ error: "Error eliminando sección" });
    }
});

module.exports = router;
