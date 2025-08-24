// backend/pruebaEmail.js

require("dotenv").config();
const enviarCorreo = require("./utils/enviarCorreo");

(async () => {
  try {
    await enviarCorreo(
      "tu_correo_personal@gmail.com", // 🔸 Cambia por tu correo personal
      "✅ Prueba de envío desde Sistema Vacunación",
      "<h3>¡Correo de prueba enviado correctamente!</h3><p>Si ves este mensaje, la configuración funciona.</p>"
    );
    console.log("✅ Correo de prueba enviado correctamente.");
  } catch (error) {
    console.error("❌ Error al enviar correo de prueba:", error);
  }
})();
