import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// 🔹 Obtener registros de bitácora con filtros y paginación
export const fetchBitacora = async (params = {}) => {
  try {
    // Configuración de la petición
    const config = {
      baseURL: API_URL,
      url: '/api/bitacora',
      method: 'get',
      params: {
        pagina: params.pagina || 1,
        porPagina: params.porPagina || 10,
        ...(params.fechaDesde && { fechaDesde: params.fechaDesde }),
        ...(params.fechaHasta && { fechaHasta: params.fechaHasta }),
        ...(params.usuario && { usuario: params.usuario }),
        ...(params.accion && { accion: params.accion }),
      },
      timeout: 10000,
      validateStatus: (status) => status >= 200 && status < 500,
    };

    const response = await axios(config);

    // Manejar diferentes códigos de estado
    if (response.status === 500) {
      throw new Error(response.data?.error || "Error interno del servidor");
    }

    if (response.status === 400) {
      throw new Error(response.data?.error || "Parámetros inválidos");
    }

    if (!response.data?.success) {
      throw new Error(response.data?.error || "Respuesta inesperada del servidor");
    }

    return {
      success: true,
      registros: response.data.registros || [],
      paginacion: response.data.paginacion || {
        total: 0,
        pagina: 1,
        porPagina: 10,
        totalPaginas: 0,
      },
    };

  } catch (error) {
    console.error("Error en fetchBitacora:", error);
    
    const errorMessage = error.response?.data?.error || 
                        error.message || 
                        "Error al obtener la bitácora";
    
    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 5000,
    });

    // Retornar estructura consistente incluso en errores
    return {
      success: false,
      error: errorMessage,
      registros: [],
      paginacion: {
        total: 0,
        pagina: 1,
        porPagina: 10,
        totalPaginas: 0,
      },
    };
  }
};