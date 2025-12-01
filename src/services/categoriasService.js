// src/services/categorias.service.js
import api from "./api";

/**
 * Obtiene todas las categorías activas (para vistas públicas).
 */
export const getActiveCategories = async () => {
  try {
    const response = await api.get("/Categorias");
    return response.data.filter(function (cat) {
      return cat.Estado === true;
    });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    throw new Error("No se pudieron cargar las categorías");
  }
};

/**
 * Listado admin, incluyendo opcionalmente inactivas.
 */
export const listCategorias = async (includeInactive) => {
  try {
    const response = await api.get("/Categorias", {
      params: {
        includeInactive: includeInactive ? "true" : "false",
      },
    });
    return response.data || [];
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    throw error;
  }
};

/**
 * Crear categoría.
 * dto: { NombreCategoria }
 */
export const createCategoria = async (dto) => {
  try {
    const response = await api.post("/Categorias", {
      NombreCategoria: dto.NombreCategoria,
    });
    return response.data;
  } catch (error) {
    console.error("Error al crear categoría:", error);
    throw error;
  }
};

/**
 * Actualizar categoría.
 * dto: { NombreCategoria }
 */
export const updateCategoria = async (idCategoria, dto) => {
  try {
    await api.put("/Categorias/" + idCategoria, {
      NombreCategoria: dto.NombreCategoria,
    });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    throw error;
  }
};

/**
 * Borrar (soft delete) -> estado = false
 */
export const deleteCategoria = async (idCategoria) => {
  try {
    await api.delete("/Categorias/" + idCategoria);
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    throw error;
  }
};

/**
 * Restaurar -> estado = true
 */
export const restoreCategoria = async (idCategoria) => {
  try {
    await api.patch("/Categorias/" + idCategoria + "/restore");
  } catch (error) {
    console.error("Error al restaurar categoría:", error);
    throw error;
  }
};
