import api from "./api";

export const getMisValoraciones = async () => {
  try {
    const res = await api.get("/Valoraciones/MisValoraciones");
    return res.data;
  } catch (error) {
    console.error("Error al obtener mis valoraciones:", error);
    throw error;
  }
};

export const responderValoracion = async (id, respuesta) => {
  try {
    const res = await api.post(`/Valoraciones/${id}/respuesta`, { respuesta });
    return res.data;
  } catch (error) {
    console.error("Error al responder valoración:", error);
    throw error;
  }
};
