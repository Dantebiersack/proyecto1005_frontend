// src/services/valoracionesService.js
import api from "./api";

// Obtener SOLO las valoraciones del negocio del usuario logueado
export const getMisValoraciones = async () => {
  try {
    const res = await api.get("/Valoraciones/MisValoraciones");
    return res.data;
  } catch (error) {
    console.error("Error al obtener mis valoraciones:", error);
    throw error;
  }
};

// Responder a una valoración (este NO se toca)
export const responderValoracion = async (id, respuesta) => {
  try {
    const res = await api.post(`/Valoraciones/${id}/respuesta`, { respuesta });
    return res.data;
  } catch (error) {
    console.error("Error al responder valoración:", error);
    throw error;
  }
};
