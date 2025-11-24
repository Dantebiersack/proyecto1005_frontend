// src/services/serviciosService.js
import api from "./api";

/**
 * Lista servicios.
 * params: { includeInactive?: boolean, idNegocio?: number }
 * - includeInactive: si es true, trae activos + inactivos (backend usa ?includeInactive=true)
 * - idNegocio: solo para superadmin; para admin de negocio se resuelve por JWT
 */
export async function listServicios(params = {}) {
  const { includeInactive, idNegocio } = params;

  const { data } = await api.get("/servicios", {
    params: {
      includeInactive,
      idNegocio,
    },
  });
  return data;
}

/** Obtiene un servicio por ID */
export async function getServicio(id) {
  const { data } = await api.get(`/servicios/${id}`);
  return data;
}

/** Crea un servicio */
export async function createServicio(payload) {
  // payload: { idNegocio, nombreServicio, descripcion, precio, duracionMinutos }
  return api.post("/servicios", payload);
}

/** Actualiza un servicio */
export async function updateServicio(id, payload) {
  // payload: { nombreServicio, descripcion, precio, duracionMinutos }
  return api.put(`/servicios/${id}`, payload);
}

/** Baja lógica (estado = FALSE) */
export async function deleteServicio(id) {
  return api.delete(`/servicios/${id}`);
}

/** Reactiva servicio (estado = TRUE) */
export async function restoreServicio(id) {
  return api.patch(`/servicios/${id}/restore`);
}
