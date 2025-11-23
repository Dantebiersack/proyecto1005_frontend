// src/services/miEmpresaService.js
import api from "./api";

// 🔹 Obtener datos del negocio del usuario autenticado
export const getMiNegocio = async () => {
  try {
    const response = await api.get("/Negocios/mine"); // Usa token automáticamente
    return response.data;
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

// 🔹 Actualizar negocio por ID
export const updateNegocio = async (id, negocioData) => {
  try {
    const response = await api.put(`/Negocios/${id}`, negocioData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar negocio:", error);
    throw error;
  }
};
