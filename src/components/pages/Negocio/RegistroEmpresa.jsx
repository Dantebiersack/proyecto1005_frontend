import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api'; 
import NavbarInicio from '../../Navbar/NavbarInicio'; 
import './RegistroEmpresa.css'; 

export default function RegistroEmpresa() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Usuario
    nombreUsuario: '',
    email: '',
    contrasena: '',
    
    // Negocio
    nombreNegocio: '',
    idCategoria: '', 
    direccion: '',
    descripcion: '',
    telefonoContacto: '',
    correoContacto: '',
    horarioAtencion: '',
    linkUrl: '',
    coordenadasLat: 21.1165,
    coordenadasLng: -101.6696,
    idMembresia: null
  });
  
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar categorías
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        setLoadingCategorias(true);
        const response = await api.get('/Categorias'); 
        setCategorias(response.data);
        setLoadingCategorias(false);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
        setError("Error al cargar categorías. Intente recargar.");
        setLoadingCategorias(false);
      }
    };
    cargarCategorias();
  }, []); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Lógica de envío 
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
      //  Crear el Usuario (Dueño)
      const usuarioDto = {
        nombre: formData.nombreUsuario,
        email: formData.email,
        contrasenaHash: formData.contrasena, 
        idRol: 3, 
        token: null
      };
      const responseUsuario = await api.post('/Usuarios', usuarioDto);
      const idUsuarioCreado = responseUsuario.data.IdUsuario;

      // Crear el Negocio 
      const negocioDto = {
        idCategoria: parseInt(formData.idCategoria),
        idMembresia: formData.idMembresia,
        nombre: formData.nombreNegocio,
        direccion: formData.direccion,
        coordenadasLat: parseFloat(formData.coordenadasLat),
        coordenadasLng: parseFloat(formData.coordenadasLng),
        descripcion: formData.descripcion,
        telefonoContacto: formData.telefonoContacto,
        correoContacto: formData.correoContacto,
        horarioAtencion: formData.horarioAtencion,
        linkUrl: formData.linkUrl
      };
      const responseNegocio = await api.post('/Negocios', negocioDto);
      const idNegocioCreado = responseNegocio.data.IdNegocio; 

      if (!idUsuarioCreado || !idNegocioCreado) {
        console.error("Respuesta de API inesperada:", responseUsuario.data, responseNegocio.data);
        throw new Error("No se pudo obtener el ID del usuario o del negocio desde la API.");
      }

      // Vincular (POST /Personal) 
      const personalDto = {
        idUsuario: idUsuarioCreado,
        idNegocio: idNegocioCreado,
        rolEnNegocio: "Administrador" 
      };
      await api.post('/Personal', personalDto);

      
      setLoading(false);
      alert("¡Registro enviado exitosamente! Su solicitud será revisada por un administrador.");
      navigate('/'); 

    } catch (err) {
      console.error(err);
      setError("Error en el registro. " + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  // Formulario
  return (
    <div className="register-page">
      <NavbarInicio />
      <div className="register-wrapper">
        <div className="register-card">
          <h1>Registra tu Negocio</h1>
          <p>Crea tu cuenta de administrador y registra tu negocio al mismo tiempo.</p>
          
          <form onSubmit={handleSubmit} className="register-form">
            
            {/* SECCIÓN DE USUARIO*/}
            <fieldset>
              <legend>Datos del Administrador</legend>
              <div className="form-group">
                <label htmlFor="nombreUsuario">Tu Nombre Completo</label>
                <input
                  type="text" id="nombreUsuario" name="nombreUsuario"
                  value={formData.nombreUsuario} onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Tu Email (Para iniciar sesión)</label>
                <input
                  type="email" id="email" name="email"
                  value={formData.email} onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-group span-2">
                <label htmlFor="contrasena">Tu Contraseña (mín. 6 caracteres)</label>
                <input
                  type="password" id="contrasena" name="contrasena"
                  value={formData.contrasena} onChange={handleChange}
                  required 
                />
              </div>
            </fieldset>

            {/* SECCIÓN DE NEGOCIO*/}
            <fieldset>
              <legend>Datos del Negocio</legend>
              <div className="form-group span-2">
                <label htmlFor="nombreNegocio">Nombre del Negocio</label>
                <input
                  type="text" id="nombreNegocio" name="nombreNegocio"
                  placeholder="El nombre de tu negocio"
                  value={formData.nombreNegocio} onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="idCategoria">Categoría del Negocio</label>
                {loadingCategorias ? <p>Cargando categorías...</p> : (
                  <select
                    id="idCategoria" name="idCategoria"
                    value={formData.idCategoria} onChange={handleChange}
                    required 
                  >
                    <option value="">-- Seleccione una categoría --</option>
                    {categorias.map((cat) => (
                      <option key={cat.IdCategoria} value={cat.IdCategoria}>
                        {cat.NombreCategoria}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="telefonoContacto">Teléfono de Contacto</label>
                <input
                  type="tel" id="telefonoContacto" name="telefonoContacto"
                  placeholder="Coloca tu numero para contactarte"
                  value={formData.telefonoContacto} onChange={handleChange}
                />
              </div>
              <div className="form-group span-2">
                <label htmlFor="direccion">Dirección</label>
                <input
                  type="text" id="direccion" name="direccion"
                  placeholder="Coloca la direccion del establecimiento"
                  value={formData.direccion} onChange={handleChange}
                />
              </div>
              <div className="form-group span-2">
                <label htmlFor="descripcion">Descripción breve</label>
                <textarea
                  id="descripcion" name="descripcion"
                  placeholder="Coloca una descripcion"
                  value={formData.descripcion} onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="correoContacto">Email de Contacto</label>
                <input
                  type="email" id="correoContacto" name="correoContacto"
                  placeholder="Contacto email"
                  value={formData.correoContacto} onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="horarioAtencion">Horario de Atención</label>
                <input
                  type="text" id="horarioAtencion" name="horarioAtencion"
                  placeholder="Ej: L-S 10:00 a 19:00"
                  value={formData.horarioAtencion} onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="coordenadasLat">Latitud (Opcional)</label>
                <input
                  type="number"
                  id="coordenadasLat"
                  name="coordenadasLat"
                  value={formData.coordenadasLat}
                  onChange={handleChange}
                  step="any" 
                  placeholder="Ej: 21.1165"
                />
              </div>
              <div className="form-group">
                <label htmlFor="coordenadasLng">Longitud (Opcional)</label>
                <input
                  type="number"
                  id="coordenadasLng"
                  name="coordenadasLng"
                  value={formData.coordenadasLng}
                  onChange={handleChange}
                  step="any"
                  placeholder="Ej: -101.6696"
                />
              </div>
              
              <div className="form-group span-2">
                <label htmlFor="linkUrl">Imagen</label>
                {}
                <input
                  type="text" 
                  id="linkUrl" 
                  name="linkUrl"
                  placeholder=""
                  value={formData.linkUrl} 
                  onChange={handleChange}
                />
              </div>
            </fieldset>

            {error && <p className="register-error">{error}</p>}

            <button 
              type="submit" 
              className="btn-submit-registro"
              disabled={loading || loadingCategorias} 
            >
              {loading ? 'Enviando Registro...' : 'Enviar Registro para Validación'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}