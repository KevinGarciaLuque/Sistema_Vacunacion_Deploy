const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ==========================
// Función utilitaria para rango de fechas
// ==========================
function obtenerFechasFiltro(req) {
  let { desde, hasta } = req.query;
  if (!desde || !hasta) {
    const hoy = new Date();
    hasta = hoy.toISOString().split("T")[0];
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    desde = primerDiaMes.toISOString().split("T")[0];
  }
  return { desde, hasta };
}

// ===========================
// DASHBOARD PRINCIPAL
// ===========================
router.get("/dashboard", async (req, res) => {
  const { desde, hasta } = obtenerFechasFiltro(req);
  try {
    // Total de usuarios
    const [usuarios] = await db.query("SELECT COUNT(*) AS total FROM usuarios");

    // Total de vacunas aplicadas en rango
    const [vacunas] = await db.query(
      `SELECT COUNT(*) AS total FROM historial_vacunas WHERE fecha_aplicacion BETWEEN ? AND ?`,
      [desde, hasta]
    );

    // Total de vacunas aplicadas HOY
    const [vacunasHoy] = await db.query(
      `SELECT COUNT(*) AS total FROM historial_vacunas WHERE fecha_aplicacion = CURDATE()`
    );

    // Cálculo de crecimiento mensual
    const [actualMes] = await db.query(
      `SELECT COUNT(*) AS total FROM historial_vacunas WHERE MONTH(fecha_aplicacion) = MONTH(CURDATE()) AND YEAR(fecha_aplicacion) = YEAR(CURDATE())`
    );

    const [mesAnterior] = await db.query(
      `SELECT COUNT(*) AS total FROM historial_vacunas WHERE MONTH(fecha_aplicacion) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(fecha_aplicacion) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))`
    );

    let tasaCrecimiento = 0;
    if (mesAnterior[0].total > 0) {
      tasaCrecimiento = ((actualMes[0].total - mesAnterior[0].total) / mesAnterior[0].total) * 100;
      tasaCrecimiento = Math.round(tasaCrecimiento);
    } else if (actualMes[0].total > 0) {
      tasaCrecimiento = 100;
    }

    // Tipos de vacunas aplicadas
    const [tiposVacunas] = await db.query(
      `SELECT v.nombre AS vacuna, COUNT(h.id) AS total FROM historial_vacunas h JOIN vacunas v ON h.vacuna_id = v.id WHERE h.fecha_aplicacion BETWEEN ? AND ? GROUP BY v.nombre ORDER BY total DESC`,
      [desde, hasta]
    );

    // Últimas actividades de bitácora
    const [actividades] = await db.query(
      `SELECT accion, realizado_por, fecha FROM bitacora ORDER BY fecha DESC LIMIT 5`
    );

    res.json({
      usuarios: usuarios[0].total,
      vacunas: vacunas[0].total,
      vacunas_hoy: vacunasHoy[0].total,
      crecimiento: tasaCrecimiento,
      tiposVacunas,
      actividades,
    });

  } catch (error) {
    console.error("❌ Error en /dashboard:", error);
    res.status(500).json({ error: "Error en dashboard" });
  }
});

// ===========================
// VACUNAS APLICADAS DETALLE
// ===========================
router.get("/vacunas-aplicadas", async (req, res) => {
  const { desde, hasta } = obtenerFechasFiltro(req);
  try {
    const [resultados] = await db.query(
      `SELECT hv.id, u.nombre_completo, v.nombre AS vacuna, hv.fecha_aplicacion, hv.dosis, hv.lote, hv.responsable, hv.via_administracion, hv.sitio_aplicacion
       FROM historial_vacunas hv
       LEFT JOIN usuarios u ON hv.usuario_id = u.id
       LEFT JOIN vacunas v ON hv.vacuna_id = v.id
       WHERE hv.fecha_aplicacion BETWEEN ? AND ?
       ORDER BY hv.fecha_aplicacion DESC`,
      [desde, hasta]
    );
    res.json(resultados);
  } catch (error) {
    console.error("❌ Error en /vacunas-aplicadas:", error);
    res.status(500).json({ error: "Error al obtener vacunas aplicadas" });
  }
});

// ===========================
// EXPORTACIONES COMPLETAS POR MÓDULO
// ===========================

// USUARIOS COMPLETOS
router.get("/usuarios-completo", async (req, res) => {
  try {
    const [usuarios] = await db.query(
      `SELECT id, nombre_completo, dni, sexo, fecha_nacimiento, telefono, direccion, creado_en FROM usuarios`
    );
    res.json(usuarios);
  } catch (error) {
    console.error("❌ Error en /usuarios-completo:", error);
    res.status(500).json({ error: "Error al obtener usuarios completos" });
  }
});

