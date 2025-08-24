import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Obtener todos los roles
export const getRoles = async () => {
  const response = await axios.get(`${API_URL}/api/roles`);
  return response.data;
};

// Obtener todos los usuarios con sus roles
export const getUsuariosConRoles = async () => {
  const response = await axios.get(`${API_URL}/api/roles/usuarios-con-roles`);
  return response.data;
};

// Obtener los roles asignados a un usuario por ID
export const getUsuarioRoles = async (usuarioId) => {
  const response = await axios.get(`${API_URL}/api/roles/usuario/${usuarioId}`);
  return response.data;
};

// Actualizar los roles de un usuario
export const updateUsuarioRoles = async (usuarioId, roles) => {
  const response = await axios.put(
    `${API_URL}/api/usuarios/${usuarioId}/roles`,
    {
      roles,
    }
  );
  return response.data;
};

// Crear nuevo rol
export const createRole = async (data) => {
  const response = await axios.post(`${API_URL}/api/roles`, data);
  return response.data;
};

// Actualizar un rol
export const updateRole = async (id, data) => {
  const response = await axios.put(`${API_URL}/api/roles/${id}`, data);
  return response.data;
};

// Eliminar un rol
export const deleteRole = async (id) => {
  const response = await axios.delete(`${API_URL}/api/roles/${id}`);
  return response.data;
};


// Cambiar estado (activar/desactivar) un rol
export const toggleRoleStatus = async (id) => {
  const response = await axios.patch(`${API_URL}/api/roles/${id}/estado`);
  return response.data;
};
