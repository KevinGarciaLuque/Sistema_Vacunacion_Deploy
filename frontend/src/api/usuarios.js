import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// 🔹 Agregar nuevo usuario
export const addUser = async (userData) => {
  if (!userData || Object.keys(userData).length === 0) {
    throw new Error("❌ Los datos del usuario son obligatorios");
  }
  const response = await axios.post(`${API_URL}/api/usuarios`, userData);
  return response.data;
};

// ✅ Este debe estar presente
export const getUsuarioByDNI = async (dni) => {
  const response = await axios.get(`${API_URL}/api/usuarios/${dni}`);
  return response.data;
};


// 🔹 Obtener usuario por DNI (usado para historial completo)
export const fetchUsuarioPorDni = async (dni) => {
  const response = await axios.get(`${API_URL}/api/usuarios/${dni}`);
  return response.data;
};

// ✅ Obtener usuario por ID
export const getUsuarioPorId = async (id) => {
  const response = await axios.get(`${API_URL}/api/usuarios/${id}`);
  return response.data;
};


// 🔹 Editar usuario por DNI
// En el archivo de API (api/usuarios.js)
export const updateUser = async (id, userData) => {
  try {
    console.log("🔄 Enviando actualización para usuario ID:", id);
    
    const response = await axios.put(`${API_URL}/api/usuarios/${id}`, userData, {
      headers: {
        'Content-Type': 'application/json'
      },
      validateStatus: (status) => status < 500 // Aceptar respuestas 4xx como no errores
    });

    if (!response.data.success) {
      // Manejar errores controlados del backend
      const error = new Error(response.data.error || "Error al actualizar usuario");
      error.code = response.data.code;
      throw error;
    }

    return response.data.data; // Devuelve los datos del usuario actualizado

  } catch (error) {
    console.error("❌ Error en updateUser:", {
      code: error.code,
      message: error.message,
      response: error.response?.data
    });

    // Mensajes amigables según el código de error
    const errorMessages = {
      'MISSING_FIELDS': 'Faltan campos obligatorios: ' + (error.response?.data.error || ''),
      'DUPLICATE_ENTRY': 'El DNI o correo electrónico ya está registrado',
      'USER_NOT_FOUND': 'Usuario no encontrado',
      'INTERNAL_ERROR': 'Error interno del servidor. Por favor, intente más tarde.'
    };

    throw new Error(errorMessages[error.code] || 'Error al actualizar el usuario');
  }
};
// 🔹 Eliminar usuario por ID
export const deleteUser = async (id) => {
  const response = await axios.delete(`${API_URL}/api/usuarios/${id}`);
  return response.data;
};

// 🔹 Obtener todos los usuarios activos
export const getUsuarios = async () => {
  const response = await axios.get(`${API_URL}/api/usuarios`);
  return response.data;
};

// 🔹 Obtener todos los usuarios con sus roles (para tablas)
export const getUsuariosConRoles = async () => {
  const response = await axios.get(`${API_URL}/api/roles/usuarios-con-roles`);
  return response.data;
};

// 🔹 Obtener roles de un usuario por ID
export const getUsuarioRoles = async (usuarioId) => {
  const response = await axios.get(`${API_URL}/api/roles/usuario/${usuarioId}`);
  return response.data;
};

// 🔹 Activar / Desactivar usuario
export const toggleUserActive = async (id, activo) => {
  const response = await axios.patch(`${API_URL}/api/usuarios/${id}/estado`, { activo: activo ? 1 : 0 });
  return response.data;
};


// 🔹 Programar próxima dosis (si se utiliza)
export const scheduleNextDose = async (userId, proximaDosis) => {
  const response = await axios.post(`${API_URL}/api/usuarios/${userId}/programar-dosis`, {
    proxima_dosis: proximaDosis,
  });
  return response.data;
};



