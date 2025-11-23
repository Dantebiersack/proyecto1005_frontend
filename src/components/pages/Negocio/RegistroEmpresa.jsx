import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { deleteUsuario } from "../../../services/usersService"; 
import NavbarInicio from "../../Navbar/NavbarInicio";
import { uploadImage } from "../../../services/storageService";
import { FaCalendarAlt, FaClock } from "react-icons/fa"; 
import Swal from "sweetalert2"; 
import "./RegistroEmpresa.css";

const DIAS_SEMANA = [
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
];

const HORARIO_INICIAL = DIAS_SEMANA.map(dia => ({
  dia: dia,
  activo: false, 
  inicio: "09:00",
  fin: "18:00"
}));

export default function RegistroEmpresa() {
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    nombreUsuario: "",
    email: "",
    contrasena: "",
    nombreNegocio: "",
    idCategoria: "",
    direccion: "",
    descripcion: "",
    telefonoContacto: "",
    correoContacto: "",
    linkUrl: "",
    coordenadasLat: 21.1165,
    coordenadasLng: -101.6696,
    idMembresia: null,
  });

  const [horario, setHorario] = useState(HORARIO_INICIAL);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loading, setLoading] = useState(false); 
  const [uploading, setUploading] = useState(false);


  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        setLoadingCategorias(true);
        const response = await api.get("/Categorias");
        setCategorias(response.data);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudieron cargar las categorías", "error");
      } finally {
        setLoadingCategorias(false);
      }
    };
    cargarCategorias();
  }, []);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHorarioChange = (index, field, value) => {
    const nuevoHorario = [...horario];
    nuevoHorario[index][field] = value;
    setHorario(nuevoHorario);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { publicUrl } = await uploadImage(file, "negocios");
      setFormData((prev) => ({ ...prev, linkUrl: publicUrl }));
    } catch (err) {
      Swal.fire("Error", "No se pudo subir la imagen", "error");
    } finally {
      setUploading(false);
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    if (loading) return;

   
    if (!formData.idCategoria) {
      return Swal.fire("Falta información", "Selecciona una categoría.", "warning");
    }
    if (formData.contrasena.length < 6) {
      return Swal.fire("Contraseña débil", "Mínimo 6 caracteres.", "warning");
    }

    setLoading(true);
    let idUsuarioCreado = null; 

    try {
      const horarioString = JSON.stringify(horario);

    
      const resUser = await api.post("/Usuarios", {
        Nombre: formData.nombreUsuario,
        Email: formData.email,
        ContrasenaHash: formData.contrasena,
        IdRol: 2,
        Token: null,
      });
      idUsuarioCreado = resUser.data.IdUsuario;

    
      const resNegocio = await api.post("/Negocios", {
        IdCategoria: parseInt(formData.idCategoria),
        IdMembresia: formData.idMembresia,
        Nombre: formData.nombreNegocio,
        Direccion: formData.direccion,
        CoordenadasLat: parseFloat(formData.coordenadasLat),
        CoordenadasLng: parseFloat(formData.coordenadasLng),
        Descripcion: formData.descripcion,
        TelefonoContacto: formData.telefonoContacto,
        CorreoContacto: formData.correoContacto,
        HorarioAtencion: horarioString,
        LinkUrl: formData.linkUrl,
      });
      const idNegocioCreado = resNegocio.data.IdNegocio;

     
      await api.post("/Personal", {
        IdUsuario: idUsuarioCreado,
        IdNegocio: idNegocioCreado,
        RolEnNegocio: "Administrador",
      });

      
      Swal.fire({
        title: "¡Bienvenido a NearBiz!",
        text: "Tu negocio ha sido registrado exitosamente.",
        icon: "success",
        confirmButtonColor: "#0a3d62",
        confirmButtonText: "Iniciar Sesión"
      }).then(() => {
        navigate("/login");
      });

    } catch (err) {
      console.error("Error en registro:", err);
      
      
      const errorDetail = err.response?.data?.detail || err.message;

     
      if (errorDetail && (errorDetail.includes("IX_Usuarios_email") || errorDetail.includes("unique constraint"))) {
        Swal.fire("Correo Registrado", "Este correo electrónico ya está en uso. Intenta con otro o inicia sesión.", "error");
      } 
     
      else {
        Swal.fire("Error", "Hubo un problema al registrar. Por favor intenta de nuevo.", "error");
        
       
        if (idUsuarioCreado) {
          console.warn(`Rollback: Eliminando usuario incompleto ID ${idUsuarioCreado}...`);
          try {
            await deleteUsuario(idUsuarioCreado);
          } catch (rollbackErr) {
            console.error("Fallo crítico en rollback:", rollbackErr);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const activeDays = horario.filter(d => d.activo).length;

  return (
    <div className="register-page">
      <NavbarInicio />
      <div className="register-wrapper">
        <div className="register-card">
          <h1>Registra tu Negocio</h1>
          <p>Crea tu cuenta de administrador y registra tu negocio.</p>

          <form onSubmit={handleSubmit} className="register-form">
            
            <fieldset>
              <legend>Datos del Dueño</legend>
              <div className="form-group">
                <label>Nombre Completo</label>
                <input type="text" name="nombreUsuario" value={formData.nombreUsuario} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group span-2">
                <label>Contraseña</label>
                <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required />
              </div>
            </fieldset>

            <fieldset>
              <legend>Datos del Negocio</legend>
              <div className="form-group span-2">
                <label>Nombre del Negocio</label>
                <input type="text" name="nombreNegocio" value={formData.nombreNegocio} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select name="idCategoria" value={formData.idCategoria} onChange={handleChange} required>
                  <option value="">-- Selecciona --</option>
                  {categorias.map((cat) => (
                    <option key={cat.IdCategoria} value={cat.IdCategoria}>{cat.NombreCategoria}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input type="tel" name="telefonoContacto" value={formData.telefonoContacto} onChange={handleChange} />
              </div>
              
             
              <div className="form-group span-2">
                <label style={{marginBottom: '5px', display:'block'}}>Horario de Atención</label>
                <button type="button" className="btn-config-horario" onClick={() => setShowScheduleModal(true)}>
                  <FaCalendarAlt /> Configurar Días y Horas
                </button>
                <div className="horario-resumen">
                  {activeDays === 0 ? "Cerrado (Sin configurar)." : `${activeDays} días activos.`}
                </div>
              </div>

           
              <div className="form-group span-2">
                <label>Dirección</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} />
              </div>
              <div className="form-group span-2">
                <label>Descripción</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Email Contacto</label>
                <input type="email" name="correoContacto" value={formData.correoContacto} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Latitud</label>
                <input type="number" name="coordenadasLat" value={formData.coordenadasLat} onChange={handleChange} step="any" />
              </div>
              <div className="form-group">
                <label>Longitud</label>
                <input type="number" name="coordenadasLng" value={formData.coordenadasLng} onChange={handleChange} step="any" />
              </div>
              <div className="form-group span-2">
                <label>Imagen del Negocio</label>
                <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                {uploading && <small>Subiendo...</small>}
              </div>
            </fieldset>

            <button 
              type="submit" 
              className="btn-submit-registro" 
             
              disabled={loading || uploading || loadingCategorias}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Procesando..." : "Registrar mi Negocio"}
            </button>
          </form>
        </div>
      </div>

      
      {showScheduleModal && (
        <div className="modal-horario-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-horario-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-horario-header">
              <h3>Configurar Horario</h3>
              <button className="btn-close-modal" onClick={() => setShowScheduleModal(false)}>✕</button>
            </div>
            <div className="horario-grid">
              {horario.map((dia, idx) => (
                <div key={dia.dia} className={`horario-row ${dia.activo ? 'activo' : ''}`}>
                  <div className="horario-check">
                    <input type="checkbox" checked={dia.activo} onChange={(e) => handleHorarioChange(idx, 'activo', e.target.checked)} />
                    <span style={{color:'#0a3d62', fontWeight:'bold', marginLeft:'8px'}}>{dia.dia}</span>
                  </div>
                  <div className="horario-horas">
                    <FaClock size={12} color="#999" style={{marginRight:'5px'}}/>
                    <input type="time" value={dia.inicio} disabled={!dia.activo} onChange={(e) => handleHorarioChange(idx, 'inicio', e.target.value)} />
                    <span>-</span>
                    <input type="time" value={dia.fin} disabled={!dia.activo} onChange={(e) => handleHorarioChange(idx, 'fin', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="btn-save-horario" onClick={() => setShowScheduleModal(false)}>Confirmar Horario</button>
          </div>
        </div>
      )}
    </div>
  );
}