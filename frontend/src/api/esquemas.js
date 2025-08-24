import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// 🔹 Agregar esquema de vacunación (una sola dosis/esquema por petición)
export const addEsquemaVacunacion = async (esquemaData) => {
  // esquemaData: { vacuna_id, edad_recomendada, grupo_riesgo, tipo_dosis }
  const response = await axios.post(`${API_URL}/api/esquema`, esquemaData);
  return response.data;
};

// 🔹 Obtener todos los esquemas
export const fetchEsquemasVacunacion = async () => {
  const response = await axios.get(`${API_URL}/api/esquema`);
  return response.data;
};

// 🔹 Obtener esquemas de una vacuna específica (opcional)
export const fetchEsquemaByVacuna = async (vacuna_id) => {
  const response = await axios.get(
    `${API_URL}/api/esquema?vacuna_id=${vacuna_id}`
  );
  return response.data;
};

// 🔹 Actualizar esquema de vacunación (opcional, si lo necesitas en tu backend)
// export const updateEsquemaVacunacion = async (id, data) => {
//   const response = await axios.put(`${API_URL}/api/esquema/${id}`, data);
//   return response.data;
// };

// 🔹 Eliminar un esquema de vacunación (opcional, si lo necesitas en tu backend)
// export const deleteEsquemaVacunacion = async (id) => {
//   const response = await axios.delete(`${API_URL}/api/esquema/${id}`);
//   return response.data;
// };
