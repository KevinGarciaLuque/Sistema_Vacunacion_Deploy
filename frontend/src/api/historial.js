import api from "./axios";

// ✅ Registrar en historial vacunación
export const addHistorialVacunacion = async (data) => {
  const res = await api.post("/historial", data);
  return res.data;
};

// ✅ Obtener historial por usuario (por DNI)
export const fetchHistorialVacunacion = async (dni) => {
  const res = await api.get(`/historial/${dni}`);
  return res.data.historial;
};

// ✅ Obtener historial por usuario_id
export const getHistorialPorUsuario = async (usuario_id) => {
  const res = await api.get(`/historial/usuario/${usuario_id}`);
  return res.data;
};

// ✅ Actualizar vacuna aplicada
export const updateHistorialVacunacion = async (id, data) => {
  const res = await api.put(`/historial/${id}`, data);
  return res.data;
};

// ✅ Eliminar vacuna aplicada
export const deleteHistorialVacunacion = async (id) => {
  const res = await api.delete(`/historial/${id}`);
  return res.data;
};
