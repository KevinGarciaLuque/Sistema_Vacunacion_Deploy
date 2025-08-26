///////////////// Para trabajar LOCAL/LAN //////////////////////////////
/*const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS SOLO LOCAL
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // si guardas imágenes ahí

// Salud
app.get("/", (req, res) => {
  res.json({ api: "Sistema Vacunación v1.0", status: "ok" });
});

// Rutas
app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/vacunas", require("./routes/vacunas"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/historial", require("./routes/historial"));
app.use("/api/bitacora", require("./routes/bitacora"));
app.use("/api/roles", require("./routes/roles"));
app.use("/api/carousel", require("./routes/carousel"));
app.use("/api/vacunas_aplicadas", require("./routes/vacunas_aplicadas"));
app.use("/api/reportes", require("./routes/reportes"));
app.use("/api/upload-sobre-nosotros", require("./routes/uploadSobreNosotros"));
app.use("/api/sobre-nosotros", require("./routes/sobreNosotros"));

// 404
app.use((req, res) =>
  res.status(404).json({ message: "🚫 Ruta no encontrada" })
);

// 500
app.use((err, req, res, next) => {
  console.error("❌ Error interno:", err);
  res.status(500).json({ message: "Error interno del servidor" });
});

// Iniciar (local)
app.listen(PORT, "127.0.0.1", () => {
  console.log(`✅ API escuchando en http://localhost:${PORT}`);
});*/



///////////////////// Backend Sistema Vacunación Railway /////////////////////
///////////////////// Backend Sistema Vacunación Railway /////////////////////
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ====== Config básica ======
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0"; // Railway necesita 0.0.0.0
app.use(express.json());

// ====== CORS (local, LAN y Railway) ======
/**
 * FRONTEND_URL -> https://frontend-production-c51d.up.railway.app
 * EXTRA_ORIGINS -> lista separada por comas para permitir IPs LAN
 *   Ejemplo: http://192.168.10.221:5173,http://192.168.10.221
 */
const allowed = new Set([
  "http://localhost:5173",
  process.env.FRONTEND_URL || "",
  ...(process.env.EXTRA_ORIGINS ? process.env.EXTRA_ORIGINS.split(",") : []),
]);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // Permitir Postman/curl sin Origin
      try {
        const url = new URL(origin);

        const ok =
          allowed.has(origin) ||
          url.hostname.endsWith(".railway.app"); // aceptar cualquier subdominio Railway

        if (ok) return cb(null, origin);
        return cb(new Error("CORS bloqueado: " + origin), false);
      } catch (e) {
        return cb(new Error("Origen inválido: " + origin), false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // 👈 incluí PATCH
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ====== Estáticos ======
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 
app.use("/sobre_nosotros", express.static(path.join(__dirname, "public", "sobre_nosotros"))); // 👈 para imágenes

// ====== Salud ======
app.get("/", (req, res) => {
  res.json({ api: "Sistema Vacunación v1.0", status: "ok" });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "development" });
});

// ====== Rutas ======
app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/vacunas", require("./routes/vacunas"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/historial", require("./routes/historial"));
app.use("/api/bitacora", require("./routes/bitacora"));
app.use("/api/roles", require("./routes/roles"));
app.use("/api/carousel", require("./routes/carousel"));
app.use("/api/vacunas-aplicadas", require("./routes/vacunas_aplicadas"));
app.use("/api/reportes", require("./routes/reportes"));
app.use("/api/upload-sobre-nosotros", require("./routes/uploadSobreNosotros"));
app.use("/api/sobre-nosotros", require("./routes/sobreNosotros"));

// ====== 404 ======
app.use((req, res) =>
  res.status(404).json({ message: "🚫 Ruta no encontrada" })
);

// ====== 500 ======
app.use((err, req, res, next) => {
  console.error("❌ Error interno:", err);
  res.status(500).json({ message: "Error interno del servidor" });
});

// ====== Iniciar (local/Railway) ======
app.listen(PORT, HOST, () => {
  console.log(`✅ API escuchando en http://${HOST}:${PORT}`);
  if (process.env.FRONTEND_URL) {
    console.log("CORS permite:", process.env.FRONTEND_URL);
  }
  if (process.env.EXTRA_ORIGINS) {
    console.log("CORS extra:", process.env.EXTRA_ORIGINS);
  }
});






///////////////// Para Producción en IIS por el puerto 192.168.10.221:8084 //////////////////////

/*const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ==========================
// CORS dinámico (acepta cualquier host en el puerto 8084)
// ==========================
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      // Permitir peticiones sin origen (ej: Postman, curl)
      return callback(null, true);
    }

    try {
      const url = new URL(origin);
      // ✅ Permitir cualquier host siempre que use el puerto 8084
      if (url.port === "8084") {
        return callback(null, true);
      }
    } catch (err) {
      return callback(new Error("Origen inválido: " + origin));
    }

    callback(new Error("No permitido por CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // 🔹 AHORA INCLUYE PATCH
  allowedHeaders: ["Content-Type", "Authorization"], // 🔹 headers comunes habilitados
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ Manejar preflight

// ==========================
// Middleware
// ==========================
app.use(express.json()); // Leer JSON
app.use(express.static(path.join(__dirname, "public"))); // Servir archivos estáticos desde /public

// ==========================
// Rutas API organizadas
// ==========================
app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/vacunas", require("./routes/vacunas"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/historial", require("./routes/historial"));
app.use("/api/bitacora", require("./routes/bitacora"));
app.use("/api/roles", require("./routes/roles"));
app.use("/api/carousel", require("./routes/carousel"));
app.use("/api/vacunas_aplicadas", require("./routes/vacunas_aplicadas"));
app.use("/api/reportes", require("./routes/reportes"));

// 🛠️ Confirmar que esta ruta fue cargada
console.log("🛠️ Ruta activa: /api/upload-sobre-nosotros");
app.use("/api/upload-sobre-nosotros", require("./routes/uploadSobreNosotros"));
app.use("/api/sobre-nosotros", require("./routes/sobreNosotros"));

// ==========================
// Servir el frontend (React Vite build)
// ==========================
const distPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(distPath));

// Fallback SPA para rutas no API
app.get("*", (req, res, next) => {
  if (req.originalUrl.startsWith("/api")) return next();
  if (req.originalUrl.includes(".")) return next(); // evitar errores con archivos estáticos
  res.sendFile(path.join(distPath, "index.html"));
});

// ==========================
// Ruta no encontrada
// ==========================
app.use((req, res) => {
  res.status(404).json({ message: "🚫 Ruta no encontrada" });
});

// ==========================
// Middleware de errores
// ==========================
app.use((err, req, res, next) => {
  console.error("❌ Error interno:", err);
  res.status(500).json({
    message: "Error interno del servidor",
    error: err.message || "Error desconocido",
  });
});

// ==========================
// Iniciar servidor
// ==========================
const PORT = process.env.PORT || 8084;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor escuchando en http://192.168.10.221:${PORT}`);
});*/
