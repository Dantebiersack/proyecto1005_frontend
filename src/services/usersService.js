import api from "./api";

// GET lista
export async function getUsuarios(includeInactive = false) {
  const resp = await api.get("/usuarios", {
    params: { includeInactive },
  });
  return resp.data;
}

// POST crear
export async function createUsuario(dto) {
  const resp = await api.post("/usuarios", dto);
  return resp.data;
}

// PUT actualizar
export async function updateUsuario(id, dto) {
  await api.put(`/usuarios/${id}`, dto);
}

// DELETE (soft)
export async function deleteUsuario(id) {
  await api.delete(`/usuarios/${id}`);
}

// PATCH restore
export async function restoreUsuario(id) {
  await api.patch(`/usuarios/${id}/restore`);
}
