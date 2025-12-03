// src/components/pages/personalNearbiz/GestionCitas.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import {
  listCitas,
  listCitasByRole,
  updateCitaStatus,
} from "../../../services/citasService";
import {
  listClientes,
  listTecnicos,
  listServicios,
  listNegocios,
} from "../../../services/catalogosService";
import "../personalNearbiz/GestionUsuarios.css";

const SLOT_MINUTES = 15;
const PLAN_DAYS = 30; 

function parseTimeOnly(tstr) {
  const [h, m] = (tstr || "00:00").split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}
function safeDateFrom(val) {
  if (!val) return null;

  // Ya viene como Date
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }

  // String tipo "2025-11-19" o "2025-11-19T00:00:00.000Z"
  if (typeof val === "string") {
    var s = val.trim();
    if (!s) return null;

    // Si solo trae la parte de fecha, le agregamos hora
    if (s.length <= 10) {
      s = s + "T00:00:00";
    }

    var d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}
function toHHmm(date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
function addMinutes(date, mins) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + mins);
  return d;
}
function weekdayName(dateVal) {
  var d = safeDateFrom(dateVal);
  if (!d) return "";
  var opts = { weekday: "long" };
  return new Intl.DateTimeFormat("es-MX", opts).format(d);
}

function toLocalDate(dateVal) {
  var d = safeDateFrom(dateVal);
  if (!d) return "";
  return d.toLocaleDateString("es-MX");
}

