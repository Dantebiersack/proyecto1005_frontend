// src/services/catalogosService.js
import api from "./api";

/** Clientes para selects */
export async function listClientes() {
  const { data } = await api.get(`/Clientes`);
  // Normaliza PascalCase -> camelCase básico
  return (data || []).map(x => ({
    idCliente: x.idCliente ?? x.IdCliente ?? x.id,
    nombre: x.nombre ?? x.Nombre ?? x.nombreCompleto ?? x.NombreCompleto ?? `Cliente #${x.IdCliente || x.id}`,
  }));
}

/** Personal / Técnicos para selects */
export async function listTecnicos() {
  // Ajusta el endpoint si tu API usa /Personal o /Tecnicos
  const { data } = await api.get(`/Personal`);
  return (data || []).map(x => ({
    idTecnico: x.idTecnico ?? x.IdTecnico ?? x.idPersonal ?? x.IdPersonal ?? x.id,
    nombre: x.nombre ?? x.Nombre ?? x.nombreCompleto ?? x.NombreCompleto ?? `Técnico #${x.IdTecnico || x.IdPersonal || x.id}`,
  }));
}

/** Servicios para selects */
export async function listServicios() {
  const { data } = await api.get(`/Servicios`);
  return (data || []).map(x => ({
    idServicio: x.idServicio ?? x.IdServicio ?? x.id,
    nombre: x.nombre ?? x.Nombre ?? `Servicio #${x.IdServicio || x.id}`,
    duracionMin: x.duracionMin ?? x.DuracionMin ?? x.duracion ?? x.Duracion ?? null, // si tu API la expone
  }));
}

/** (Opcional) Negocios para filtro super admin */
export async function listNegocios() {
  try {
    const { data } = await api.get(`/Negocios`);
    return (data || []).map(x => ({
      id: x.idNegocio ?? x.IdNegocio ?? x.id,
      nombre: x.nombre ?? x.Nombre ?? `Negocio #${x.IdNegocio || x.id}`,
    }));
  } catch {
    return [];
  }
}
