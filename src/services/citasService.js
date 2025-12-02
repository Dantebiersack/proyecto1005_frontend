// src/services/citasService.js
import api from "./api";

/**
 * Lista todas las citas (servidor actual devuelve todo; filtramos en front).
 * Si agregas el endpoint /Citas/admin (ver backend abajo), puedes
 * pasar query params para filtrar en el servidor.
 */
export async function listCitas(params = {}) {
  const { data } = await api.get(`/Citas`);
  return data;
}

export async function listCitasByRole() {
  const { data } = await api.get("/Citas/by-role");
  return data;
}

/** Crea una cita (para pruebas de endpoints desde la web) */
export async function createCita(payload) {
  // payload: { idCliente, idTecnico, idServicio, fechaCita (YYYY-MM-DD), horaInicio (HH:mm), horaFin (HH:mm) }
  return api.post(`/Citas`, payload);
}

/** Actualiza una cita (incluye estado) */
export async function updateCita(id, payload) {
  return api.put(`/Citas/${id}`, payload);
}

/** Cancela una cita con motivo */
export async function cancelCita(id, motivoCancelacion) {
  return api.patch(`/Citas/${id}/cancel`, { motivoCancelacion });
}

/** Marca cita como atendida (endpoint opcional; si no lo agregas, usa updateCita con estado="atendida") */
export async function approveCita(id) {
  // Endpoint nuevo recomendado en backend: PATCH /Citas/{id}/approve
  return api.patch(`/Citas/${id}/approve`);
}

export async function updateCitaStatus(id, estatus, motivo) {
  return api.patch(`/Citas/${id}/estatus`, { estatus, motivo });
}
