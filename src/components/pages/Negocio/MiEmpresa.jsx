// src/pages/MiEmpresa.jsx
import React, { useState, useEffect } from "react";
import "./MiEmpresa.css";
import {
  getMiNegocio,
  getCategorias,
  updateNegocio
} from "../../../services/miempresaService";

const DIAS_SEMANA = [
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
];

export default function MiEmpresa() {
  const [formData, setFormData] = useState({
    IdNegocio: null,
    IdCategoria: "",
    Nombre: "",
    Direccion: "",
    TelefonoContacto: "",
    CorreoContacto: "",
    Descripcion: "",
    LinkUrl: "",
    CoordenadasLat: "",
    CoordenadasLng: "",
    HorarioAtencion: "[]"
  });

  const [horario, setHorario] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const negocio = await getMiNegocio(); // Puede ser null
        const cat = await getCategorias();
        setCategorias(cat);

        if (negocio) {
          setFormData(negocio);
          // Cargar horario si existe
          setHorario(
            negocio.HorarioAtencion ? JSON.parse(negocio.HorarioAtencion) :
            DIAS_SEMANA.map(d => ({ dia: d, activo: false, inicio: "09:00", fin: "18:00" }))
          );
        } else {
          // Si no hay negocio, inicializar horario vacío
          setHorario(DIAS_SEMANA.map(d => ({ dia: d, activo: false, inicio: "09:00", fin: "18:00" })));
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar datos del negocio.");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleHorarioChange = (i, field, value) => {
    const copia = [...horario];
    copia[i][field] = value;
    setHorario(copia);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const data = { ...formData, HorarioAtencion: JSON.stringify(horario) };
      await updateNegocio(formData.IdNegocio ? formData.IdNegocio : "MiNegocio", data);
      setSuccess("Datos actualizados correctamente.");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setError("No se pudieron actualizar los datos.");
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="miempresa-container">
      <h1>Mi Empresa</h1>

      {formData.Nombre ? (
        <div className="datos-empresa">
          <p><strong>Nombre:</strong> {formData.Nombre}</p>
          <p><strong>Dirección:</strong> {formData.Direccion}</p>
          <p><strong>Teléfono:</strong> {formData.TelefonoContacto}</p>
          <p><strong>Email:</strong> {formData.CorreoContacto}</p>
          <p><strong>Descripción:</strong> {formData.Descripcion}</p>
          <p><strong>Horario:</strong> Configurado</p>
        </div>
      ) : (
        <p>No tienes un negocio registrado aún.</p>
      )}

      <button className="editar" onClick={() => setEditMode(true)}>Editar</button>

      {editMode && (
        <div className="modal-overlay">
          <div className="modal">
            <form onSubmit={handleSubmit}>
              <h2>Editar Datos</h2>

              <label>Nombre:</label>
              <input name="Nombre" value={formData.Nombre} onChange={handleChange} />

              <label>Dirección:</label>
              <input name="Direccion" value={formData.Direccion} onChange={handleChange} />

              <label>Teléfono:</label>
              <input name="TelefonoContacto" value={formData.TelefonoContacto} onChange={handleChange} />

              <label>Correo:</label>
              <input name="CorreoContacto" value={formData.CorreoContacto} onChange={handleChange} />

              <label>Categoría:</label>
              <select name="IdCategoria" value={formData.IdCategoria} onChange={handleChange}>
                <option value="">Seleccione</option>
                {categorias.map(c => (
                  <option key={c.IdCategoria} value={c.IdCategoria}>{c.NombreCategoria}</option>
                ))}
              </select>

              <label>Descripción:</label>
              <textarea name="Descripcion" value={formData.Descripcion} onChange={handleChange} />

              <label>Link URL:</label>
              <input name="LinkUrl" value={formData.LinkUrl} onChange={handleChange} />

              {/* HORARIO */}
              <button
                type="button"
                className="btn-horario"
                onClick={() => setShowScheduleModal(true)}
              >
                Editar Horarios
              </button>

              <button className="guardar" type="submit">Guardar</button>
              <button className="cancelar" type="button" onClick={() => setEditMode(false)}>Cancelar</button>

              {success && <p className="success">{success}</p>}
              {error && <p className="error">{error}</p>}
            </form>
          </div>
        </div>
      )}

      {/* MODAL HORARIO */}
      {showScheduleModal && (
        <div className="modal-horario-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-horario-content" onClick={(e) => e.stopPropagation()}>
            <h3>Configurar Horario</h3>

            {horario.map((dia, i) => (
              <div key={dia.dia} className="horario-row">
                <label>
                  <input
                    type="checkbox"
                    checked={dia.activo}
                    onChange={e => handleHorarioChange(i, "activo", e.target.checked)}
                  />
                  {dia.dia}
                </label>

                <input
                  type="time"
                  value={dia.inicio}
                  disabled={!dia.activo}
                  onChange={e => handleHorarioChange(i, "inicio", e.target.value)}
                />

                <input
                  type="time"
                  value={dia.fin}
                  disabled={!dia.activo}
                  onChange={e => handleHorarioChange(i, "fin", e.target.value)}
                />
              </div>
            ))}

            <button className="guardar" onClick={() => setShowScheduleModal(false)}>Guardar Horarios</button>
          </div>
        </div>
      )}
    </div>
  );
}
