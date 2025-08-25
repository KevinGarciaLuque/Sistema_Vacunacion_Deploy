import api from "./axios";

// ✅ Obtener contenido de Sobre Nosotros
export const getSobreNosotros = async () => {
  const { data } = await api.get("/sobre-nosotros");
  return data; // Retorna el contenido actual
};

// ✅ Actualizar contenido general
export const updateSobreNosotros = async (contenido) => {
  const { data } = await api.put("/sobre-nosotros", { contenido });
  return data; // Retorna confirmación del backend
};

// ✅ Agregar nueva sección
export const addSeccion = async (nuevaSeccion) => {
  const { data } = await api.post("/sobre-nosotros/secciones", nuevaSeccion);
  return data; // Retorna la sección agregada
};

// ✅ Actualizar sección existente
export const updateSeccion = async (index, datosActualizados) => {
  const { data } = await api.put(
    `/sobre-nosotros/secciones/${index}`,
    datosActualizados
  );
  return data; // Retorna confirmación de actualización
};

// ✅ Eliminar sección
export const deleteSeccion = async (index) => {
  const { data } = await api.delete(`/sobre-nosotros/secciones/${index}`);
  return data; // Retorna confirmación de eliminación
};

// ✅ Subir imagen a Sobre Nosotros de forma segura
export const uploadImagen = async (file) => {
  if (!file) {
    console.error("❌ No se seleccionó ningún archivo");
    throw new Error("Archivo no válido");
  }

  const formData = new FormData();
  formData.append("file", file); // ✅ nombre correcto

  console.log("📤 Enviando archivo:", file);

  const { data } = await api.post("/upload-sobre-nosotros", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.url;
};
