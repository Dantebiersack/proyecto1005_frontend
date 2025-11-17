import api from "./api";

// GET (Listar)
export async function getNegocios(includeInactive = false) {
  const response = await api.get("/Negocios", {
    params: { includeInactive },
  });
  return response.data;
}

// POST (Crear)
export async function createNegocio(negocioDto) {
  const response = await api.post("/Negocios", negocioDto);
  return response.data;
}

// PUT (Actualizar)
export async function updateNegocio(id, negocioDto) {
  const response = await api.put(`/Negocios/${id}`, negocioDto);
  return response.data;
}

// DELETE (Desactivar)
export async function deleteNegocio(id) {
  const response = await api.delete(`/Negocios/${id}`);
  return response.data;
}

// PATCH (Restaurar)
export async function restoreNegocio(id) {
  const response = await api.patch(`/Negocios/${id}/restore`);
  return response.data;
}