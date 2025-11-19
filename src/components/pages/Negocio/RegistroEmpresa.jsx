import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import NavbarInicio from "../../Navbar/NavbarInicio";
import { uploadImage } from "../../../services/storageService"; 
import "./RegistroEmpresa.css";

export default function RegistroEmpresa() {
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    // Usuario
    nombreUsuario: "",
    email: "",
    contrasena: "",

  
    nombreNegocio: "",
    idCategoria: "",
    direccion: "",
    descripcion: "",
    telefonoContacto: "",
    correoContacto: "",
    horarioAtencion: "",
    linkUrl: "", 
    coordenadasLat: 21.1165,
    coordenadasLng: -101.6696,
    idMembresia: null,
  });

  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);


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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

 
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const { publicUrl } = await uploadImage(file, "negocios");
      setFormData((prev) => ({
        ...prev,
        linkUrl: publicUrl,
      }));
    } catch (err) {
      console.error(err);
      setError("No se pudo subir la imagen. Intenta otra vez.");
    } finally {
      setUploading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.idCategoria) {
      setError("Por favor, seleccione una categoría para su negocio.");
      setLoading(false);
      return;
    }
    if (formData.contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
  
      const usuarioDto = {
        Nombre: formData.nombreUsuario,          
        Email: formData.email,               
        ContrasenaHash: formData.contrasena,    
        IdRol: 2, 
        Token: null,
      };
      
      const responseUsuario = await api.post("/Usuarios", usuarioDto);
      const idUsuarioCreado = responseUsuario.data.IdUsuario;

     
      const negocioDto = {
        IdCategoria: parseInt(formData.idCategoria),
        IdMembresia: formData.idMembresia,
        Nombre: formData.nombreNegocio,
        Direccion: formData.direccion,
        CoordenadasLat: parseFloat(formData.coordenadasLat),
        CoordenadasLng: parseFloat(formData.coordenadasLng),
        Descripcion: formData.descripcion,
        TelefonoContacto: formData.telefonoContacto,
        CorreoContacto: formData.correoContacto,
        HorarioAtencion: formData.horarioAtencion,
        LinkUrl: formData.linkUrl,
      };
      
      const responseNegocio = await api.post("/Negocios", negocioDto);
      const idNegocioCreado = responseNegocio.data.IdNegocio;

      if (!idUsuarioCreado || !idNegocioCreado) {
        throw new Error("Error: No se obtuvieron los IDs del servidor.");
      }

    
      const personalDto = {
        IdUsuario: idUsuarioCreado,
        IdNegocio: idNegocioCreado,
        RolEnNegocio: "Administrador",
      };
      
      await api.post("/Personal", personalDto);

     
      setLoading(false);
      alert("¡Registro enviado exitosamente! Su solicitud será revisada.");
      navigate("/"); 

    } catch (err) {
      console.error(err);
      setError("Error en el registro. " + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <NavbarInicio />
      <div className="register-wrapper">
        <div className="register-card">
          <h1>Registra tu Negocio</h1>
          <p>Crea tu cuenta de administrador y registra tu negocio al mismo tiempo.</p>

          <form onSubmit={handleSubmit} className="register-form">
            
            {/* --- USUARIO --- */}
            <fieldset>
              <legend>Datos del Administrador</legend>
              <div className="form-group">
                <label htmlFor="nombreUsuario">Tu Nombre Completo</label>
                <input
                  type="text"
                  id="nombreUsuario"
                  name="nombreUsuario"
                  value={formData.nombreUsuario}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Tu Email (Para iniciar sesión)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group span-2">
                <label htmlFor="contrasena">Tu Contraseña (mín. 6 caracteres)</label>
                <input
                  type="password"
                  id="contrasena"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  required
                />
              </div>
            </fieldset>

            {/* --- NEGOCIO --- */}
            <fieldset>
              <legend>Datos del Negocio</legend>
              <div className="form-group span-2">
                <label htmlFor="nombreNegocio">Nombre del Negocio</label>
                <input
                  type="text"
                  id="nombreNegocio"
                  name="nombreNegocio"
                  placeholder="Ej: Barbería El Rey"
                  value={formData.nombreNegocio}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="idCategoria">Categoría</label>
                {loadingCategorias ? (
                  <p style={{fontSize: "0.9rem", color: "#666"}}>Cargando categorías...</p>
                ) : (
                  <select
                    id="idCategoria"
                    name="idCategoria"
                    value={formData.idCategoria}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Seleccione una categoría --</option>
                    {categorias.map((cat) => (
                      // Usamos PascalCase porque así vienen de la API
                      <option key={cat.IdCategoria} value={cat.IdCategoria}>
                        {cat.NombreCategoria}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="telefonoContacto">Teléfono</label>
                <input
                  type="tel"
                  id="telefonoContacto"
                  name="telefonoContacto"
                  placeholder="Ej: 477 123 4567"
                  value={formData.telefonoContacto}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group span-2">
                <label htmlFor="direccion">Dirección</label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group span-2">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  placeholder="Describe tus servicios..."
                  value={formData.descripcion}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="correoContacto">Email de Contacto</label>
                <input
                  type="email"
                  id="correoContacto"
                  name="correoContacto"
                  value={formData.correoContacto}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="horarioAtencion">Horario</label>
                <input
                  type="text"
                  id="horarioAtencion"
                  name="horarioAtencion"
                  placeholder="Ej: L-S 10:00 a 19:00"
                  value={formData.horarioAtencion}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="coordenadasLat">Latitud</label>
                <input
                  type="number"
                  id="coordenadasLat"
                  name="coordenadasLat"
                  value={formData.coordenadasLat}
                  onChange={handleChange}
                  step="any"
                />
              </div>

              <div className="form-group">
                <label htmlFor="coordenadasLng">Longitud</label>
                <input
                  type="number"
                  id="coordenadasLng"
                  name="coordenadasLng"
                  value={formData.coordenadasLng}
                  onChange={handleChange}
                  step="any"
                />
              </div>

              <div className="form-group span-2">
                <label htmlFor="fileInput">Imagen del Negocio</label>
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  style={{ marginBottom: "8px" }}
                />
                {uploading && <small style={{ color: "#3843c2" }}>Subiendo imagen...</small>}
                
                <input
                  type="text"
                  id="linkUrl"
                  name="linkUrl"
                  placeholder="URL de la imagen"
                  value={formData.linkUrl}
                  onChange={handleChange}
                  readOnly
                  style={{ backgroundColor: "#f0f0f0", color: "#555" }}
                />

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

            <button
              type="submit"
              className="btn-submit-registro"
              disabled={loading || loadingCategorias || uploading}
            >
              {loading ? "Registrando..." : "Registrar mi Negocio"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}