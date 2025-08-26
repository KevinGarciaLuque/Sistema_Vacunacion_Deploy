// backend/routes/uploadSobreNosotros.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const router = express.Router();

// 📂 Carpeta donde se guardarán las imágenes
const UPLOAD_DIR = path.join(__dirname, "..", "public", "sobre_nosotros");

// Crear carpeta si no existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ⚙️ Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = uuidv4() + ext;
    cb(null, uniqueName);
  },
});

// 🔒 Filtro de archivos: solo imágenes
function fileFilter(req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("❌ Tipo de archivo no permitido. Solo imágenes."), false);
  }
}

const upload = multer({ storage, fileFilter });

// 📌 Endpoint de subida
router.post("/", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se proporcionó archivo." });
    }

    // Construir la URL completa con el dominio del backend
    const backendUrl = process.env.BACKEND_URL || "";
    const fileUrl = `${backendUrl}/sobre_nosotros/${req.file.filename}`;

    res.json({
      message: "✅ Imagen subida correctamente",
      url: fileUrl,
    });
  } catch (error) {
    console.error("❌ Error subiendo imagen:", error);
    res.status(500).json({ error: "Error interno al subir imagen" });
  }
});

module.exports = router;
