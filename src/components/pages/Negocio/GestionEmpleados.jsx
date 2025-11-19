import { useEffect, useState } from "react";
import {
  getPersonal,
  createPersonal,
  updatePersonal,
  deletePersonal,
  restorePersonal,
} from "../../../services/personalService"; 
import {
  createUsuario,
  updateUsuario,
} from "../../../services/usersService"; 
import { useAuth } from "../../../auth/AuthContext";
import "../personalNearbiz/GestionUsuarios.css"; 
import { FaPlus } from "react-icons/fa";

const FORM_INICIAL = {
  nombre: "",
  email: "",
  contrasena: "", 
  rolEnNegocio: "",
};

export default function GestionEmpleados() {
  const { user } = useAuth(); 

  const [empleados, setEmpleados] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); 
  const [formData, setFormData] = useState(FORM_INICIAL);


  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    try {
      setLoading(true);
      
      const data = await getPersonal(true); 
      
      if (!data) {
        setEmpleados([]); 
        return;
      }

      const normalizados = data.map((emp) => ({
        idPersonal: emp.IdPersonal,
        idUsuario: emp.IdUsuario,
        idNegocio: emp.IdNegocio,
        rolEnNegocio: emp.RolEnNegocio,
        estado: emp.Estado,
        nombre: emp.Nombre,
        email: emp.Email,  
        token: null, 
      }));

      setEmpleados(normalizados);
    } catch (err) {
      console.error("Error cargando empleados", err);
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditing(null);
    setFormData(FORM_INICIAL);
    setShowForm(true);
  }

  function openEdit(emp) {
    setEditing(emp);
    setFormData({
      nombre: emp.nombre,
      email: emp.email,
      contrasena: "", 
      rolEnNegocio: emp.rolEnNegocio,
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
      
        await updateUsuario(editing.idUsuario, {
          Nombre: formData.nombre,
          Email: formData.email, 
          IdRol: 3, 
        });
        await updatePersonal(editing.idPersonal, {
          IdUsuario: editing.idUsuario, 
          RolEnNegocio: formData.rolEnNegocio,
        });

      } else {
       
        const nuevoUsuario = await createUsuario({
          Nombre: formData.nombre,
          Email: formData.email,
          ContrasenaHash: formData.contrasena || "temp123", 
          IdRol: 3, 
          Token: null,
        });
        
       
        await createPersonal({
          IdUsuario: nuevoUsuario.IdUsuario, 
          RolEnNegocio: formData.rolEnNegocio,
        });
      }
      setShowForm(false);
      await cargar();
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar el empleado");
    }
  }


  async function handleDelete(emp) {
    if (!window.confirm(`¿Desactivar a ${emp.nombre}?`)) return;
    await deletePersonal(emp.idPersonal);
    await cargar();
  }

  async function handleRestore(emp) {
    if (!window.confirm(`¿Reactivar a ${emp.nombre}?`)) return;
    await restorePersonal(emp.idPersonal);
    await cargar();
  }

 
  const filtered = empleados.filter((emp) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (emp.nombre || "").toLowerCase().includes(q) ||
      (emp.email || "").toLowerCase().includes(q) ||
      (emp.rolEnNegocio || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="gestion-usuarios-page">
      <div className="gestion-header">
        <div>
          <h1>Gestión de Empleados</h1>
          <p>Administra el personal que puede aceptar citas en tu negocio.</p>
        </div>
        <div className="gestion-actions">
          <input
            className="nb-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o rol"
          />
          <button className="nb-btn-primary" onClick={openNew}>
            <FaPlus size={12} style={{ marginRight: "6px" }} />
            Nuevo Empleado
          </button>
        </div>
      </div>

      <div className="gestion-card">
        <table className="gestion-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol en Negocio</th>
              <th>Estado</th>
              <th className="col-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr key="loading-row">
                <td colSpan="5" className="text-center">Cargando...</td>
              </tr>
            ) : filtered.length ? (
              filtered.map((emp) => (
                <tr key={emp.idPersonal}>
                  <td>{emp.nombre}</td>
                  <td>{emp.email}</td>
                  <td><span className="badge-role">{emp.rolEnNegocio}</span></td>
                  <td>
                    {emp.estado ? (
                      <span className="badge-success">Activo</span>
                    ) : (
                      <span className="badge-danger">Inactivo</span>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="nb-btn-small" onClick={() => openEdit(emp)}>Editar</button>
                      {emp.estado ? (
                        <button className="nb-btn-small danger" onClick={() => handleDelete(emp)}>Desactivar</button>
                      ) : (
                        <button className="nb-btn-small success" onClick={() => handleRestore(emp)}>Activar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr key="empty-row">
                <td colSpan="5" className="text-center">No se encontraron empleados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="nb-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="nb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="nb-modal-header">
              <h2>{editing ? "Editar Empleado" : "Nuevo Empleado"}</h2>
              <button className="nb-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form className="nb-modal-body" onSubmit={handleSubmit}>
              <label>
                Nombre
                <input
                  value={formData.nombre}
                  onChange={(e) => setFormData((f) => ({ ...f, nombre: e.target.value }))}
                  required
                />
              </label>

              <label>
                Correo
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                  required
                
                />
              </label>

              {!editing && (
                <label>
                  Contraseña (temporal)
                  <input
                    type="password"
                    value={formData.contrasena}
                    onChange={(e) => setFormData((f) => ({ ...f, contrasena: e.target.value }))}
                    placeholder="mín. 6 caracteres"
                    required
                  />
                </label>
              )}

              <label>
                Rol en Negocio
                <input
                  value={formData.rolEnNegocio}
                  onChange={(e) => setFormData((f) => ({ ...f, rolEnNegocio: e.target.value }))}
                  placeholder="Ej: Estilista, Barbero"
                  required
                />
              </label>

              <div className="nb-modal-footer">
                <button type="button" className="nb-btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="nb-btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}