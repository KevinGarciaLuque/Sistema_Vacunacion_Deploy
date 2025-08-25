// frontend/src/api/axios.js
import axios from "axios";

// ✅ Obtiene la URL del backend desde .env (Vite) o usa localhost como fallback
let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// 🔹 Evitamos que se duplique "/api"
if (!API_URL.endsWith("/api")) {
  API_URL = `${API_URL}/api`;
}

// ✅ Mensaje de confirmación al iniciar (descomenta para debug)
// console.log(`✅ API_URL configurado en: ${API_URL}`);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor de solicitudes (debug opcional)
api.interceptors.request.use(
  (config) => {
    // console.log(
    //   `📡 ${config.method?.toUpperCase()} -> ${config.baseURL}${config.url}`,
    //   config.params || config.data || ""
    // );
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor de respuestas (debug opcional)
api.interceptors.response.use(
  (response) => {
    // console.log("✅ Respuesta recibida:", response);
    return response;
  },
  (error) => {
    console.error("❌ Error en la solicitud:", {
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      response: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export default api;
