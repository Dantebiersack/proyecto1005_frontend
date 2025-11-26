import api from "./api";

// traer solicitudes pendientes (estado = FALSE)
export async function getSolicitudesEmpresas() {
  const response = await api.get("/Negocios/solicitudes");
  return response.data;
}

// aprobar solicitud
export async function aprobarSolicitud(idNegocio) {
  const response = await api.patch(`/Negocios/${idNegocio}/approve`);
  return response.data;
}

// rechazar solicitud
export async function rechazarSolicitud(idNegocio, motivo) {
  const response = await api.patch(`/Negocios/${idNegocio}/reject`, {
    motivoRechazo: motivo,
  });
  return response.data;
}
