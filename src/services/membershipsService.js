// src/services/membershipsService.js
import api from "./api";

/**
 * Obtiene todas las membresías (incluso inactivas si se pide).
 */
export async function getMembresiasAdmin({ includeInactive = true } = {}) {
  const { data } = await api.get(`/Membresias/admin?includeInactive=${includeInactive}`);
  return data;
}

/**
 * Actualiza el precio u otros datos de una membresía.
 */
export async function updateMembresia(id, body) {
  await api.put(`/Membresias/${id}`, body);
}

/**
 * Renueva la membresía, actualizando la fecha de última renovación.
 */
export async function renewMembresia(id) {
  await api.patch(`/Membresias/${id}/renew`);
}

/**
 * Da de baja (soft delete) una membresía.
 */
export async function softDeleteMembresia(id) {
  await api.delete(`/Membresias/${id}`);
}

/**
 * Crea una membresía nueva para un negocio que no tenga una.
 */
export async function createMembershipForBusiness(idNegocio, precioMensual) {
  const { data } = await api.post(`/Membresias/create-for-business/${idNegocio}`, {
    precioMensual,
  });
  return data;
}
