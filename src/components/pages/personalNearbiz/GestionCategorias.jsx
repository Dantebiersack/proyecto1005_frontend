
import { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import {
  listCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  restoreCategoria,
} from "../../../services/categoriasService";
import "../personalNearbiz/GestionUsuarios.css";

export default function GestionCategorias() {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fEstado, setFEstado] = useState("todas"); // todas | activas | inactivas
  const [fBusqueda, setFBusqueda] = useState(""); // filtro por nombre

  const fetchedRef = useRef(false);

  const swalToast = function (icon, title) {
    return Swal.fire({
      icon: icon,
      title: title,
      timer: 1600,
      showConfirmButton: false,
      position: "top-end",
    });
  };

  async function refresh() {
    setLoading(true);
    try {
     
      const data = await listCategorias(true);
      setRaw(data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (async function () {
      setLoading(true);
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    var out = raw || [];

    if (fEstado === "activas") {
      out = out.filter(function (r) {
        return r.Estado === true;
      });
    } else if (fEstado === "inactivas") {
      out = out.filter(function (r) {
        return r.Estado === false;
      });
    }

    var term = (fBusqueda || "").toLowerCase().trim();
    if (term) {
      out = out.filter(function (r) {
        var name = (r.NombreCategoria || "").toLowerCase();
        return name.indexOf(term) !== -1;
      });
    }

    // ordenar por IdCategoria
    out = out.slice().sort(function (a, b) {
      return (a.IdCategoria || 0) - (b.IdCategoria || 0);
    });

    return out;
  }, [raw, fEstado, fBusqueda]);

  async function handleCrear() {
    const res = await Swal.fire({
      title: "Nueva categoría",
      input: "text",
      inputLabel: "Nombre de la categoría",
      inputPlaceholder: "Ej. Spa, Barbería, Veterinaria…",
      showCancelButton: true,
      confirmButtonText: "Crear",
      cancelButtonText: "Cancelar",
      preConfirm: function (value) {
        if (!value || !value.trim() || value.trim().length < 3) {
          Swal.showValidationMessage(
            "Ingresa un nombre de al menos 3 caracteres"
          );
          return false;
        }
        return value.trim();
      },
    });

    if (!res.isConfirmed) return;

    Swal.fire({
      title: "Guardando…",
      allowOutsideClick: false,
      didOpen: function () {
        Swal.showLoading();
      },
    });

    try {
      await createCategoria({ NombreCategoria: res.value });
      await refresh();
      swalToast("success", "Categoría creada");
    } catch (e) {
      var msg =
        (e && e.response && e.response.data && e.response.data.message) ||
        "No se pudo crear la categoría.";
      Swal.fire("Error", msg, "error");
    }
  }

  async function handleEditar(cat) {
    const res = await Swal.fire({
      title: "Editar categoría",
      input: "text",
      inputLabel: "Nombre de la categoría",
      inputValue: cat.NombreCategoria || "",
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: function (value) {
        if (!value || !value.trim() || value.trim().length < 3) {
          Swal.showValidationMessage(
            "Ingresa un nombre de al menos 3 caracteres"
          );
          return false;
        }
        return value.trim();
      },
    });

    if (!res.isConfirmed) return;

    Swal.fire({
      title: "Guardando…",
      allowOutsideClick: false,
      didOpen: function () {
        Swal.showLoading();
      },
    });

    try {
      await updateCategoria(cat.IdCategoria, {
        NombreCategoria: res.value,
      });
      await refresh();
      swalToast("success", "Categoría actualizada");
    } catch (e) {
      var msg =
        (e && e.response && e.response.data && e.response.data.message) ||
        "No se pudo actualizar la categoría.";
      Swal.fire("Error", msg, "error");
    }
  }

  async function handleEliminar(cat) {
    const res = await Swal.fire({
      title: "Desactivar categoría",
      text:
        "¿Seguro que deseas desactivar la categoría " +
        (cat.NombreCategoria || "") +
        "?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
    });

    if (!res.isConfirmed) return;

    Swal.fire({
      title: "Actualizando…",
      allowOutsideClick: false,
      didOpen: function () {
        Swal.showLoading();
      },
    });

    try {
      await deleteCategoria(cat.IdCategoria);
      await refresh();
      swalToast("success", "Categoría desactivada");
    } catch (e) {
      var msg =
        (e && e.response && e.response.data && e.response.data.message) ||
        "No se pudo desactivar la categoría.";
      Swal.fire("Error", msg, "error");
    }
  }

  async function handleRestore(cat) {
    const res = await Swal.fire({
      title: "Restaurar categoría",
      text:
        "¿Deseas activar nuevamente la categoría " +
        (cat.NombreCategoria || "") +
        "?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Restaurar",
      cancelButtonText: "Cancelar",
    });

    if (!res.isConfirmed) return;

    Swal.fire({
      title: "Actualizando…",
      allowOutsideClick: false,
      didOpen: function () {
        Swal.showLoading();
      },
    });

    try {
      await restoreCategoria(cat.IdCategoria);
      await refresh();
      swalToast("success", "Categoría restaurada");
    } catch (e) {
      var msg =
        (e && e.response && e.response.data && e.response.data.message) ||
        "No se pudo restaurar la categoría.";
      Swal.fire("Error", msg, "error");
    }
  }

  return (
    <div className="gestion-usuarios-page">
      <div className="gestion-header">
        <div>
          <h1>Categorías</h1>
        </div>
        <div className="gestion-actions">
          <select
            className="nb-input"
            value={fEstado}
            onChange={function (e) {
              setFEstado(e.target.value);
            }}
          >
            <option value="todas">Estado: Todas</option>
            <option value="activas">Activas</option>
            <option value="inactivas">Inactivas</option>
          </select>

          <input
            className="nb-input"
            type="text"
            placeholder="Buscar por nombre…"
            value={fBusqueda}
            onChange={function (e) {
              setFBusqueda(e.target.value);
            }}
          />

          <button
            className="nb-btn-small success"
            type="button"
            onClick={handleCrear}
          >
            Nueva categoría
          </button>
        </div>
      </div>

      <div
        className="gestion-card"
        style={{ display: "grid", gap: 12 }}
      >
        {loading ? (
          <div className="text-center">Cargando…</div>
        ) : filtered.length ? (
          filtered.map(function (cat) {
            var badgeClass = cat.Estado ? "badge-success" : "badge-danger";
            var badgeText = cat.Estado ? "ACTIVA" : "INACTIVA";

            return (
              <div
                key={cat.IdCategoria}
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
                <div style={{ fontWeight: 700 }}>
                  <div
                    style={{
                      fontSize: "1rem",
                      textTransform: "capitalize",
                    }}
                  >
                    {cat.NombreCategoria}
                  </div>
                  <div style={{ fontWeight: 400 }}>
                    {"ID: "}
                    <b>{cat.IdCategoria}</b>
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
                    style={{ minWidth: 110, textAlign: "center" }}
                  >
                    {badgeText}
                  </span>

                  <button
                    className="nb-btn-small"
                    type="button"
                    onClick={function () {
                      handleEditar(cat);
                    }}
                  >
                    Editar
                  </button>

                  {cat.Estado ? (
                    <button
                      className="nb-btn-small danger"
                      type="button"
                      onClick={function () {
                        handleEliminar(cat);
                      }}
                    >
                      Desactivar
                    </button>
                  ) : (
                    <button
                      className="nb-btn-small success"
                      type="button"
                      onClick={function () {
                        handleRestore(cat);
                      }}
                    >
                      Restaurar
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center">
            No hay categorías para los filtros aplicados.
          </div>
        )}
      </div>
    </div>
  );
}
