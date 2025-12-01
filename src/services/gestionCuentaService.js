import api from "./api";

export const actualizarPerfil = async (id, nombre, password) => {
  return await api.put("/Usuarios/actualizar-perfil", {
    id: id,
    nombre: nombre || undefined,
    nuevaContrasena: password || undefined
  });
};
