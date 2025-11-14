// src/pages/MiEmpresa.jsx
import React, { useState, useEffect } from "react";
import "./MiEmpresa.css";
import {
  getNegocioById,
  getCategorias,
  updateNegocio,
} from "../../../services/miempresaService";

export default function MiEmpresa() {
  const negocioId = 1;
  const [formData, setFormData] = useState({
    IdCategoria: "",
    IdMembresia: null,
    Nombre: "",
    Direccion: "",
    CoordenadasLat: "",
    CoordenadasLng: "",
    Descripcion: "",
    TelefonoContacto: "",
    CorreoContacto: "",
    HorarioAtencion: "",
    LinkUrl: "",
  });

  const [categorias, setCategorias] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [dataNegocio, dataCat] = await Promise.all([
          getNegocioById(negocioId),
          getCategorias(),
        ]);
        setFormData(dataNegocio);
        setCategorias(dataCat);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos del negocio.");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [negocioId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await updateNegocio(negocioId, formData);
      setSuccess("✅ Datos actualizados correctamente.");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setError("❌ No se pudieron actualizar los datos.");
    }
  };

  if (loading) return <p className="mensaje">Cargando datos...</p>;
  if (error) return <p className="mensaje error">{error}</p>;

  return (
    <div className="miempresa-container">
      <h1>Mi Empresa</h1>

      <div className="datos-empresa">
        <p><strong>Nombre:</strong> {formData.Nombre}</p>
        <p><strong>Dirección:</strong> {formData.Direccion}</p>
        <p><strong>Teléfono:</strong> {formData.TelefonoContacto}</p>
        <p><strong>Correo:</strong> {formData.CorreoContacto}</p>
        <p><strong>Horario:</strong> {formData.HorarioAtencion}</p>
        <p><strong>Descripción:</strong> {formData.Descripcion}</p>
        <p>
          <strong>Link:</strong>{" "}
          <a href={formData.LinkUrl} target="_blank" rel="noreferrer">
            {formData.LinkUrl}
          </a>
        </p>
      </div>

      <div className="botones">
        <button type="button" className="editar" onClick={() => setEditMode(true)}>
          Editar
        </button>
      </div>

      {/* 🔹 Modal flotante de edición */}
      {editMode && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Editar Datos de Empresa</h2>
            <form onSubmit={handleSubmit} className="miempresa-form">
              <div className="form-row">
                <div className="form-col">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    name="Nombre"
                    value={formData.Nombre || ""}
                    onChange={handleChange}
                  />

                  <label>Dirección:</label>
                  <input
                    type="text"
                    name="Direccion"
                    value={formData.Direccion || ""}
                    onChange={handleChange}
                  />

                  <label>Teléfono:</label>
                  <input
                    type="text"
                    name="TelefonoContacto"
                    value={formData.TelefonoContacto || ""}
                    onChange={handleChange}
                  />

                  <label>Correo:</label>
                  <input
                    type="email"
                    name="CorreoContacto"
                    value={formData.CorreoContacto || ""}
                    onChange={handleChange}
                  />

                  <label>Categoría:</label>
                  <select
                    name="IdCategoria"
                    value={formData.IdCategoria || ""}
                    onChange={handleChange}
                  >
                    <option key="default" value="">
                      Selecciona una categoría
                    </option>
                    {categorias.map((cat, index) => (
                      <option
                        key={cat.idCategoria || index}
                        value={cat.idCategoria}
                      >
                        {cat.nombre || cat.Nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-col">
                  <label>Horario de Atención:</label>
                  <input
                    type="text"
                    name="HorarioAtencion"
                    value={formData.HorarioAtencion || ""}
                    onChange={handleChange}
                  />

                  <label>Descripción:</label>
                  <textarea
                    name="Descripcion"
                    value={formData.Descripcion || ""}
                    onChange={handleChange}
                  />

                  <label>Link URL:</label>
                  <input
                    type="text"
                    name="LinkUrl"
                    value={formData.LinkUrl || ""}
                    onChange={handleChange}
                  />

                  <label>Coordenadas Latitud:</label>
                  <input
                    type="number"
                    step="0.000001"
                    name="CoordenadasLat"
                    value={formData.CoordenadasLat || ""}
                    onChange={handleChange}
                  />

                  <label>Coordenadas Longitud:</label>
                  <input
                    type="number"
                    step="0.000001"
                    name="CoordenadasLng"
                    value={formData.CoordenadasLng || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="botones">
                <button type="submit" className="guardar">
                  Guardar
                </button>
                <button
                  type="button"
                  className="cancelar"
                  onClick={() => setEditMode(false)}
                >
                  Cancelar
                </button>
              </div>

              {success && <p className="mensaje success">{success}</p>}
              {error && <p className="mensaje error">{error}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
