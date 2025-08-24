import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ✅ Registrar en historial vacunación
export const addHistorialVacunacion = async (data) => {
  const res = await axios.post(`${API_URL}/api/historial`, data);
  return res.data;
};

// ✅ Obtener historial por usuario (por DNI)
export const fetchHistorialVacunacion = async (dni) => {
  const res = await axios.get(`${API_URL}/api/historial/${dni}`);
  return res.data.historial;
};

// ✅ Obtener historial por usuario_id
export const getHistorialPorUsuario = async (usuario_id) => {
  const res = await axios.get(`${API_URL}/api/historial/usuario/${usuario_id}`);
  return res.data;
};

// ✅ Actualizar vacuna aplicada
export const updateHistorialVacunacion = async (id, data) => {
  const res = await axios.put(`${API_URL}/api/historial/${id}`, data);
  return res.data;
};

// ✅ Eliminar vacuna aplicada
export const deleteHistorialVacunacion = async (id) => {
  const res = await axios.delete(`${API_URL}/api/historial/${id}`);
  return res.data;
};
