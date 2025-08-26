import api from "./axios";

// 🔹 Agregar nuevo usuario
export const addUser = async (userData) => {
  if (!userData || Object.keys(userData).length === 0) {
    throw new Error("❌ Los datos del usuario son obligatorios");
  }
  const response = await api.post("/usuarios", userData);
  return response.data;
};

// ✅ Obtener usuario por DNI
export const getUsuarioByDNI = async (dni) => {
  const response = await api.get(`/usuarios/dni/${dni}`);
  return response.data;
};

// 🔹 Obtener usuario por DNI (alias, usado en historial completo)
export const fetchUsuarioPorDni = async (dni) => {
  const response = await api.get(`/usuarios/dni/${dni}`);
  return response.data;
};

// ✅ Obtener usuario por ID
export const getUsuarioPorId = async (id) => {
  const response = await api.get(`/usuarios/${id}`);
  return response.data;
};

// 🔹 Editar usuario
export const updateUser = async (id, userData) => {
  try {
    console.log("🔄 Enviando actualización para usuario ID:", id);

    const response = await api.put(`/usuarios/${id}`, userData, {
      headers: { "Content-Type": "application/json" },
      validateStatus: (status) => status < 500, // Acepta respuestas 4xx como válidas
    });

    if (!response.data.success) {
      const error = new Error(
        response.data.error || "Error al actualizar usuario"
      );
      error.code = response.data.code;
      throw error;
    }

    return response.data.data; // Devuelve los datos del usuario actualizado
  } catch (error) {
    console.error("❌ Error en updateUser:", {
      code: error.code,
      message: error.message,
      response: error.response?.data,
    });

    const errorMessages = {
      MISSING_FIELDS:
        "Faltan campos obligatorios: " + (error.response?.data.error || ""),
      DUPLICATE_ENTRY: "El DNI o correo electrónico ya está registrado",
      USER_NOT_FOUND: "Usuario no encontrado",
      INTERNAL_ERROR:
        "Error interno del servidor. Por favor, intente más tarde.",
    };

    throw new Error(
      errorMessages[error.code] || "Error al actualizar el usuario"
    );
  }
};

// 🔹 Eliminar usuario
export const deleteUser = async (id) => {
  const response = await api.delete(`/usuarios/${id}`);
  return response.data;
};

// 🔹 Obtener todos los usuarios activos
export const getUsuarios = async () => {
  const response = await api.get("/usuarios");
  return Array.isArray(response.data) ? response.data : [];
};

// 🔹 Obtener todos los usuarios con sus roles
export const getUsuariosConRoles = async () => {
  const response = await api.get("/roles/usuarios-con-roles");
  return Array.isArray(response.data) ? response.data : [];
};

// 🔹 Obtener roles de un usuario
export const getUsuarioRoles = async (usuarioId) => {
  const response = await api.get(`/roles/usuario/${usuarioId}`);
  return Array.isArray(response.data) ? response.data : [];
};

// 🔹 Activar / Desactivar usuario
export const toggleUserActive = async (id, activo) => {
  const response = await api.patch(`/usuarios/${id}/estado`, {
    activo: activo ? 1 : 0,
  });
  return response.data;
};

// 🔹 Programar próxima dosis (si se utiliza)
export const scheduleNextDose = async (userId, proximaDosis) => {
  const response = await api.post(`/usuarios/${userId}/programar-dosis`, {
    proxima_dosis: proximaDosis,
  });
  return response.data;
};
