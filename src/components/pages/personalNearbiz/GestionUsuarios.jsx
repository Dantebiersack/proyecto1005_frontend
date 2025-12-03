// src/components/pages/personalNearbiz/GestionUsuarios.jsx
import { useEffect, useState } from "react";
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  restoreUsuario,
} from "../../../services/usersService";
import { useAuth } from "../../../auth/AuthContext";
import "./GestionUsuarios.css";

const ROLES_MAP = {
  1: "Admin NearBiz",
  2: "Personal NearBiz",
  3: "Admin de negocio",
};

const ROLES_OPTIONS = [
  { id: 1, label: "Admin NearBiz" },
  { id: 2, label: "Admin de negocio" },
  { id: 3, label: "Personal" },
];

export default function GestionUsuarios() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    contrasenaHash: "",
    idRol: 2,
  });

  // ============================
  // CARGA INICIAL
  // ============================
  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    try {
      setLoading(true);
      const data = await getUsuarios(true); // includeInactive = true

      // 👇 AQUI normalizamos TODO lo que pueda venir en PascalCase
      const normalizados = data.map((u, idx) => ({
        // si viene en camel lo usamos, si no, usamos Pascal, si no, fallback al idx
        idUsuario: u.idUsuario ?? u.IdUsuario ?? idx,
        nombre: u.nombre ?? u.Nombre ?? "",
        email: u.email ?? u.Email ?? "",
        idRol: u.idRol ?? u.IdRol ?? 2,
        estado: u.estado ?? u.Estado ?? false,
        token: u.token ?? u.Token ?? null,
      }));

      setUsuarios(normalizados);
    } catch (err) {
      console.error("Error cargando usuarios", err);
    } finally {
      setLoading(false);
    }
  }

  // ============================
  // ABRIR ALTA
  // ============================
  function openNew() {
    setEditing(null);
    setFormData({
      nombre: "",
      email: "",
      contrasenaHash: "",
      idRol: 2,
    });
    setShowForm(true);
  }

  // ============================
  // ABRIR EDICIÓN
  // ============================
  function openEdit(u) {
    setEditing(u);
    setFormData({
      nombre: u.nombre,
      email: u.email,
      contrasenaHash: "", // no se edita aquí
      idRol: u.idRol,
    });
    setShowForm(true);
  }

  // ============================
  // GUARDAR
  // ============================
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        // update
        await updateUsuario(editing.idUsuario, {
          nombre: formData.nombre,
          email: formData.email,
          idRol: formData.idRol,
          token: editing.token, // conservar
        });
      } else {
        // create
        await createUsuario({
          nombre: formData.nombre,
          email: formData.email,
          contrasenaHash: formData.contrasenaHash || "temp123",
          idRol: formData.idRol,
          token: null,
        });
      }
      setShowForm(false);
      await cargar();
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar");
    }
  }

  // ============================
  // DESACTIVAR
  // ============================
  async function handleDelete(u) {
    if (!window.confirm("¿Desactivar este usuario?")) return;
    await deleteUsuario(u.idUsuario);
    await cargar();
  }

  // ============================
  // ACTIVAR
  // ============================
  async function handleRestore(u) {
    await restoreUsuario(u.idUsuario);
    await cargar();
  }

  // ============================
  // FILTRO
  // ============================
  const filtered = usuarios.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.nombre || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (ROLES_MAP[u.idRol] || "").toLowerCase().includes(q)
    );
  });

  // ============================
  // RENDER
  // ============================
  return (
    <div className="gestion-usuarios-page">
      {/* encabezado */}
      <div className="gestion-header">
        <div>
          <h1>Gestión de usuarios</h1>
          <p>Administra quién puede entrar al panel NearBiz.</p>
        </div>
        <div className="gestion-actions">
          <input
            className="nb-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo"
          />
          <button className="nb-btn-primary" onClick={openNew}>
            + Nuevo
          </button>
        </div>
      </div>

      {/* tabla */}
      <div className="gestion-card">
        <table className="gestion-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th className="col-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr key="loading-row">
                <td colSpan="5" className="text-center">
                  Cargando...
                </td>
              </tr>
            ) : filtered.length ? (
              filtered.map((u) => (
                <tr key={u.idUsuario}>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge-role">
                      {ROLES_MAP[u.idRol] || "—"}
                    </span>
                  </td>
                  <td>
                    {u.estado ? (
                      <span className="badge-success">Activo</span>
                    ) : (
                      <span className="badge-danger">Inactivo</span>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="nb-btn-small"
                        onClick={() => openEdit(u)}
                      >
                        Editar
                      </button>
                      {u.estado ? (
                        <button
                          className="nb-btn-small danger"
                          onClick={() => handleDelete(u)}
                        >
                          Desactivar
                        </button>
                      ) : (
                        <button
                          className="nb-btn-small success"
                          onClick={() => handleRestore(u)}
                        >
                          Activar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr key="empty-row">
                <td colSpan="5" className="text-center">
                  No hay usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* modal */}
      {showForm && (
        <div className="nb-modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="nb-modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="nb-modal-header">
              <h2>{editing ? "Editar usuario" : "Nuevo usuario"}</h2>
              <button
                className="nb-modal-close"
                onClick={() => setShowForm(false)}
              >
                ✕
              </button>
            </div>

            <form className="nb-modal-body" onSubmit={handleSubmit}>
              <label>
                Nombre
                <input
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, nombre: e.target.value }))
                  }
                  required
                />
              </label>

              <label>
                Correo
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </label>

              {!editing && (
                <label>
                  Contraseña (temporal)
                  <input
                    value={formData.contrasenaHash}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        contrasenaHash: e.target.value,
                      }))
                    }
                    placeholder="temp123"
                  />
                </label>
              )}

              <label>
                Rol
                <select
                  value={formData.idRol}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      idRol: Number(e.target.value),
                    }))
                  }
                >
                  {ROLES_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="nb-modal-footer">
                <button
                  type="button"
                  className="nb-btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="nb-btn-primary">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
