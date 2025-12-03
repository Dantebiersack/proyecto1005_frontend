
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import NavbarInicio from "../../Navbar/NavbarInicio";
import { uploadImage } from "../../../services/storageService";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import Swal from "sweetalert2";
import "./RegistroEmpresa.css";


import { getMembresiasAdmin } from "../../../services/membershipsService";

import logoImg from "../../../assets/nearBizLogo.jpg";
import mapaBg from "../../../assets/fondo-mapa.png";

const DIAS_SEMANA = [
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo",
];

const HORARIO_INICIAL = DIAS_SEMANA.map((dia) => ({
  dia: dia,
  activo: false,
  inicio: "09:00",
  fin: "18:00",
}));


async function geocodeDireccion(direccion) {
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        direccion
      )}`
    );

    const data = await resp.json();
    if (data.length === 0) return null;

    return {
      lat: data[0].lat,
      lng: data[0].lon,
    };
  } catch (e) {
    console.error("Error geocodificando:", e);
    return null;
  }
}

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
    idMembresia: "",
  });

  const [horario, setHorario] = useState(HORARIO_INICIAL);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [membresias, setMembresias] = useState([]);

  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingMembresias, setLoadingMembresias] = useState(true);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

 
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const { data } = await api.get("/Categorias");
        setCategorias(data);
      } catch (error) {
        Swal.fire("Error", "No se pudieron cargar las categorías", "error");
      } finally {
        setLoadingCategorias(false);
      }
    };
    cargarCategorias();
  }, []);

 
  useEffect(() => {
    const cargarMembresias = async () => {
      try {
        const data = await getMembresiasAdmin({ includeInactive: false });
        setMembresias(data);
      } catch (error) {
        Swal.fire("Error", "No se pudieron cargar las membresías", "error");
      } finally {
        setLoadingMembresias(false);
      }
    };
    cargarMembresias();
  }, []);


  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));

   
    if (name === "direccion" && value.length > 5) {
      const geo = await geocodeDireccion(value);

      if (geo) {
        setFormData((prev) => ({
          ...prev,
          coordenadasLat: geo.lat,
          coordenadasLng: geo.lng,
        }));

        
        Swal.fire({
          title: "Ubicación detectada",
          text: "Las coordenadas fueron obtenidas automáticamente.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    }
  };

  const handleHorarioChange = (index, field, value) => {
    const nuevoHorario = [...horario];
    nuevoHorario[index][field] = value;
    setHorario(nuevoHorario);
  };

  const handleFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setUploading(true);
    try {
      const { publicUrl } = await uploadImage(f, "negocios");
      setFormData((prev) => ({ ...prev, linkUrl: publicUrl }));
    } catch (error) {
      Swal.fire("Error", "No se pudo subir la imagen", "error");
    } finally {
      setUploading(false);
    }
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.idCategoria)
      return Swal.fire("Falta información", "Selecciona una categoría.", "warning");

    if (!formData.idMembresia)
      return Swal.fire("Membresía requerida", "Selecciona una membresía.", "warning");

    if (formData.contrasena.length < 6)
      return Swal.fire("Contraseña débil", "Mínimo 6 caracteres.", "warning");

    setLoading(true);

    try {
      const payload = {
        idCategoria: Number(formData.idCategoria),
        idMembresia: Number(formData.idMembresia),
        Nombre: formData.nombreNegocio,
        direccion: formData.direccion,
        coordenadasLat: Number(formData.coordenadasLat),
        coordenadasLng: Number(formData.coordenadasLng),
        descripcion: formData.descripcion,
        telefonoContacto: formData.telefonoContacto,
        correoContacto: formData.correoContacto,
        horarioAtencion: horario,
        linkUrl: formData.linkUrl || null,
        nombreUsuario: formData.nombreUsuario,
        email: formData.email,
        contrasena: formData.contrasena,
      };

      await api.post("/Negocios", payload);

      Swal.fire({
        title: "Solicitud enviada",
        text: "Tu negocio está en revisión.",
        icon: "success",
        confirmButtonColor: "#0a3d62",
      }).then(() => navigate("/"));
    } catch (error) {
      const detail = error.response?.data?.detail || error.message;
      Swal.fire("Error", "No se pudo enviar la solicitud. " + detail, "error");
    } finally {
      setLoading(false);
    }
  };

  const activeDays = horario.filter((d) => d.activo).length;

  return (
    <div className="registro-layout">
      <NavbarInicio />

      <div className="split-screen-container">
        {/* IZQUIERDA */}
        <div
          className="split-left"
          style={{ backgroundImage: `url(${mapaBg})` }}
        >
          <div className="brand-card">
            <img src={logoImg} alt="NearBiz Logo" className="brand-logo" />
            <h1>NEARBIZ</h1>
            <p>Tu agenda, tus empresas cercanas.</p>
          </div>
        </div>

        {/* DERECHA */}
        <div className="split-right">
          <div className="register-content">
            <button onClick={() => navigate("/")} className="btn-back">
              ← Volver al inicio
            </button>

            <h2>Crea tu cuenta de Negocio</h2>
            <p>Ingresa tus datos para comenzar a administrar tus citas.</p>

            <form onSubmit={handleSubmit} className="register-form">

              {/* ADMIN */}
              <fieldset>
                <legend>1. Datos del Administrador</legend>

                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    name="nombreUsuario"
                    value={formData.nombreUsuario}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Contraseña</label>
                    <input
                      type="password"
                      name="contrasena"
                      value={formData.contrasena}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </fieldset>

              {/* NEGOCIO */}
              <fieldset>
                <legend>2. Información del Negocio</legend>

                <div className="form-group">
                  <label>Nombre del Negocio</label>
                  <input
  type="text"
  name="nombreNegocio"
  value={formData.nombreNegocio}
  onChange={(e) =>
    setFormData((p) => ({ ...p, nombreNegocio: e.target.value.toUpperCase() }))
  }
  required
/>

                </div>

                <div className="form-grid-2">
                  {/* Categoría */}
                  <div className="form-group">
                    <label>Categoría</label>
                    {loadingCategorias ? (
                      <p>Cargando...</p>
                    ) : (
                      <select
                        name="idCategoria"
                        value={formData.idCategoria}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Selecciona --</option>
                        {categorias.map((c) => (
                          <option key={c.IdCategoria} value={c.IdCategoria}>
                            {c.NombreCategoria}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      name="telefonoContacto"
                      value={formData.telefonoContacto}
                      onChange={handleChange}
                    />
                  </div>
                </div>

               
                <div className="form-group membresia-box">
                  <label>Membresía</label>

                  {loadingMembresias ? (
                    <p>Cargando membresías...</p>
                  ) : (
                    <select
                      name="idMembresia"
                      value={formData.idMembresia}
                      onChange={handleChange}
                      required
                      className="select-membresia"
                    >
                      <option value="">-- Selecciona una membresía --</option>

                      {membresias.map((m) => (
                        <option key={m.IdMembresia} value={m.IdMembresia}>
                          {m.Nombre} — ${m.PrecioMensual} MXN
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <label>Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>

                {/* HORARIO */}
                <div className="form-group">
                  <label>Horario de Atención</label>
                  <button
                    type="button"
                    className="btn-config-horario"
                    onClick={() => setShowScheduleModal(true)}
                  >
                    <FaCalendarAlt /> Configurar Días y Horas
                  </button>
                  <div className="horario-resumen">
                    {activeDays === 0
                      ? "Cerrado (Sin configurar)"
                      : `${activeDays} días activos.`}
                  </div>
                </div>

                {/* EMAIL CONTACTO */}
                <div className="form-group">
                  <label>Email Público</label>
                  <input
                    type="email"
                    name="correoContacto"
                    value={formData.correoContacto}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Latitud</label>
                    <input
                      type="number"
                      name="coordenadasLat"
                      value={formData.coordenadasLat}
                      onChange={handleChange}
                      step="any"
                    />
                  </div>

                  <div className="form-group">
                    <label>Longitud</label>
                    <input
                      type="number"
                      name="coordenadasLng"
                      value={formData.coordenadasLng}
                      onChange={handleChange}
                      step="any"
                    />
                  </div>
                </div>

                {/* IMAGEN */}
                <div className="form-group">
                  <label>Logo / Imagen</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  {uploading && (
                    <small style={{ color: "blue" }}>Subiendo...</small>
                  )}
                  {formData.linkUrl && (
                    <img
                      src={formData.linkUrl}
                      alt="Preview"
                      className="preview-img"
                    />
                  )}
                </div>
              </fieldset>

              <button
                type="submit"
                className="btn-submit-registro"
                disabled={loading || uploading}
              >
                {loading ? "Creando cuenta..." : "Registrar Negocio"}
              </button>
            </form>
          </div>
        </div>

        {/* MODAL HORARIO */}
        {showScheduleModal && (
          <div
            className="modal-horario-overlay"
            onClick={() => setShowScheduleModal(false)}
          >
            <div
              className="modal-horario-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-horario-header">
                <h3>Configurar Horario</h3>
                <button
                  className="btn-close-modal"
                  onClick={() => setShowScheduleModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="horario-grid">
                {horario.map((dia, idx) => (
                  <div
                    key={dia.dia}
                    className={`horario-row ${dia.activo ? "activo" : ""}`}
                  >
                    <div className="horario-check">
                      <input
                        type="checkbox"
                        checked={dia.activo}
                        onChange={(e) =>
                          handleHorarioChange(idx, "activo", e.target.checked)
                        }
                      />
                      <span>{dia.dia}</span>
                    </div>

                    <div className="horario-horas">
                      <FaClock size={12} color="#999" />
                      <input
                        type="time"
                        value={dia.inicio}
                        disabled={!dia.activo}
                        onChange={(e) =>
                          handleHorarioChange(idx, "inicio", e.target.value)
                        }
                      />
                      <span>-</span>
                      <input
                        type="time"
                        value={dia.fin}
                        disabled={!dia.activo}
                        onChange={(e) =>
                          handleHorarioChange(idx, "fin", e.target.value)
                        }
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
                Confirmar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
