// frontend/src/api/vacunas_aplicadas.js

import api from './axios';

// ✅ Ahora apunta correctamente al backend con /api/vacunas_aplicadas
export const getVacunasAplicadas = async ({ desde, hasta, usuario_id, page = 1, limit = 100 }) => {
  const response = await api.get('/vacunas_aplicadas', {
    params: { desde, hasta, usuario_id, page, limit },
  });
  return response.data;
};


