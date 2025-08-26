import api from "./axios";

// 🔹 Agregar esquema de vacunación (una sola dosis/esquema por petición)
export const addEsquemaVacunacion = async (esquemaData) => {
  // esquemaData: { vacuna_id, edad_recomendada, grupo_riesgo, tipo_dosis }
  const response = await api.post("/esquema", esquemaData);
  return response.data;
};

// 🔹 Obtener todos los esquemas
export const fetchEsquemasVacunacion = async () => {
  const response = await api.get("/esquema");
  return response.data;
};

// 🔹 Obtener esquemas de una vacuna específica
export const fetchEsquemaByVacuna = async (vacuna_id) => {
  const response = await api.get(`/esquema?vacuna_id=${vacuna_id}`);
  return response.data;
};

// 🔹 Actualizar esquema de vacunación (opcional)
export const updateEsquemaVacunacion = async (id, data) => {
  const response = await api.put(`/esquema/${id}`, data);
  return response.data;
};

// 🔹 Eliminar un esquema de vacunación (opcional)
export const deleteEsquemaVacunacion = async (id) => {
  const response = await api.delete(`/esquema/${id}`);
  return response.data;
};
