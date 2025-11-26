import React, { useEffect, useState } from "react";
import "./SolicitudEmpresas.css";
import {
  getSolicitudesEmpresas,
  aprobarSolicitud,
  rechazarSolicitud,
} from "../../../services/solicitudEmpresasService";

export default function SolicitudEmpresas() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal rechazo
  const [modalAbierto, setModalAbierto] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [idARechazar, setIdARechazar] = useState(null);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const data = await getSolicitudesEmpresas();
      setSolicitudes(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (id) => {
    if (!window.confirm("¿Seguro que deseas aprobar esta solicitud?")) return;
    try {
      await aprobarSolicitud(id);
      alert(" Solicitud aprobada y correo enviado.");
      cargarSolicitudes();
    } catch (err) {
      console.error(err);
      alert("Error al aprobar la solicitud.");
    }
  };

  const abrirModalRechazo = (id) => {
    setIdARechazar(id);
    setMotivoRechazo("");
    setModalAbierto(true);
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      alert("Escribe un motivo para rechazar la solicitud.");
      return;
    }
    try {
      await rechazarSolicitud(idARechazar, motivoRechazo);
      alert(" Solicitud rechazada y correo enviado.");
      setModalAbierto(false);
      cargarSolicitudes();
    } catch (err) {
      console.error(err);
      alert(" Error al rechazar la solicitud.");
    }
  };

  if (loading) return <p className="loading">Cargando solicitudes...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="solicitudes-container">
      <h2>Solicitudes de Registro de Empresas</h2>

      {solicitudes.length === 0 ? (
        <p className="no-solicitudes">No hay solicitudes pendientes.</p>
      ) : (
        <div className="solicitudes-grid">
          {solicitudes.map((s) => (
            <div key={s.IdNegocio} className="solicitud-card">
              <h3>{s.Nombre}</h3>
              <p><strong>Correo:</strong> {s.CorreoContacto}</p>
              <p><strong>Teléfono:</strong> {s.TelefonoContacto}</p>
              <p><strong>Dirección:</strong> {s.Direccion || "Sin especificar"}</p>
              <p><strong>Descripción:</strong> {s.Descripcion || "Sin descripción"}</p>

              <div className="acciones">
                <button
                  className="btn-aprobar"
                  onClick={() => handleAprobar(s.IdNegocio)}
                >
                  Aprobar
                </button>
                <button
                  className="btn-rechazar"
                  onClick={() => abrirModalRechazo(s.IdNegocio)}
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Motivo de rechazo</h3>
            <textarea
              placeholder="Escribe el motivo..."
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
            ></textarea>
            <div className="modal-buttons">
              <button
                className="btn-cancelar"
                onClick={() => setModalAbierto(false)}
              >
                Cancelar
              </button>
              <button className="btn-rechazar" onClick={handleRechazar}>
                Enviar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
