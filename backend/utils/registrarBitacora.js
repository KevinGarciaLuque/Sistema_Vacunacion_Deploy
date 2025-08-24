const db = require("../config/db");

const registrarBitacora = async (accion, realizado_por, usuario_id = null) => {
  try {
    await db.execute(
      "INSERT INTO bitacora (accion, realizado_por, usuario_id) VALUES (?, ?, ?)",
      [accion, realizado_por, usuario_id]
    );
    console.log(`✅ Bitácora: ${accion} realizada por ${realizado_por}`);
  } catch (error) {
    console.error("❌ Error al registrar bitácora:", error.message);
  }
};

module.exports = registrarBitacora;
