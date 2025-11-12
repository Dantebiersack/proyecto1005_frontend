// src/services/membershipsService.js
import api from "./api";

/** Lista admin (activos/inactivos) */
export async function getMembresiasAdmin({ includeInactive = true } = {}) {
  const { data } = await api.get(
    `/Membresias/admin?includeInactive=${includeInactive}`
  );
  return data; // devuelve PascalCase según el backend
}

/** Actualiza una membresía (precio, negocio, etc.) */
export async function updateMembresia(id, body) {
  // body debe ir en PascalCase si mandas esos campos: { PrecioMensual, IdNegocio, UltimaRenovacion? }
  await api.put(`/Membresias/${id}`, body);
}

/** Renueva (actualiza UltimaRenovacion a ahora por defecto) */
export async function renewMembresia(id, fechaISO = null) {
  // En el backend es POST /:id/renew, no PATCH
  const payload = fechaISO ? { Fecha: fechaISO } : {};
  await api.post(`/Membresias/${id}/renew`, payload);
}

/** Baja lógica (estado=false) */
export async function softDeleteMembresia(id) {
  await api.delete(`/Membresias/${id}`);
}

/** (Opcional) Restaurar (estado=true) */
export async function restoreMembresia(id) {
  await api.post(`/Membresias/${id}/restore`);
}

/** Crear membresía para un negocio (si no tiene) */
export async function createMembershipForBusiness(idNegocio, precioMensual, ultimaRenovacionISO = null) {
  // En el backend es POST / (no /create-for-business/:id)
  const { data } = await api.post(`/Membresias`, {
    IdNegocio: idNegocio,
    PrecioMensual: precioMensual,
    UltimaRenovacion: ultimaRenovacionISO, // opcional (o null)
  });
  return data; // PascalCase
}
