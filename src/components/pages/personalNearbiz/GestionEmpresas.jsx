import { useEffect, useState } from "react";
import {
  getNegocios,
  createNegocio,
  updateNegocio,
  deleteNegocio,
  restoreNegocio,
} from "../../../services/negociosService";
import api from "../../../services/api"; // Para cargar categorías directamente
import { useAuth } from "../../../auth/AuthContext";
import "./GestionUsuarios.css"; // 👈 Reutilizamos el CSS existente
import { FaPlus } from "react-icons/fa";

// Estado inicial del formulario
const FORM_INICIAL = {
  nombre: "",
  idCategoria: "",
  direccion: "",
  telefonoContacto: "",
  correoContacto: "",
  descripcion: "",
  horarioAtencion: "",
  linkUrl: "",
  coordenadasLat: 21.1165,
  coordenadasLng: -101.6696,
};

export default function GestionEmpresas() {
  const { user } = useAuth();
  
  const [negocios, setNegocios] = useState([]);
  const [categorias, setCategorias] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(FORM_INICIAL);


  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setLoading(true);
      
     
      const [listaNegocios, listaCategorias] = await Promise.all([
        getNegocios(true), 
        api.get("/Categorias").then(res => res.data) 
      ]);

      setNegocios(listaNegocios);
      setCategorias(listaCategorias);

    } catch (err) {
      console.error("Error cargando datos", err);
    } finally {
      setLoading(false);
    }
  }

 
  const getNombreCategoria = (id) => {
    const cat = categorias.find(c => c.IdCategoria === id);
    return cat ? cat.NombreCategoria : "Sin categoría";
  };


  function openNew() {
    setEditing(null);
    setFormData(FORM_INICIAL);
    setShowForm(true);
  }

  function openEdit(negocio) {
    setEditing(negocio);

    setFormData({
      nombre: negocio.Nombre,
      idCategoria: negocio.IdCategoria,
      direccion: negocio.Direccion || "",
      telefonoContacto: negocio.TelefonoContacto || "",
      correoContacto: negocio.CorreoContacto || "",
      descripcion: negocio.Descripcion || "",
      horarioAtencion: negocio.HorarioAtencion || "",
      linkUrl: negocio.LinkUrl || "",
      coordenadasLat: negocio.CoordenadasLat || 21.1165,
      coordenadasLng: negocio.CoordenadasLng || -101.6696,
    });
    setShowForm(true);
  }

  // ============================
  // GUARDAR
  // ============================
  async function handleSubmit(e) {
    e.preventDefault();
    
   
    const dto = {
      Nombre: formData.nombre,
      IdCategoria: parseInt(formData.idCategoria),
      Direccion: formData.direccion,
      TelefonoContacto: formData.telefonoContacto,
      CorreoContacto: formData.correoContacto,
      Descripcion: formData.descripcion,
      HorarioAtencion: formData.horarioAtencion,
      LinkUrl: formData.linkUrl,
      CoordenadasLat: parseFloat(formData.coordenadasLat),
      CoordenadasLng: parseFloat(formData.coordenadasLng),
      IdMembresia: null, 
    };

    try {
      if (editing) {
        await updateNegocio(editing.IdNegocio, dto);
      } else {
        await createNegocio(dto);
      }
      setShowForm(false);
      await cargarDatos(); 
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar el negocio");
    }
  }

  // ============================
  // ELIMINAR / RESTAURAR
  // ============================
  async function handleDelete(negocio) {
    if (!window.confirm(`¿Desactivar el negocio "${negocio.Nombre}"?`)) return;
    await deleteNegocio(negocio.IdNegocio);
    await cargarDatos();
  }

  async function handleRestore(negocio) {
    if (!window.confirm(`¿Reactivar el negocio "${negocio.Nombre}"?`)) return;
    await restoreNegocio(negocio.IdNegocio);
    await cargarDatos();
  }

  // ============================
  // FILTRO
  // ============================
  const filtered = negocios.filter((n) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (n.Nombre || "").toLowerCase().includes(q) ||
      (n.CorreoContacto || "").toLowerCase().includes(q)
    );
  });

  // ============================
  // RENDER
  // ============================
  return (
    <div className="gestion-usuarios-page"> 
      
      <div className="gestion-header">
        <div>
          <h1>Gestión de Empresas</h1>
          <p>Administra los negocios registrados en la plataforma.</p>
        </div>
        <div className="gestion-actions">
          <input
            className="nb-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar empresa..."
          />
          <button className="nb-btn-primary" onClick={openNew}>
            <FaPlus size={12} style={{ marginRight: "6px" }} />
            Nueva Empresa
          </button>
        </div>
      </div>

      <div className="gestion-card">
        <table className="gestion-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Contacto</th>
              <th>Estado</th>
              <th className="col-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr key="loading">
                <td colSpan="5" className="text-center">Cargando...</td>
              </tr>
            ) : filtered.length ? (
              filtered.map((n) => (
                <tr key={n.IdNegocio}>
                  <td>
                    <div style={{ fontWeight: "bold" }}>{n.Nombre}</div>
                    <small style={{ color: "#666" }}>{n.Direccion}</small>
                  </td>
                  <td>
                    <span className="badge-role">
                      {getNombreCategoria(n.IdCategoria)}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.85rem" }}>{n.TelefonoContacto}</div>
                    <div style={{ fontSize: "0.85rem", color: "#555" }}>{n.CorreoContacto}</div>
                  </td>
                  <td>
                    {n.Estado ? (
                      <span className="badge-success">Activo</span>
                    ) : (
                      <span className="badge-danger">Inactivo</span>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="nb-btn-small" onClick={() => openEdit(n)}>
                        Editar
                      </button>
                      {n.Estado ? (
                        <button className="nb-btn-small danger" onClick={() => handleDelete(n)}>
                          Desactivar
                        </button>
                      ) : (
                        <button className="nb-btn-small success" onClick={() => handleRestore(n)}>
                          Activar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr key="empty">
                <td colSpan="5" className="text-center">No se encontraron negocios.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL --- */}
      {showForm && (
        <div className="nb-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="nb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="nb-modal-header">
              <h2>{editing ? "Editar Empresa" : "Nueva Empresa"}</h2>
              <button className="nb-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form className="nb-modal-body" onSubmit={handleSubmit}>
              <label>
                Nombre del Negocio
                <input
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </label>

              <label>
                Categoría
                <select
                  value={formData.idCategoria}
                  onChange={(e) => setFormData({...formData, idCategoria: e.target.value})}
                  required
                >
                  <option value="">-- Selecciona --</option>
                  {categorias.map((cat) => (
                    <option key={cat.IdCategoria} value={cat.IdCategoria}>
                      {cat.NombreCategoria}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Dirección
                <input
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label>
                  Teléfono
                  <input
                    type="tel"
                    value={formData.telefonoContacto}
                    onChange={(e) => setFormData({...formData, telefonoContacto: e.target.value})}
                  />
                </label>
                <label>
                  Email Contacto
                  <input
                    type="email"
                    value={formData.correoContacto}
                    onChange={(e) => setFormData({...formData, correoContacto: e.target.value})}
                  />
                </label>
              </div>

              <div className="nb-modal-footer">
                <button type="button" className="nb-btn-secondary" onClick={() => setShowForm(false)}>
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