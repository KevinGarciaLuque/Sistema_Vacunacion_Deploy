import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ✅ Obtener todos los roles
export const getRoles = async () => {
  const response = await axios.get(`${API_URL}/roles`);
  return Array.isArray(response.data) ? response.data : [];
};

// ✅ Obtener todos los usuarios con sus roles
export const getUsuariosConRoles = async () => {
  const response = await axios.get(`${API_URL}/roles/usuarios-con-roles`);
  return Array.isArray(response.data) ? response.data : [];
};

// ✅ Obtener los roles asignados a un usuario por ID
export const getUsuarioRoles = async (usuarioId) => {
  const response = await axios.get(`${API_URL}/roles/usuario/${usuarioId}`);
  return Array.isArray(response.data) ? response.data : [];
};

// ✅ Actualizar los roles de un usuario
export const updateUsuarioRoles = async (usuarioId, roles) => {
  if (!Array.isArray(roles)) {
    throw new Error("❌ Los roles deben enviarse como un array de IDs");
  }
  const response = await axios.put(`${API_URL}/usuarios/${usuarioId}/roles`, {
    roles,
  });
  return response.data || {};
};

// ✅ Crear nuevo rol
export const createRole = async (data) => {
  if (!data?.nombre) {
    throw new Error("❌ El nombre del rol es obligatorio");
  }
  const response = await axios.post(`${API_URL}/roles`, data);
  return response.data;
};

// ✅ Actualizar un rol
export const updateRole = async (id, data) => {
  const response = await axios.put(`${API_URL}/roles/${id}`, data);
  return response.data;
};

// ✅ Eliminar un rol
export const deleteRole = async (id) => {
  const response = await axios.delete(`${API_URL}/roles/${id}`);
  return response.data;
};

// ✅ Cambiar estado (activar/desactivar) un rol
export const toggleRoleStatus = async (id) => {
  const response = await axios.patch(`${API_URL}/roles/${id}/estado`);
  return response.data;
};
