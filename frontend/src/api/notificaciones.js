// frontend/src/api/notificaciones.js
import api from "./axios";

// 🔹 Enviar recordatorio
export const sendReminder = async (userId) => {
  const response = await api.post(`/usuarios/${userId}/enviar-recordatorio`);
  return response.data;
};
