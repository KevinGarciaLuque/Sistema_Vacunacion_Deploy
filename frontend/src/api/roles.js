import api from "./axios";

// ✅ Obtener todos los roles
export const getRoles = async () => {
  const response = await api.get("/roles");
  return Array.isArray(response.data) ? response.data : [];
};

// ✅ Obtener todos los usuarios con sus roles
export const getUsuariosConRoles = async () => {
  const response = await api.get("/roles/usuarios-con-roles");
  return Array.isArray(response.data) ? response.data : [];
};

// ✅ Obtener los roles asignados a un usuario por ID
export const getUsuarioRoles = async (usuarioId) => {
  const response = await api.get(`/roles/usuario/${usuarioId}`);
  return Array.isArray(response.data) ? response.data : [];
};

// ✅ Actualizar los roles de un usuario
export const updateUsuarioRoles = async (usuarioId, roles) => {
  if (!Array.isArray(roles)) {
    throw new Error("❌ Los roles deben enviarse como un array de IDs");
  }
  const response = await api.put(`/usuarios/${usuarioId}/roles`, { roles });
  return response.data || {};
};

// ✅ Crear nuevo rol
export const createRole = async (data) => {
  if (!data?.nombre) {
    throw new Error("❌ El nombre del rol es obligatorio");
  }
  const response = await api.post("/roles", data);
  return response.data;
};

// ✅ Actualizar un rol
export const updateRole = async (id, data) => {
  const response = await api.put(`/roles/${id}`, data);
  return response.data;
};

// ✅ Eliminar un rol
export const deleteRole = async (id) => {
  const response = await api.delete(`/roles/${id}`);
  return response.data;
};

// ✅ Cambiar estado (activar/desactivar) un rol
export const toggleRoleStatus = async (id, activo) => {
  const response = await api.patch(`/roles/${id}/estado`, {
    activo: activo ? 1 : 0,
  });
  return response.data;
};
