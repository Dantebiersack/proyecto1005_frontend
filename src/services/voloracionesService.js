// src/services/valoracionesService.js
import api from "./api";

// Obtener todas las valoraciones
export const getValoraciones = async () => {
  try {
    const response = await api.get("/Valoraciones");
    return response.data;
  } catch (error) {
    console.error("Error al obtener valoraciones:", error);
    throw error;
  }
};

// Enviar una respuesta a una valoración (opcional si tu backend lo admite)
export const responderValoracion = async (id, respuesta) => {
  try {
    const response = await api.post(`/Valoraciones/${id}/respuesta`, { respuesta });
    return response.data;
  } catch (error) {
    console.error("Error al responder valoración:", error);
    throw error;
  }
};
