// src/services/miEmpresaService.js
import api from "./api";

// 🔹 Obtener datos de un negocio por su ID
export const getNegocioById = async (id) => {
  try {
    const response = await api.get(`/Negocios/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el negocio:", error);
    throw error;
  }
};

// 🔹 Obtener todas las categorías
export const getCategorias = async () => {
  try {
    const response = await api.get("/Categorias");
    return response.data;
  } catch (error) {
    console.error("Error al obtener las categorías:", error);
    throw error;
  }
};

// 🔹 Actualizar datos del negocio
export const updateNegocio = async (id, negocioData) => {
  try {
    const response = await api.put(`/Negocios/${id}`, negocioData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el negocio:", error);
    throw error;
  }
};
