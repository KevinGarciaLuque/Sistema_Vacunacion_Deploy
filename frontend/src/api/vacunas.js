import api from "./axios";

const API_URL = "/vacunas"; // ❌ ya no le pongas /api

// Obtener todas las vacunas
export const getVacunas = async () => {
  const { data } = await api.get(API_URL);
  return data;
};

// Registrar vacuna
export const addVacuna = async (data) => {
  const res = await api.post(API_URL, data);
  return res.data;
};

// Actualizar vacuna
export const updateVacuna = async (id, data) => {
  const res = await api.put(`${API_URL}/${id}`, data);
  return res.data;
};

// Eliminar vacuna
export const deleteVacuna = async (id) => {
  const res = await api.delete(`${API_URL}/${id}`);
  return res.data;
};

// Cambiar estado activa/inactiva
export const toggleVacunaEstado = async (id) => {
  const res = await api.patch(`${API_URL}/${id}/estado`);
  return res.data;
};

// Restar stock de vacuna al aplicar
export const restarStockVacuna = async (id) => {
  const res = await api.patch(`${API_URL}/${id}/restar-stock`);
  return res.data;
};

// ✅ Obtener cantidad de dosis aplicadas HOY
export const getAplicadasHoyPorVacuna = async (id) => {
  const { data } = await api.get(`${API_URL}/${id}/aplicadas-hoy`);
  return data.total_aplicadas || 0;
};