export default function CitasNegocio({
  isSuperAdmin = false,
  tecnicoActualId = null,
  useRoleEndpoint = false,
}) {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [fEstado, setFEstado] = useState("todos");
  const [fDia, setFDia] = useState("todos");
  const [fNegocio, setFNegocio] = useState("todos");

  // catálogos para selects del modal / filtro
  const [clientes, setClientes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [negocios, setNegocios] = useState([]);

  const fetchedRef = useRef(false);

  const swalToast = (icon, title) =>
    Swal.fire({
      icon,
      title,
      timer: 1600,
      showConfirmButton: false,
      position: "top-end",
    });

  async function refresh() {
    setLoading(true);
    try {
      var data;
      if (useRoleEndpoint) {
        data = await listCitasByRole();
      } else {
        data = await listCitas();
      }
      const mapped = (data || []).map((x) => ({
        idCita: x.idCita ?? x.IdCita,
        idCliente: x.idCliente ?? x.IdCliente,
        idTecnico: x.idTecnico ?? x.IdTecnico,
        idServicio: x.idServicio ?? x.IdServicio,
        fechaCita: x.fechaCita ?? x.FechaCita,
        horaInicio: (x.horaInicio ?? x.HoraInicio ?? "").slice(0, 5),
        horaFin: (x.horaFin ?? x.HoraFin ?? "").slice(0, 5),
        estado: (x.estado ?? x.Estado)?.toLowerCase(),
        motivoCancelacion: x.motivoCancelacion ?? x.MotivoCancelacion,
        negocioNombre: x.negocioNombre ?? x.NegocioNombre ?? null,
        clienteNombre: x.clienteNombre ?? x.ClienteNombre ?? null,
        tecnicoNombre: x.tecnicoNombre ?? x.TecnicoNombre ?? null,
        servicioNombre: x.servicioNombre ?? x.ServicioNombre ?? null,
        negocioId: x.negocioId ?? x.NegocioId ?? null,
      }));
      setRaw(mapped);
    } finally {
      setLoading(false);
    }
  }

  async function loadCatalogos() {
    // levanta catálogos en paralelo
    const [cli, tec, srv, neg] = await Promise.all([
      listClientes().catch(() => []),
      listTecnicos().catch(() => []),
      listServicios().catch(() => []),
      isSuperAdmin ? listNegocios().catch(() => []) : Promise.resolve([]),
    ]);
    setClientes(cli);
    setTecnicos(tec);
    setServicios(srv);
    setNegocios(neg);
  }

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    // carga inicial
    (async () => {
      setLoading(true);
      try {
        await Promise.all([refresh(), loadCatalogos()]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let out = raw;

    if (!isSuperAdmin && tecnicoActualId) {
      out = out.filter((r) => r.idTecnico === Number(tecnicoActualId));
    }

    if (fEstado !== "todos") out = out.filter((r) => r.estado === fEstado);
    if (fDia !== "todos")
      out = out.filter((r) => weekdayName(r.fechaCita).toLowerCase() === fDia);
    if (isSuperAdmin && fNegocio !== "todos")
      out = out.filter((r) => String(r.negocioId) === String(fNegocio));

    // orden por fecha/hora
    out = [...out].sort((a, b) => {
      const d1 = new Date(`${a.fechaCita}T${a.horaInicio || "00:00"}:00`);
      const d2 = new Date(`${b.fechaCita}T${b.horaInicio || "00:00"}:00`);
      return d1.getTime() - d2.getTime();
    });

    return out;
  }, [raw, fEstado, fDia, fNegocio, isSuperAdmin, tecnicoActualId]);

  // Acciones

  async function marcarConfirmada(r) {
    const { isConfirmed } = await Swal.fire({
      title: "Confirmar cita",
      text: `${r.clienteNombre || r.idCliente} — ${toLocalDate(r.fechaCita)} ${
        r.horaInicio
      }`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Volver",
    });
    if (!isConfirmed) return;

    Swal.fire({
      title: "Guardando…",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      await updateCitaStatus(r.idCita, "confirmada");
      await refresh();
      swalToast("success", "Cita confirmada");
    } catch {
      Swal.fire("Error", "No se pudo confirmar la cita.", "error");
    }
  }

  async function marcarRechazada(r) {
    const { value, isConfirmed } = await Swal.fire({
      title: "Rechazar cita",
      input: "text",
      inputPlaceholder: "Motivo de rechazo",
      showCancelButton: true,
      confirmButtonText: "Rechazar",
      cancelButtonText: "Volver",
      preConfirm: (motivo) => {
        if (!motivo || motivo.trim().length < 3) {
          Swal.showValidationMessage("Ingresa un motivo (≥3 caracteres)");
          return false;
        }
        return motivo;
      },
    });
    if (!isConfirmed) return;

    Swal.fire({
      title: "Guardando…",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      await updateCitaStatus(r.idCita, "rechazada", value);
      await refresh();
      swalToast("success", "Cita rechazada");
    } catch {
      Swal.fire("Error", "No se pudo rechazar la cita.", "error");
    }
  }

  async function marcarCancelada(r) {
    const { value, isConfirmed } = await Swal.fire({
      title: "Cancelar cita",
      input: "text",
      inputPlaceholder: "Motivo de cancelación",
      showCancelButton: true,
      confirmButtonText: "Cancelar cita",
      cancelButtonText: "Volver",
      preConfirm: (motivo) => {
        if (!motivo || motivo.trim().length < 3) {
          Swal.showValidationMessage("Ingresa un motivo (≥3 caracteres)");
          return false;
        }
        return motivo;
      },
    });
    if (!isConfirmed) return;

    Swal.fire({
      title: "Cancelando…",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      await updateCitaStatus(r.idCita, "cancelada", value);
      await refresh();
      swalToast("success", "Cita cancelada");
    } catch {
      Swal.fire("Error", "No se pudo cancelar la cita.", "error");
    }
  }

  async function marcarAtendida(r) {
    const { isConfirmed } = await Swal.fire({
      title: "Marcar como ATENDIDA",
      text: `${r.clienteNombre || r.idCliente} — ${toLocalDate(r.fechaCita)} ${
        r.horaInicio
      }`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Atendida",
      cancelButtonText: "Volver",
    });
    if (!isConfirmed) return;

    Swal.fire({
      title: "Guardando…",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      await updateCitaStatus(r.idCita, "atendida");
      await refresh();
      swalToast("success", "Cita atendida");
    } catch {
      Swal.fire("Error", "No se pudo marcar como atendida.", "error");
    }
  }

  return (
    <div className="gestion-usuarios-page">
      <div className="gestion-header">
        <div>
          <h1>Citas</h1>
        </div>
        <div className="gestion-actions">
          <select
            className="nb-input"
            value={fEstado}
            onChange={(e) => setFEstado(e.target.value)}
          >
            <option value="todos">Estado: Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="rechazada">Rechazadas</option>
            <option value="cancelada">Canceladas</option>
            <option value="atendida">Atendidas</option>
          </select>
          <select
            className="nb-input"
            value={fDia}
            onChange={(e) => setFDia(e.target.value)}
          >
            <option value="todos">Día: Todos</option>
            <option value="lunes">Lunes</option>
            <option value="martes">Martes</option>
            <option value="miércoles">Miércoles</option>
            <option value="jueves">Jueves</option>
            <option value="viernes">Viernes</option>
            <option value="sábado">Sábado</option>
            <option value="domingo">Domingo</option>
          </select>

          {isSuperAdmin && (
            <select
              className="nb-input"
              value={fNegocio}
              onChange={(e) => setFNegocio(e.target.value)}
            >
              <option value="todos">Negocio: Todos</option>
              {negocios.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.nombre}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="gestion-card" style={{ display: "grid", gap: 12 }}>
        {loading ? (
          <div className="text-center">Cargando…</div>
        ) : filtered.length ? (
          filtered.map((r, i) => {
            const colorEstado =
              r.estado === "atendida"
                ? "badge-success"
                : r.estado === "cancelada" || r.estado === "rechazada"
                ? "badge-danger"
                : r.estado === "confirmada"
                ? "badge-info"
                : "badge-warning";
            return (
              <div
                key={r.idCita ?? `idx-${i}`}
                className="cita-card"
                style={{
                  background: "#0a3d62",
                  borderRadius: 10,
                  padding: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div style={{ fontWeight: 700, color: "#fff" }}>
                  <div
                    style={{ fontSize: "1rem", textTransform: "capitalize" }}
                  >
                    {r.clienteNombre || `Cliente #${r.idCliente}`}
                  </div>
                  <div style={{ fontWeight: 400 }}>
                    DÍA:{" "}
                    <b style={{ textTransform: "uppercase" }}>
                      {weekdayName(r.fechaCita)}
                    </b>
                    {"  "} HORA: <b>{r.horaInicio}</b>
                    {"  "} – <b>{r.horaFin}</b>
                    {r.tecnicoNombre ? `  • Técnico: ${r.tecnicoNombre}` : ""}
                    {r.servicioNombre
                      ? `  • Servicio: ${r.servicioNombre}`
                      : ""}
                    {isSuperAdmin && r.negocioNombre
                      ? `  • Negocio: ${r.negocioNombre}`
                      : ""}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    className={colorEstado}
                    style={{ minWidth: 110, textAlign: "center" }}
                  >
                    {r.estado?.toUpperCase()}
                  </span>

                  {r.estado === "pendiente" && (
                    <>
                      <button
                        className="nb-btn-small success"
                        style={{ marginTop: 0}}
                        onClick={() => marcarConfirmada(r)}
                      >
                        Confirmar
                      </button>
                      <button
                        className="nb-btn-small danger"
                        onClick={() => marcarRechazada(r)}
                      >
                        Rechazar
                      </button>
                    </>
                  )}

                  {r.estado === "confirmada" && (
                    <>
                      <button
                         style={{ marginTop: 0}}
                        className="nb-btn-small success"
                        onClick={() => marcarAtendida(r)}
                      >
                        Atendida
                      </button>
                      <button
                        className="nb-btn-small warning"
                        onClick={() => marcarCancelada(r)}
                      >
                        Cancelar
                      </button>
                      <button
                        className="nb-btn-small danger"
                        onClick={() => marcarRechazada(r)}
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center">
            No hay citas para los filtros aplicados.
          </div>
        )}
      </div>
    </div>
  );
}
