import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
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
import Swal from "sweetalert2"; 

const FORM_INICIAL = {
  nombre: "",
  email: "",
  contrasena: "", 
  rolEnNegocio: "",
};

export default function GestionEmpleados() {
  const { user } = useAuth(); 
  const navigate = useNavigate(); 

  const [empleados, setEmpleados] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); 
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); 
  const [formData, setFormData] = useState(FORM_INICIAL);

  const isLoggedAsEmployee = user?.roles?.includes("personal");


  useEffect(() => {
   
    if (!user?.idNegocio) {
      setLoading(false);
     
      Swal.fire({
        title: "Acceso Restringido",
        text: "Tu usuario no tiene un negocio asignado. Por favor contacta a soporte o regístrate como dueño.",
        icon: "warning",
        confirmButtonColor: "#0a3d62",
        confirmButtonText: "Entendido"
      });
      return; 
    }

   
    cargar();
  }, [user]); 

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
        idRol: emp.IdRol || 3,
        token: null, 
      }));

      setEmpleados(normalizados);
    } catch (err) {
      console.error("Error cargando empleados", err);
      Swal.fire("Error", "No se pudo cargar la lista de empleados", "error");
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
    
    if (!formData.nombre || !formData.email || !formData.rolEnNegocio) {
      return Swal.fire("Campos vacíos", "Por favor completa toda la información.", "warning");
    }
    if (!editing && (!formData.contrasena || formData.contrasena.length < 6)) {
      return Swal.fire("Contraseña débil", "La contraseña debe tener al menos 6 caracteres.", "warning");
    }

    setSubmitting(true); 

    try {
      if (editing) {
        await updateUsuario(editing.idUsuario, {
          Nombre: formData.nombre,
          Email: formData.email, 
          IdRol: editing.idRol, 
        });
        await updatePersonal(editing.idPersonal, {
          IdUsuario: editing.idUsuario, 
          RolEnNegocio: formData.rolEnNegocio,
        });
        
        Swal.fire("Actualizado", "Datos actualizados correctamente.", "success");

      } else {
        const nuevoUsuario = await createUsuario({
          Nombre: formData.nombre,
          Email: formData.email,
          ContrasenaHash: formData.contrasena, 
          IdRol: 3, 
          Token: null,
        });
        
        await createPersonal({
          IdUsuario: nuevoUsuario.IdUsuario, 
          RolEnNegocio: formData.rolEnNegocio,
        });

        Swal.fire("Creado", "El nuevo empleado ha sido registrado.", "success");
      }
      
      setShowForm(false);
      await cargar();

    } catch (err) {
      console.error(err);
      const errorDetail = err.response?.data?.detail || err.message;
      if (errorDetail.includes("IX_Usuarios_email") || errorDetail.includes("unique constraint")) {
        Swal.fire("Correo Duplicado", "Este correo ya está registrado.", "error");
      } else {
        Swal.fire("Error", "No se pudo guardar. " + errorDetail, "error");
      }
    } finally {
      setSubmitting(false); 
    }
  }

  async function handleDelete(emp) {
    const result = await Swal.fire({
      title: `¿Desactivar a ${emp.nombre}?`,
      text: "El empleado perderá acceso al sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, desactivar"
    });

    if (result.isConfirmed) {
      try {
        setSubmitting(true);
        await deletePersonal(emp.idPersonal);
        await cargar();
        Swal.fire("Desactivado", "Empleado desactivado.", "success");
      } catch (err) {
        Swal.fire("Error", "No se pudo desactivar.", "error");
      } finally {
        setSubmitting(false);
      }
    }
  }

  async function handleRestore(emp) {
    const result = await Swal.fire({
      title: `¿Reactivar a ${emp.nombre}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, activar"
    });

    if (result.isConfirmed) {
      try {
        setSubmitting(true);
        await restorePersonal(emp.idPersonal);
        await cargar();
        Swal.fire("Activado", "Empleado activo nuevamente.", "success");
      } catch (err) {
        Swal.fire("Error", "No se pudo activar.", "error");
      } finally {
        setSubmitting(false);
      }
    }
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

  const isEditingAdmin = editing && (editing.rolEnNegocio === "Administrador" || editing.rolEnNegocio === "Dueño");

  
  if (!user?.idNegocio) {
    return (
      <div className="gestion-usuarios-page">
        <div className="gestion-header">
          <h1>Acceso Restringido</h1>
          <p style={{color: '#d32f2f'}}>
            No se detectó un negocio asociado a tu cuenta. <br/>
            Por favor, asegúrate de haber registrado tu empresa correctamente.
          </p>
        </div>
      </div>
    );
  }

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
            placeholder="Buscar..."
          />
          {!isLoggedAsEmployee && (
            <button className="nb-btn-primary" onClick={openNew}>
              <FaPlus size={12} style={{ marginRight: "6px" }} />
              Nuevo Empleado
            </button>
          )}
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
              <tr key="loading-row"><td colSpan="5" className="text-center">Cargando...</td></tr>
            ) : filtered.length ? (
              filtered.map((emp) => {
                const esAdminDeNegocio = emp.rolEnNegocio === "Administrador" || emp.rolEnNegocio === "Dueño";
                const puedeEditar = !isLoggedAsEmployee || !esAdminDeNegocio;

                return (
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
                        {puedeEditar && (
                          <button 
                            className="nb-btn-small" 
                            onClick={() => openEdit(emp)}
                            disabled={submitting}
                          >
                            Editar
                          </button>
                        )}

                        {!esAdminDeNegocio && (
                          <>
                            {emp.estado ? (
                              <button 
                                className="nb-btn-small danger" 
                                onClick={() => handleDelete(emp)}
                                disabled={submitting}
                              >
                                Desactivar
                              </button>
                            ) : (
                              <button 
                                className="nb-btn-small success" 
                                onClick={() => handleRestore(emp)}
                                disabled={submitting}
                              >
                                Activar
                              </button>
                            )}
                          </>
                        )}
                        
                        {esAdminDeNegocio && (
                          <span style={{fontSize:'0.8rem', color:'#aaa', fontStyle:'italic', padding:'5px'}}>
                            (Propietario)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr key="empty-row"><td colSpan="5" className="text-center">No se encontraron empleados.</td></tr>
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
              <label>Nombre
                <input value={formData.nombre} onChange={(e) => setFormData((f) => ({ ...f, nombre: e.target.value }))} required />
              </label>
              
              <label>Correo
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))} 
                  required 
                />
              </label>
              
              {!editing && (
                <label>Contraseña (temporal)
                  <input 
                    type="password" 
                    value={formData.contrasena} 
                    onChange={(e) => setFormData((f) => ({ ...f, contrasena: e.target.value }))} 
                    placeholder="mín. 6 caracteres" 
                    required={!editing} 
                  />
                </label>
              )}
              
              <label>Rol en Negocio
                <input 
                  value={formData.rolEnNegocio} 
                  onChange={(e) => setFormData((f) => ({ ...f, rolEnNegocio: e.target.value }))} 
                  placeholder="Ej: Estilista, Barbero" 
                  required 
                  disabled={isEditingAdmin}
                  style={isEditingAdmin ? {backgroundColor: "#f0f0f0", color: "#888"} : {}}
                  title={isEditingAdmin ? "El rol de administrador no se puede cambiar aquí" : ""}
                />
              </label>
              
              <div className="nb-modal-footer">
                <button type="button" className="nb-btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="nb-btn-primary" disabled={submitting}>
                  {submitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}