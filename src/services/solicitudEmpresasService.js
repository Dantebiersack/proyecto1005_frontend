// src/services/solicitudEmpresasService.js
import api from "./api";

// Obtener empresas con estado = pendiente
export const getSolicitudesEmpresas = async () => {
  try {
    const response = await api.get("/Negocios?includeInactive=true");
    // Solo solicitudes pendientes (estado = false)
    return response.data.filter(n => n.Estado === false);
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    throw error;
  }
};

// APROBAR solicitud (usa PATCH /approve)
export const aprobarSolicitud = async (id) => {
  try {
    const response = await api.patch(`/Negocios/${id}/approve`);
    return response.data;
  } catch (error) {
    console.error("Error al aprobar solicitud:", error);
    throw error;
  }
};

// RECHAZAR solicitud (usa PATCH /reject)
export const rechazarSolicitud = async (id, motivo) => {
  try {
    const response = await api.patch(`/Negocios/${id}/reject`, { motivo });
    return response.data;
  } catch (error) {
    console.error("Error al rechazar solicitud:", error);
    throw error;
  }
};
