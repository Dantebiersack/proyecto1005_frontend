// src/services/miEmpresaService.js
import api from "./api";

// 🔹 Obtener datos del negocio del usuario autenticado
export const getMiNegocio = async () => {
  try {
    const response = await api.get("/Negocios/MiNegocio"); // 🔹 Ruta correcta
    return response.data || null; // 🔹 Devuelve null si no hay negocio
  } catch (error) {
    console.error("Error al obtener MI negocio:", error);
    throw error;
  }
};

// 🔹 Obtener todas las categorías
export const getCategorias = async () => {
  try {
    const response = await api.get("/Categorias");
    return response.data;
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    throw error;
  }
};

// 🔹 Actualizar negocio por ID o del usuario autenticado
export const updateNegocio = async (id, negocioData) => {
  try {
    // 🔹 Usar endpoint del propio usuario si id es "MiNegocio"
    if (id === "MiNegocio") {
      const response = await api.put("/Negocios/MiNegocio", negocioData);
      return response.data;
    }

    // 🔹 Actualizar negocio por ID normal
    const response = await api.put(`/Negocios/${id}`, negocioData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar negocio:", error);
    throw error;
  }
};
