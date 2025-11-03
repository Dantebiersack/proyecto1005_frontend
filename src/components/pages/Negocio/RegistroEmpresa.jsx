import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import NavbarInicio from "../../Navbar/NavbarInicio";
import { uploadImage } from "../../../services/storageService"; // 👈 IMPORTANTE
import "./RegistroEmpresa.css";

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
    horarioAtencion: "",
    linkUrl: "", // aquí guardaremos la URL pública de Supabase
    coordenadasLat: 21.1165,
    coordenadasLng: -101.6696,
    idMembresia: null,
  });

  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // 👈 para mostrar "subiendo..."

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 👇 NUEVO: cuando seleccionan archivo
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      // subimos a supabase, carpeta "negocios"
      const { publicUrl } = await uploadImage(file, "negocios");

      // guardamos la URL en el form
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
      // 1) Crear el Usuario (Dueño)
      const usuarioDto = {
        nombre: formData.nombreUsuario,
        email: formData.email,
        contrasenaHash: formData.contrasena, // ya luego la hasheas en back
        idRol: 3, // admin de negocio
        token: null,
      };
      const responseUsuario = await api.post("/Usuarios", usuarioDto);
      const idUsuarioCreado = responseUsuario.data.IdUsuario;

      // 2) Crear el Negocio
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
        linkUrl: formData.linkUrl, // 👈 ya viene de supabase
      };
      const responseNegocio = await api.post("/Negocios", negocioDto);
      const idNegocioCreado = responseNegocio.data.IdNegocio;

      if (!idUsuarioCreado || !idNegocioCreado) {
        console.error(
          "Respuesta de API inesperada:",
          responseUsuario.data,
          responseNegocio.data
        );
        throw new Error(
          "No se pudo obtener el ID del usuario o del negocio desde la API."
        );
      }

      // 3) Vincular (POST /Personal)
      const personalDto = {
        idUsuario: idUsuarioCreado,
        idNegocio: idNegocioCreado,
        rolEnNegocio: "Administrador",
      };
      await api.post("/Personal", personalDto);

      setLoading(false);
      alert(
        "¡Registro enviado exitosamente! Su solicitud será revisada por un administrador."
      );
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(
        "Error en el registro. " + (err.response?.data?.error || err.message)
      );
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <NavbarInicio />
      <div className="register-wrapper">
        <div className="register-card">
          <h1>Registra tu Negocio</h1>
          <p>
            Crea tu cuenta de administrador y registra tu negocio al mismo
            tiempo.
          </p>

          <form onSubmit={handleSubmit} className="register-form">
            {/* SECCIÓN DE USUARIO*/}
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
                <label htmlFor="contrasena">
                  Tu Contraseña (mín. 6 caracteres)
                </label>
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

            {/* SECCIÓN DE NEGOCIO*/}
            <fieldset>
              <legend>Datos del Negocio</legend>
              <div className="form-group span-2">
                <label htmlFor="nombreNegocio">Nombre del Negocio</label>
                <input
                  type="text"
                  id="nombreNegocio"
                  name="nombreNegocio"
                  placeholder="El nombre de tu negocio"
                  value={formData.nombreNegocio}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="idCategoria">Categoría del Negocio</label>
                {loadingCategorias ? (
                  <p>Cargando categorías...</p>
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
                  type="tel"
                  id="telefonoContacto"
                  name="telefonoContacto"
                  placeholder="Coloca tu numero para contactarte"
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
                  placeholder="Coloca la direccion del establecimiento"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group span-2">
                <label htmlFor="descripcion">Descripción breve</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  placeholder="Coloca una descripcion"
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
                  placeholder="Contacto email"
                  value={formData.correoContacto}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="horarioAtencion">Horario de Atención</label>
                <input
                  type="text"
                  id="horarioAtencion"
                  name="horarioAtencion"
                  placeholder="Ej: L-S 10:00 a 19:00"
                  value={formData.horarioAtencion}
                  onChange={handleChange}
                />
              </div>

              {/* coordenadas */}
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

              {/* 👇 AQUÍ ADAPTAMOS EL linkUrl */}
              <div className="form-group span-2">
                <label htmlFor="linkUrl">
                  Imagen (logo / foto del negocio)
                </label>

                {/* input de archivo */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                />

                {/* input de texto por si quieres pegar una URL ya hosteada */}
                <input
                  type="text"
                  id="linkUrl"
                  name="linkUrl"
                  placeholder="O pega aquí una URL ya pública"
                  value={formData.linkUrl}
                  onChange={handleChange}
                  style={{ marginTop: "6px" }}
                />

                {uploading && (
                  <small style={{ color: "#3843c2" }}>
                    Subiendo imagen a Supabase...
                  </small>
                )}

                {formData.linkUrl ? (
                  <div style={{ marginTop: "8px" }}>
                    <img
                      src={formData.linkUrl}
                      alt="preview negocio"
                      style={{
                        width: "140px",
                        height: "140px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </fieldset>

            {error && <p className="register-error">{error}</p>}

            <button
              type="submit"
              className="btn-submit-registro"
              disabled={loading || loadingCategorias || uploading}
            >
              {loading ? "Enviando Registro..." : "Enviar Registro para Validación"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
