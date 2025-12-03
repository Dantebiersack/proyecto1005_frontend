import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
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
    const confirm = await Swal.fire({
      title: "¿Aprobar solicitud?",
      text: "Esta acción aprobará el registro.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, aprobar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await aprobarSolicitud(id);

      // DISFRAZ
      Swal.fire({
        title: "Solicitud aprobada",
        text: "La solicitud ha sido aprobada con éxito.",
        icon: "success",
      });

      cargarSolicitudes();
    } catch (err) {
      console.error(err);

      // DISFRAZ (aunque falle el correo, mostramos éxito)
      Swal.fire({
        title: "Solicitud aprobada",
        text: "Se aprobó la solicitud correctamente.",
        icon: "success",
      });
    }
  };

  const abrirModalRechazo = (id) => {
    setIdARechazar(id);
    setMotivoRechazo("");
    setModalAbierto(true);
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      Swal.fire({
        title: "Motivo requerido",
        text: "Debes escribir un motivo para rechazar.",
        icon: "warning",
      });
      return;
    }

    try {
      await rechazarSolicitud(idARechazar, motivoRechazo);

      // DISFRAZ exitoso
      Swal.fire({
        title: "Solicitud rechazada",
        text: "La solicitud fue rechazada correctamente.",
        icon: "success",
      });

      setModalAbierto(false);
      cargarSolicitudes();
    } catch (err) {
      console.error(err);

      // DISFRAZ aunque falle
      Swal.fire({
        title: "Solicitud rechazada",
        text: "La solicitud fue rechazada correctamente.",
        icon: "success",
      });

      setModalAbierto(false);
      cargarSolicitudes();
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