// VACUNAS COMPLETAS
router.get("/vacunas-completo", async (req, res) => {
  try {
    const [vacunas] = await db.query(`SELECT * FROM vacunas`);
    res.json(vacunas);
  } catch (error) {
    console.error("❌ Error en /vacunas-completo:", error);
    res.status(500).json({ error: "Error al obtener vacunas" });
  }
});

// CITAS COMPLETAS (VACUNAS PROGRAMADAS)
router.get("/citas-completo", async (req, res) => {
  try {
    const [citas] = await db.query(
      `SELECT vpf.id, u.nombre_completo, vpf.vacuna, vpf.fecha, vpf.tipo_dosis
       FROM vacunas_por_fecha vpf
       JOIN usuarios u ON vpf.usuario_id = u.id
       ORDER BY vpf.fecha DESC`
    );
    res.json(citas);
  } catch (error) {
    console.error("❌ Error en /citas-completo:", error);
    res.status(500).json({ error: "Error al obtener citas" });
  }
});

// BITÁCORA COMPLETA
router.get("/bitacora-completo", async (req, res) => {
  try {
    const [bitacora] = await db.query(
      `SELECT b.*, u.nombre_completo FROM bitacora b LEFT JOIN usuarios u ON b.usuario_id = u.id ORDER BY fecha DESC`
    );
    res.json(bitacora);
  } catch (error) {
    console.error("❌ Error en /bitacora-completo:", error);
    res.status(500).json({ error: "Error al obtener bitácora" });
  }
});

// TIPOS DE VACUNAS
router.get("/tipos-vacunas", async (req, res) => {
  const { desde, hasta } = obtenerFechasFiltro(req);
  try {
    const [tipos] = await db.query(
      `SELECT v.nombre AS vacuna, COUNT(h.id) AS total
       FROM historial_vacunas h
       JOIN vacunas v ON h.vacuna_id = v.id
       WHERE h.fecha_aplicacion BETWEEN ? AND ?
       GROUP BY v.nombre`,
      [desde, hasta]
    );
    res.json(tipos);
  } catch (error) {
    console.error("❌ Error en /tipos-vacunas:", error);
    res.status(500).json({ error: "Error al obtener tipos de vacunas" });
  }
});

// CRECIMIENTO MENSUAL
router.get("/crecimiento", async (req, res) => {
  try {
    const [resultados] = await db.query(
      `SELECT DATE_FORMAT(fecha_aplicacion, '%Y-%m') AS mes, COUNT(*) AS total
       FROM historial_vacunas
       GROUP BY mes
       ORDER BY mes DESC`
    );
    res.json(resultados);
  } catch (error) {
    console.error("❌ Error en /crecimiento:", error);
    res.status(500).json({ error: "Error al obtener crecimiento" });
  }
});

// ===========================
// PROGRESO MENSUAL PARA DASHBOARD
// ===========================
// backend/routes/reportes.js

router.get("/progreso-mensual", async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    if (!desde || !hasta) return res.status(400).json({ error: "Faltan fechas" });

    // Vacunas aplicadas por mes (en rango)
    const [vacunas] = await db.query(`
      SELECT MONTH(fecha_aplicacion) AS mes, COUNT(*) AS total
      FROM historial_vacunas
      WHERE fecha_aplicacion BETWEEN ? AND ?
      GROUP BY mes
    `, [desde, hasta]);

    // Registros de usuario por mes (en rango)
    const [usuarios] = await db.query(`
      SELECT MONTH(creado_en) AS mes, COUNT(*) AS total
      FROM usuarios
      WHERE creado_en BETWEEN ? AND ?
      GROUP BY mes
    `, [desde, hasta]);

    // Vacunas aplicadas HOY (solo si el día está dentro del rango)
    let vacunasHoy = [{ total: 0 }];
    const fechaHoy = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    if (fechaHoy >= desde && fechaHoy <= hasta) {
      [vacunasHoy] = await db.query(`
        SELECT COUNT(*) AS total
        FROM historial_vacunas
        WHERE DATE(fecha_aplicacion) = CURDATE()
      `);
    }

    res.json({ vacunas, usuarios, vacunasHoy: vacunasHoy[0]?.total || 0 });
  } catch (error) {
    console.error("❌ Error en /progreso-mensual:", error);
    res.status(500).json({ error: "Error al obtener progreso mensual" });
  }
});






// Devuelve todos los años en los que hay datos en historial_vacunas
router.get("/anios-disponibles", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT YEAR(fecha_aplicacion) AS anio FROM historial_vacunas ORDER BY anio ASC`
    );
    const anios = rows.map(r => r.anio);
    res.json({ anios });
  } catch (error) {
    res.json({ anios: [new Date().getFullYear()] });
  }
});


module.exports = router;
