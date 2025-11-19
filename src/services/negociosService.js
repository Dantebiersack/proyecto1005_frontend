import api from "./api";

/**
 * Obtiene la lista de todos los negocios.
 * @param {boolean} includeInactive - Si true, trae también los negocios desactivados (estado=false).
 */
export async function getNegocios(includeInactive = false) {
  const response = await api.get("/Negocios", {
    params: { includeInactive },
  });
  return response.data;
}

/**
 * Crea un nuevo negocio.
 * @param {object} negocioDto - Objeto con los datos del negocio (se espera PascalCase en el backend).
 */
export async function createNegocio(negocioDto) {
  const response = await api.post("/Negocios", negocioDto);
  return response.data;
}

/**
 * Actualiza un negocio existente.
 * @param {number} id - ID del negocio.
 * @param {object} negocioDto - Datos a actualizar.
 */
export async function updateNegocio(id, negocioDto) {
  const response = await api.put(`/Negocios/${id}`, negocioDto);
  return response.data;
}

/**
 * Desactiva un negocio (baja lógica).
 * @param {number} id - ID del negocio.
 */
export async function deleteNegocio(id) {
  const response = await api.delete(`/Negocios/${id}`);
  return response.data;
}

/**
 * Reactiva un negocio previamente desactivado.
 * @param {number} id - ID del negocio.
 */
export async function restoreNegocio(id) {
  const response = await api.patch(`/Negocios/${id}/restore`);
  return response.data;
}