// frontend/src/api/axios.js

import axios from "axios";

// ✅ Obtiene la URL del backend desde .env (Vite) o usa localhost:3000 como fallback
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ✅ Mensaje de confirmación al iniciar
//console.log(`✅ API_URL configurado en: ${API_URL}`);

// ✅ Instancia de Axios configurada
const api = axios.create({
  baseURL: API_URL,
  // Si agregas autenticación JWT en el futuro:
  // headers: { Authorization: `Bearer ${tuToken}` },
});

// ✅ Interceptor de solicitud para depuración
api.interceptors.request.use(
  (config) => {
   // console.log(
     // `📡 ${config.method?.toUpperCase()} -> ${config.baseURL}${config.url}`,
      //config.params || config.data || ""
    //);
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor de respuesta opcional (puedes activar si deseas ver respuestas)
api.interceptors.response.use(
  (response) => {
    // console.log("✅ Respuesta recibida:", response);
    return response;
  },
  (error) => {
    console.error("❌ Error en la solicitud:", error);
    return Promise.reject(error);
  }
);

export default api;
