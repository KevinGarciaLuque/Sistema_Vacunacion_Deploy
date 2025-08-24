const express = require("express");
const router = express.Router();
const db = require("../config/db");

const isValidDate = (dateString) => !isNaN(Date.parse(dateString));

router.get("/", async (req, res) => {
  try {
    await db.execute("SELECT 1");

    const {
      pagina = 1,
      porPagina = 10,
      fechaDesde,
      fechaHasta,
      usuario,
      accion,
    } = req.query;

    const paginaNum = parseInt(pagina);
    const porPaginaNum = parseInt(porPagina);

    if (isNaN(paginaNum) || isNaN(porPaginaNum) || paginaNum < 1 || porPaginaNum < 1) {
      return res.status(400).json({
        success: false,
        error: "Los parámetros de paginación deben ser números positivos",
      });
    }

    const offset = (paginaNum - 1) * porPaginaNum;

    let whereClauses = [];
    let params = [];

    if (fechaDesde) {
      if (!isValidDate(fechaDesde)) {
        return res.status(400).json({
          success: false,
          error: "Formato de fechaDesde inválido (use YYYY-MM-DD)",
        });
      }
      whereClauses.push("b.fecha >= ?");
      params.push(fechaDesde);
    }

    if (fechaHasta) {
      if (!isValidDate(fechaHasta)) {
        return res.status(400).json({
          success: false,
          error: "Formato de fechaHasta inválido (use YYYY-MM-DD)",
        });
      }
      whereClauses.push("b.fecha <= ?");
      params.push(`${fechaHasta} 23:59:59`);
    }

    if (usuario) {
      whereClauses.push("(b.realizado_por LIKE ? OR u.nombre_completo LIKE ?)");
      params.push(`%${usuario}%`, `%${usuario}%`);
    }

    if (accion) {
      whereClauses.push("b.accion LIKE ?");
      params.push(`%${accion}%`);
    }

    const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM bitacora b
      LEFT JOIN usuarios u ON b.usuario_id = u.id
      ${where}
    `;

    // ✅ Limitar y paginar de forma segura
    const mainQuery = `
      SELECT 
        b.id,
        b.accion,
        b.realizado_por,
        b.fecha,
        b.usuario_id,
        u.nombre_completo AS nombre_usuario
      FROM bitacora b
      LEFT JOIN usuarios u ON b.usuario_id = u.id
      ${where}
      ORDER BY b.fecha DESC
      LIMIT ${porPaginaNum} OFFSET ${offset}
    `;

    console.log("⚡ Params:", params);
    console.log("⚡ CountQuery:", countQuery);
    console.log("⚡ MainQuery:", mainQuery);

    const [countResult] = await db.execute(countQuery, params);
    const [registros] = await db.execute(mainQuery, params);

    const total = countResult[0].total;

    res.json({
      success: true,
      registros: registros,
      paginacion: {
        total,
        pagina: paginaNum,
        porPagina: porPaginaNum,
        totalPaginas: Math.ceil(total / porPaginaNum),
      },
    });

  } catch (error) {
    console.error("❌ Error en /api/bitacora:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

module.exports = router;
