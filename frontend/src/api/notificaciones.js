import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// 🔹 Enviar recordatorio
export const sendReminder = async (userId) => {
  const response = await axios.post(
    `${API_URL}/api/usuarios/${userId}/enviar-recordatorio`
  );
  return response.data;
};
