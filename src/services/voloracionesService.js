// src/services/valoracionesService.js
import api from "./api";

// Obtener valoraciones por negocio
export const getValoraciones = async (idNegocio) => {
  try {
    const response = await api.get(`/Valoraciones/Negocio/${idNegocio}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener valoraciones:", error);
    throw error;
  }
};

// Enviar una respuesta a una valoración
export const responderValoracion = async (id, respuesta) => {
  try {
    const response = await api.post(`/Valoraciones/${id}/respuesta`, { respuesta });
    return response.data;
  } catch (error) {
    console.error("Error al responder valoración:", error);
    throw error;
  }
};


