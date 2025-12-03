
import { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import {
  listServicios,
  createServicio,
  updateServicio,
  deleteServicio,
  restoreServicio,
} from "../../../services/serviciosService";
import { listNegocios } from "../../../services/catalogosService";
import "../personalNearbiz/GestionServicios.css";

export default function GestionServicios({ isSuperAdmin = false }) {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [fEstado, setFEstado] = useState("activos");
  const [fNegocio, setFNegocio] = useState("todos");

  // catálogos
  const [negocios, setNegocios] = useState([]);

  const fetchedRef = useRef(false);

 
  const swalToast = (icon, title) =>
    Swal.fire({
      icon,
      title,
      timer: 1600,
      showConfirmButton: false,
      position: "center", 
    });

  async function refresh() {
    setLoading(true);
    try {
      const data = await listServicios({ includeInactive: true });
      const mapped = (data || []).map((x) => ({
        idServicio: x.idServicio ?? x.IdServicio,
        idNegocio: x.idNegocio ?? x.IdNegocio,
        nombreServicio: x.nombreServicio ?? x.NombreServicio,
        descripcion: x.descripcion ?? x.Descripcion,
        precio: Number(x.precio ?? x.Precio ?? 0),
        duracionMinutos: x.duracionMinutos ?? x.DuracionMinutos,
        estado:
          typeof (x.estado ?? x.Estado) === "boolean"
            ? !!(x.estado ?? x.Estado)
            : String(x.estado ?? x.Estado).toLowerCase() === "true",
      }));

      setRaw(mapped);
    } finally {
      setLoading(false);
    }
  }

  async function loadCatalogos() {
    if (!isSuperAdmin) {
      setNegocios([]);
      return;
    }
    const neg = await listNegocios().catch(() => []);
    setNegocios(neg || []);
  }

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (async function init() {
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

    if (fEstado === "activos") {
      out = out.filter((r) => r.estado === true);
    } else if (fEstado === "inactivos") {
      out = out.filter((r) => r.estado === false);
    }

    if (isSuperAdmin && fNegocio !== "todos") {
      out = out.filter((r) => String(r.idNegocio) === String(fNegocio));
    }

 
    out = [...out].sort((a, b) =>
      String(a.nombreServicio).localeCompare(String(b.nombreServicio))
    );

    return out;
  }, [raw, fEstado, fNegocio, isSuperAdmin]);

  // --------- acciones ---------

  async function abrirModalNuevo() {
   
    const optionsNegocio = negocios
      .map(function (n) {
        return '<option value="' + n.id + '">' + n.nombre + "</option>";
      })
      .join("");

    const { value, isConfirmed } = await Swal.fire({
      title: "Nuevo servicio",
     
      html:
        (isSuperAdmin
          ? '<div class="swal2-field" style="text-align:left">' +
            "<label style='color:#333; font-weight:600;'>Negocio</label>" +
            '<select id="sw-negocio" class="swal2-input" style="height:auto">' +
            optionsNegocio +
            "</select>" +
            "</div>"
          : "") +
        '<div class="swal2-field" style="text-align:left">' +
        "<label style='color:#333; font-weight:600;'>Nombre del servicio</label>" +
        '<input id="sw-nombre" class="swal2-input" />' +
        "</div>" +
        '<div class="swal2-field" style="text-align:left">' +
        "<label style='color:#333; font-weight:600;'>Descripción</label>" +
        '<textarea id="sw-desc" class="swal2-textarea"></textarea>' +
        "</div>" +
        '<div class="swal2-field" style="text-align:left">' +
        "<label style='color:#333; font-weight:600;'>Precio</label>" +
        '<input id="sw-precio" class="swal2-input" type="number" min="0" step="0.01" />' +
        "</div>" +
        '<div class="swal2-field" style="text-align:left">' +
        "<label style='color:#333; font-weight:600;'>Duración (minutos)</label>" +
        '<input id="sw-dur" class="swal2-input" type="number" min="5" step="5" />' +
        "</div>",
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: function () {
        var idNegocioSel = null;

      
        if (isSuperAdmin) {
          idNegocioSel = Number(document.getElementById("sw-negocio").value);
          if (!idNegocioSel) {
            Swal.showValidationMessage("Elige un negocio");
            return false;
          }
        }

        var nombre = document.getElementById("sw-nombre").value.trim();
        var desc = document.getElementById("sw-desc").value.trim();
        var precioVal = Number(document.getElementById("sw-precio").value);
        var durVal = Number(document.getElementById("sw-dur").value);

        if (!nombre) {
          Swal.showValidationMessage("El nombre del servicio es obligatorio");
          return false;
        }
        if (!precioVal || precioVal <= 0) {
          Swal.showValidationMessage("El precio debe ser un número mayor a 0");
          return false;
        }
        if (!durVal || durVal <= 0) {
          Swal.showValidationMessage(
            "La duración debe ser un número mayor a 0"
          );
          return false;
        }

     
        var payload = {
          nombreServicio: nombre,
          descripcion: desc || null,
          precio: precioVal,
          duracionMinutos: durVal,
        };

        
        if (isSuperAdmin) {
          payload.idNegocio = idNegocioSel;
        }

        return payload;
      },
    });

    if (!isConfirmed) return;

    Swal.fire({
      title: "Guardando…",
      allowOutsideClick: false,
      didOpen: function () {
        Swal.showLoading();
      },
    });

    try {
      await createServicio(value);
      await refresh();
      swalToast("success", "Servicio creado");
    } catch (e) {
      var msg =
        (e && e.response && e.response.data && e.response.data.message) ||
        "No se pudo crear el servicio";
      Swal.fire("Error", msg, "error");
    }
  }

  async function abrirModalEditar(servicio) {
    const { value, isConfirmed } = await Swal.fire({
      title: "Editar servicio",
   
      html:
        '<div class="swal2-field" style="text-align:left">' +
        "<label style='color:#333; font-weight:600;'>Nombre del servicio</label>" +
        '<input id="sw-nombre" class="swal2-input" />' +
        "</div>" +
        '<div class="swal2-field" style="text-align:left">' +
        "<label style='color:#333; font-weight:600;'>Descripción</label>" +
        '<textarea id="sw-desc" class="swal2-textarea"></textarea>' +
        "</div>" +
        '<div class="swal2-field" style="text-align:left">' +
        "<label style='color:#333; font-weight:600;'>Precio</label>" +
        '<input id="sw-precio" class="swal2-input" type="number" min="0" step="0.01" />' +
        "</div>" +
        '<div class="swal2-field" style="text-align:left">' +
        "<label style='color:#333; font-weight:600;'>Duración (minutos)</label>" +
        '<input id="sw-dur" class="swal2-input" type="number" min="5" step="5" />' +
        "</div>",
      didOpen: function () {
        document.getElementById("sw-nombre").value =
          servicio.nombreServicio || "";
        document.getElementById("sw-desc").value = servicio.descripcion || "";
        document.getElementById("sw-precio").value = servicio.precio || 0;
        document.getElementById("sw-dur").value = servicio.duracionMinutos || 0;
      },
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar cambios",
      cancelButtonText: "Cancelar",
      preConfirm: function () {
        var nombre = document.getElementById("sw-nombre").value.trim();
        var desc = document.getElementById("sw-desc").value.trim();
        var precioVal = Number(document.getElementById("sw-precio").value);
        var durVal = Number(document.getElementById("sw-dur").value);

        if (!nombre) {
          Swal.showValidationMessage("El nombre del servicio es obligatorio");
          return false;
        }
        if (!precioVal || precioVal <= 0) {
          Swal.showValidationMessage("El precio debe ser un número mayor a 0");
          return false;
        }
        if (!durVal || durVal <= 0) {
          Swal.showValidationMessage(
            "La duración debe ser un número mayor a 0"
          );
          return false;
        }

        return {
          nombreServicio: nombre,
          descripcion: desc || null,
          precio: precioVal,
          duracionMinutos: durVal,
        };
      },
    });

    if (!isConfirmed) return;

    Swal.fire({
      title: "Guardando…",
      allowOutsideClick: false,
      didOpen: function () {
        Swal.showLoading();
      },
    });

    try {
      await updateServicio(servicio.idServicio, value);
      await refresh();
      swalToast("success", "Servicio actualizado");
    } catch (e) {
      var msg =
        (e && e.response && e.response.data && e.response.data.message) ||
        "No se pudo actualizar el servicio";
      Swal.fire("Error", msg, "error");
    }
  }

  async function cambiarEstado(servicio) {
    if (servicio.estado) {
      
      const { isConfirmed } = await Swal.fire({
        title: "Desactivar servicio",
        text:
          "¿Seguro que quieres desactivar el servicio '" +
          servicio.nombreServicio +
          "'?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, desactivar",
        cancelButtonText: "Cancelar",
      });
      if (!isConfirmed) return;

      Swal.fire({
        title: "Aplicando cambios…",
        allowOutsideClick: false,
        didOpen: function () {
          Swal.showLoading();
        },
      });

      try {
        await deleteServicio(servicio.idServicio);
        await refresh();
        swalToast("success", "Servicio desactivado");
      } catch (e) {
        Swal.fire("Error", "No se pudo desactivar el servicio", "error");
      }
    } else {
     
      const { isConfirmed } = await Swal.fire({
        title: "Reactivar servicio",
        text:
          "¿Seguro que quieres reactivar el servicio '" +
          servicio.nombreServicio +
          "'?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, reactivar",
        cancelButtonText: "Cancelar",
      });
      if (!isConfirmed) return;

      Swal.fire({
        title: "Aplicando cambios…",
        allowOutsideClick: false,
        didOpen: function () {
          Swal.showLoading();
        },
      });

      try {
        await restoreServicio(servicio.idServicio);
        await refresh();
        swalToast("success", "Servicio reactivado");
      } catch (e) {
        Swal.fire("Error", "No se pudo reactivar el servicio", "error");
      }
    }
  }



  return (
    <div className="gestion-usuarios-page">
      <div className="gestion-header">
        <div>
          <h1>Servicios</h1>
        </div>

        <div className="gestion-actions">
          <select
            className="nb-input"
            value={fEstado}
            onChange={function (e) {
              setFEstado(e.target.value);
            }}
          >
            <option value="activos">Estado: Activos</option>
            <option value="inactivos">Estado: Inactivos</option>
            <option value="todos">Estado: Todos</option>
          </select>

          {isSuperAdmin && (
            <select
              className="nb-input"
              value={fNegocio}
              onChange={function (e) {
                setFNegocio(e.target.value);
              }}
            >
              <option value="todos">Negocio: Todos</option>
              {negocios.map(function (n) {
                return (
                  <option key={n.id} value={n.id}>
                    {n.nombre}
                  </option>
                );
              })}
            </select>
          )}

          <button
            className="nb-btn-primary"
            type="button"
            onClick={abrirModalNuevo}
          >
            Nuevo servicio
          </button>
        </div>
      </div>

      <div className="gestion-card" style={{ display: "grid", gap: 12 }}>
        {loading ? (
          <div className="text-center">Cargando servicios…</div>
        ) : filtered.length ? (
          filtered.map(function (s) {
            const badgeClass = s.estado ? "badge-success" : "badge-danger";
            const etiquetaEstado = s.estado ? "ACTIVO" : "INACTIVO";

            return (
              <div
                key={s.idServicio}
                className="cita-card"
                style={{
                  background: "#0a3d62",
                  borderRadius: 10,
                  padding: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  color: "white", 
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                    }}
                  >
                    {s.nombreServicio}
                  </div>
                  <div style={{ fontSize: "0.9rem" }}>
                    {s.descripcion || "Sin descripción"}
                  </div>
                  <div style={{ marginTop: 4, fontSize: "0.9rem" }}>
                    Precio:{" "}
                    <b>
                      $
                      {s.precio.toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </b>{" "}
                    · Duración: <b>{s.duracionMinutos} min</b>
                    {isSuperAdmin && s.idNegocio
                      ? " · Negocio ID: " + s.idNegocio
                      : ""}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    className={badgeClass}
                    style={{
                      minWidth: 100,
                      textAlign: "center",
                    }}
                  >
                    {etiquetaEstado}
                  </span>
                  <button
                    className="nb-btn-small"
                    type="button"
                    onClick={function () {
                      abrirModalEditar(s);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className={
                      "nb-btn-small " + (s.estado ? "danger" : "success")
                    }
                    type="button"
                    onClick={function () {
                      cambiarEstado(s);
                    }}
                  >
                    {s.estado ? "Desactivar" : "Reactivar"}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center">
            No hay servicios para los filtros aplicados.
          </div>
        )}
      </div>
    </div>
  );
}