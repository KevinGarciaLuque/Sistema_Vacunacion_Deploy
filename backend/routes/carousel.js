const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// 📂 Carpeta de almacenamiento de imágenes
const carouselFolder = path.join(__dirname, "../public/carousel");

// ✅ Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(carouselFolder)) {
      fs.mkdirSync(carouselFolder, { recursive: true });
      console.log("✅ Carpeta 'carousel' creada automáticamente.");
    }
    cb(null, carouselFolder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // ".jpg", ".png", etc
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    const uniqueName = Date.now() + "-" + base + ext;
    cb(null, uniqueName);
  },
});


// ✅ Filtro de archivos y límite de tamaño
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("❌ Solo se permiten archivos de imagen."));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ✅ GET /api/carousel
router.get("/", (req, res) => {
  fs.readdir(carouselFolder, (err, files) => {
    if (err) {
      console.error("❌ Error al leer la carpeta del carrusel:", err);
      return res.status(500).json({ message: "Error al leer el carrusel." });
    }

    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get("host")}`;
    const imageUrls = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file))
      .map(file => `${baseUrl}/carousel/${file}`);

    res.json(imageUrls);
  });
});

// ✅ POST /api/carousel/upload
// 👈 CAMBIO: nombre del campo debe ser 'imagenes' para coincidir con el frontend
router.post("/upload", upload.array("imagenes", 10), (req, res) => {
  console.log("✅ Imágenes subidas:", req.files.map(f => f.filename));

  const baseUrl = process.env.API_URL || `${req.protocol}://${req.get("host")}`;
  const fileData = req.files.map(f => ({
    filename: f.filename,
    url: `${baseUrl}/carousel/${f.filename}`,
  }));

  res.json({
    message: "✅ Imágenes subidas correctamente.",
    files: fileData,
  });
});

// ✅ DELETE /api/carousel/delete
router.post("/delete", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: "URL de imagen requerida." });
  }

  const filename = decodeURIComponent(path.basename(url));
  const filePath = path.join(carouselFolder, filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("❌ Error al eliminar imagen:", err);
      return res.status(500).json({ message: "❌ Error al eliminar la imagen." });
    }
    console.log(`✅ Imagen eliminada: ${filename}`);
    res.json({ message: "✅ Imagen eliminada correctamente." });
  });
});

// ✅ Manejador de errores
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("❌ Error de Multer:", err);
    return res.status(400).json({ message: "Error al subir las imágenes.", error: err.message });
  } else if (err) {
    console.error("❌ Error general:", err);
    return res.status(400).json({ message: err.message });
  }
  next();
});

module.exports = router;
