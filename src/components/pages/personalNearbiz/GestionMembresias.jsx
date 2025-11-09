// src/components/pages/personalNearbiz/GestionMembresias.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import {
  getMembresiasAdmin,
  updateMembresia,
  softDeleteMembresia,
  renewMembresia,
  createMembershipForBusiness,
} from "../../../services/membershipsService";
import "../personalNearbiz/GestionUsuarios.css";

const PLAN_DAYS = 30;

function addDays(dateISO, days) {
  if (!dateISO) return null;
  const d = new Date(dateISO);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}
function daysDiffUTC(aISO, bISO) {
  if (!aISO || !bISO) return null;
  const a = new Date(aISO);
  const b = new Date(bISO);
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}
function toLocalDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}

export default function GestionMembresias() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("todos");
  const [sort, setSort] = useState({ field: "nombreNegocio", dir: "asc" });
  const [editing, setEditing] = useState(null);
  const [precio, setPrecio] = useState("");
  const fetchedRef = useRef(false);

  const swalToast = (icon, title) =>
    Swal.fire({ icon, title, timer: 1600, showConfirmButton: false, position: "top-end" });

  async function refresh() {
    setLoading(true);
    try {
      const data = await getMembresiasAdmin({ includeInactive: true });
      const nowIso = new Date().toISOString();
      const mapped = (data || []).map((r) => {
        const idMembresia = r.idMembresia ?? r.IdMembresia ?? r.id ?? null;
        const idNegocio = r.idNegocio ?? r.IdNegocio ?? null;
        const nombreNegocio = r.nombreNegocio ?? r.NombreNegocio ?? "";
        const precioMensual = r.precioMensual ?? r.PrecioMensual ?? 0;
        const estado = (r.estado ?? r.Estado) ?? false;
        const ultimaRenovacion = r.ultimaRenovacion ?? r.UltimaRenovacion ?? null;
        const expiraISO = addDays(ultimaRenovacion, PLAN_DAYS);
        const daysLeft = daysDiffUTC(expiraISO, nowIso);
        const expired = daysLeft !== null ? daysLeft < 0 : false;
        return {
          idMembresia,
          idNegocio,
          nombreNegocio,
          precioMensual,
          estado,
          ultimaRenovacion,
          expiraISO,
          daysLeft,
          expired,
        };
      });
      setRows(mapped);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    refresh();
  }, []);

  const filtered = useMemo(() => {
    let out = rows;
    if (q.trim()) {
      const text = q.toLowerCase();
      out = out.filter(
        (r) =>
          (r.nombreNegocio || "").toLowerCase().includes(text) ||
          String(r.precioMensual ?? "").includes(text)
      );
    }
    if (estado !== "todos") {
      if (estado === "activos") out = out.filter((r) => r.estado);
      if (estado === "inactivos") out = out.filter((r) => !r.estado);
      if (estado === "vencidas") out = out.filter((r) => r.expired);
      if (estado === "por-vencer-7")
        out = out.filter((r) => r.estado && r.daysLeft >= 0 && r.daysLeft <= 7);
      if (estado === "por-vencer-3")
        out = out.filter((r) => r.estado && r.daysLeft >= 0 && r.daysLeft <= 3);
    }
    const dir = sort.dir === "asc" ? 1 : -1;
    out = [...out].sort((a, b) => {
      const fa = sort.field;
      let va = a[fa];
      let vb = b[fa];
      if (fa === "expiraISO") return (va || "").localeCompare(vb || "") * dir;
      if (fa === "daysLeft") return ((a.daysLeft ?? 9999) - (b.daysLeft ?? 9999)) * dir;
      if (typeof va === "string") return va.localeCompare(vb) * dir;
      if (typeof va === "number" || typeof va === "boolean") return (va - vb) * dir;
      return 0;
    });
    return out;
  }, [rows, q, estado, sort]);

  function toggleSort(field) {
    setSort((s) =>
      s.field === field ? { field, dir: s.dir === "asc" ? "desc" : "asc" } : { field, dir: "asc" }
    );
  }

  async function onRenovar(r) {
    const { isConfirmed } = await Swal.fire({
      title: `¿Renovar la membresía de “${r.nombreNegocio}”?`,
      text: "Se actualizará la última renovación a hoy.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, renovar",
      cancelButtonText: "Cancelar",
    });
    if (!isConfirmed) return;
    Swal.fire({ title: "Procesando…", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      await renewMembresia(r.idMembresia);
      await refresh();
      swalToast("success", "Membresía renovada");
    } catch {
      Swal.fire("Error", "No se pudo renovar la membresía.", "error");
    }
  }

  async function onDarDeBaja(r) {
    const { isConfirmed } = await Swal.fire({
      title: `¿Dar de baja “${r.nombreNegocio}”?`,
      text: "La membresía quedará inactiva.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, dar de baja",
      cancelButtonText: "Cancelar",
    });
    if (!isConfirmed) return;
    Swal.fire({ title: "Procesando…", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      await softDeleteMembresia(r.idMembresia);
      await refresh();
      swalToast("success", "Membresía dada de baja");
    } catch {
      Swal.fire("Error", "No se pudo dar de baja la membresía.", "error");
    }
  }

  async function onCrearMembresia() {
    const { value, isConfirmed } = await Swal.fire({
      title: "Crear membresía",
      html: `
        <label>ID del negocio</label>
        <input id="sw-idNegocio" class="swal2-input" type="number" min="1" placeholder="Ej. 7"/>
        <label>Precio mensual</label>
        <input id="sw-precio" class="swal2-input" type="number" step="0.01" min="0" placeholder="Ej. 499"/>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Crear",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const idNegocio = Number(document.getElementById("sw-idNegocio").value);
        const precioMensual = Number(document.getElementById("sw-precio").value);
        if (!idNegocio || idNegocio < 1)
          return Swal.showValidationMessage("Ingresa un ID válido.");
        if (isNaN(precioMensual) || precioMensual < 0)
          return Swal.showValidationMessage("Ingresa un precio válido.");
        return { idNegocio, precioMensual };
      },
    });
    if (!isConfirmed) return;
    Swal.fire({ title: "Creando…", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      await createMembershipForBusiness(value.idNegocio, value.precioMensual);
      await refresh();
      swalToast("success", "Membresía creada correctamente");
    } catch (e) {
      if (e?.response?.status === 409)
        Swal.fire("Ya existe", "Ese negocio ya tiene membresía.", "info");
      else if (e?.response?.status === 404)
        Swal.fire("No encontrado", "El negocio no existe.", "warning");
      else Swal.fire("Error", "No se pudo crear la membresía.", "error");
    }
  }

  function openEdit(r) {
    setEditing(r);
    setPrecio(String(r.precioMensual ?? 0));
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editing) return;
    await updateMembresia(editing.idMembresia, {
      precioMensual: Number(precio),
      idNegocio: editing.idNegocio,
    });
    setEditing(null);
    swalToast("success", "Precio actualizado");
    await refresh();
  }

  return (
    <div className="gestion-usuarios-page">
      <div className="gestion-header">
        <div>
          <h1>Membresías</h1>
          <p>Administra precios, renovaciones y bajas.</p>
        </div>
        <div className="gestion-actions">
          <input
            className="nb-input"
            placeholder="Buscar negocio o precio"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="nb-input" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
            <option value="vencidas">Vencidas</option>
            <option value="por-vencer-7">Por vencer (≤7 días)</option>
            <option value="por-vencer-3">Por vencer (≤3 días)</option>
          </select>
          <button className="nb-btn-primary" onClick={onCrearMembresia}>
            + Crear membresía
          </button>
        </div>
      </div>

      <div className="gestion-card">
        <table className="gestion-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort("nombreNegocio")}>Negocio</th>
              <th onClick={() => toggleSort("precioMensual")}>Precio</th>
              <th>Última renovación</th>
              <th onClick={() => toggleSort("expiraISO")}>Expira</th>
              <th onClick={() => toggleSort("daysLeft")}>Días restantes</th>
              <th onClick={() => toggleSort("estado")}>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center">Cargando…</td></tr>
            ) : filtered.length ? (
              filtered.map((r, i) => (
                <tr key={r.idMembresia ?? i} className={r.expired ? "row-expired" : ""}>
                  <td>{r.nombreNegocio}</td>
                  <td>${r.precioMensual.toFixed(2)}</td>
                  <td>{toLocalDateTime(r.ultimaRenovacion)}</td>
                  <td>{r.expiraISO ? toLocalDateTime(r.expiraISO) : "—"}</td>
                  <td>{r.daysLeft != null ? `${r.daysLeft} días` : "—"}</td>
                  <td>{r.estado ? "Activa" : "Inactiva"}</td>
                  <td>
                    <button className="nb-btn-small" onClick={() => openEdit(r)}>Editar</button>
                    <button className="nb-btn-small success" onClick={() => onRenovar(r)}>Renovar</button>
                    {r.estado && r.expired && (
                      <button className="nb-btn-small danger" onClick={() => onDarDeBaja(r)}>
                        Baja
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" className="text-center">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="nb-modal-overlay" onClick={() => setEditing(null)}>
          <div className="nb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="nb-modal-header">
              <h2>Editar precio</h2>
              <button className="nb-modal-close" onClick={() => setEditing(null)}>✕</button>
            </div>
            <form className="nb-modal-body" onSubmit={saveEdit}>
              <label>Negocio
                <input value={editing.nombreNegocio} disabled />
              </label>
              <label>Precio mensual
                <input type="number" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} />
              </label>
              <div className="nb-modal-footer">
                <button type="button" className="nb-btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
                <button type="submit" className="nb-btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
