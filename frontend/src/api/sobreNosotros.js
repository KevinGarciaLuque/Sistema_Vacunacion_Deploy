import api from "./axios";

// ✅ Obtener contenido de Sobre Nosotros
export const getSobreNosotros = async () => {
  const { data } = await api.get("/sobre-nosotros");
  return data;
};

// ✅ Actualizar contenido general
export const updateSobreNosotros = async (contenido) => {
  const { data } = await api.put("/sobre-nosotros", { contenido });
  return data;
};

// ✅ Agregar nueva sección
export const addSeccion = async (nuevaSeccion) => {
  const { data } = await api.post("/sobre-nosotros/secciones", nuevaSeccion);
  return data;
};

// ✅ Actualizar sección existente
export const updateSeccion = async (index, datosActualizados) => {
  if (index === null || index === undefined) {
    throw new Error("❌ El índice de la sección es obligatorio");
  }
  const { data } = await api.put(
    `/sobre-nosotros/secciones/${index}`,
    datosActualizados
  );
  return data;
};

// ✅ Eliminar sección
export const deleteSeccion = async (index) => {
  if (index === null || index === undefined) {
    throw new Error("❌ El índice de la sección es obligatorio");
  }
  const { data } = await api.delete(`/sobre-nosotros/secciones/${index}`);
  return data;
};

// ✅ Subir imagen a Sobre Nosotros
export const uploadImagen = async (file) => {
  if (!file) {
    console.error("❌ No se seleccionó ningún archivo");
    throw new Error("Archivo no válido");
  }

  const formData = new FormData();
  formData.append("file", file); // ⚠️ Ajusta a "imagen" si tu backend lo espera así

  const { data } = await api.post("/upload-sobre-nosotros", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.url;
};
