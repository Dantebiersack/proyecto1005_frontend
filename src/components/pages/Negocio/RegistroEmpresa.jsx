import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import NavbarInicio from "../../Navbar/NavbarInicio";
import { uploadImage } from "../../../services/storageService";
import { FaCalendarAlt, FaClock } from "react-icons/fa"; 
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
    // Usuario
    nombreUsuario: "",
    email: "",
    contrasena: "",
    
    // Negocio
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

  // Estados del Horario
  const [horario, setHorario] = useState(HORARIO_INICIAL);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Estados generales
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Cargar categorías
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        setLoadingCategorias(true);
        const response = await api.get("/Categorias");
        setCategorias(response.data);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
        setError("Error al cargar categorías. Intente recargar.");
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

  // Manejo del horario
  const handleHorarioChange = (index, field, value) => {
    const nuevoHorario = [...horario];
    nuevoHorario[index][field] = value;
    setHorario(nuevoHorario);
  };

  // Manejo de imagen
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { publicUrl } = await uploadImage(file, "negocios");
      setFormData((prev) => ({ ...prev, linkUrl: publicUrl }));
    } catch (err) {
      console.error(err);
      setError("No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.idCategoria) { setError("Seleccione una categoría."); setLoading(false); return; }
    if (formData.contrasena.length < 6) { setError("Contraseña muy corta."); setLoading(false); return; }

    // Serializamos el horario a JSON String para la base de datos
    const horarioString = JSON.stringify(horario);

    try {
      // 1. Crear Usuario
      const resUser = await api.post("/Usuarios", {
        Nombre: formData.nombreUsuario,
        Email: formData.email,
        ContrasenaHash: formData.contrasena,
        IdRol: 2, // Admin de Negocio
        Token: null,
      });
      const idUser = resUser.data.IdUsuario;

      // 2. Crear Negocio
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
      const idNegocio = resNegocio.data.IdNegocio;

      // 3. Vincular (Personal)
      await api.post("/Personal", {
        IdUsuario: idUser,
        IdNegocio: idNegocio,
        RolEnNegocio: "Administrador",
      });

      setLoading(false);
      alert("¡Negocio registrado exitosamente!");
      navigate("/");

    } catch (err) {
      console.error(err);
      setError("Error: " + (err.response?.data?.message || err.message));
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
          <p>Datos del administrador y del establecimiento.</p>

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
                <label>Dirección</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} />
              </div>
              <div className="form-group span-2">
                <label>Descripción</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} />
              </div>

              {/* BOTÓN DE HORARIO */}
              <div className="form-group span-2">
                <label style={{marginBottom: '5px', display:'block'}}>Horario de Atención</label>
                
                <button 
                  type="button" 
                  className="btn-config-horario"
                  onClick={() => setShowScheduleModal(true)}
                >
                  <FaCalendarAlt /> Configurar Días y Horas
                </button>

                <div className="horario-resumen">
                  <strong>Estado actual:</strong>
                  {activeDays === 0 
                    ? "No se han configurado días de atención (Cerrado)." 
                    : `${activeDays} días activos configurados.`
                  }
                </div>
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
                
                {formData.linkUrl && (
                  <div style={{ marginTop: "10px", textAlign: "center" }}>
                    <img
                      src={formData.linkUrl}
                      alt="Vista previa"
                      style={{ width: "100%", maxWidth: "200px", borderRadius: "8px" }}
                    />
                  </div>
                )}
              </div>
            </fieldset>

            {error && <p className="register-error">{error}</p>}

            <button type="submit" className="btn-submit-registro" disabled={loading || uploading}>
              {loading ? "Registrando..." : "Registrar mi Negocio"}
            </button>
          </form>
        </div>
      </div>

      {/* MODAL DE HORARIO */}
      {showScheduleModal && (
        <div className="modal-horario-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-horario-content" onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-horario-header">
              <h3>Configurar Horario</h3>
              <button className="btn-close-modal" onClick={() => setShowScheduleModal(false)}>✕</button>
            </div>
            
            <p style={{fontSize: '0.9rem', color:'#666', marginBottom:'15px'}}>
              Marca los días que abres y define la hora de apertura y cierre.
            </p>

            <div className="horario-grid">
              {horario.map((dia, idx) => (
                <div key={dia.dia} className={`horario-row ${dia.activo ? 'activo' : ''}`}>
                  <div className="horario-check">
                    <input 
                      type="checkbox" 
                      checked={dia.activo} 
                      onChange={(e) => handleHorarioChange(idx, 'activo', e.target.checked)}
                    />
                    <span style={{color:'#0a3d62', fontWeight:'bold', marginLeft:'8px'}}>{dia.dia}</span>
                  </div>
                  
                  <div className="horario-horas">
                    <FaClock size={12} color="#999" style={{marginRight:'5px'}}/>
                    <input 
                      type="time" 
                      value={dia.inicio} 
                      disabled={!dia.activo}
                      onChange={(e) => handleHorarioChange(idx, 'inicio', e.target.value)}
                    />
                    <span style={{margin:'0 5px'}}>-</span>
                    <input 
                      type="time" 
                      value={dia.fin} 
                      disabled={!dia.activo}
                      onChange={(e) => handleHorarioChange(idx, 'fin', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="button" 
              className="btn-save-horario"
              onClick={() => setShowScheduleModal(false)}
            >
              Confirmar Horario
            </button>

          </div>
        </div>
      )}

    </div>
  );
}