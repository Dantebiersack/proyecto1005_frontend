import React, { useState, useEffect } from "react";
import "./MiEmpresa.css";
import { getMiNegocio, getCategorias, updateNegocio } from "../../../services/miempresaService";
import Swal from "sweetalert2"; 

const DIAS_SEMANA = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

export default function MiEmpresa() {
  const [formData, setFormData] = useState({
    IdNegocio: null, IdCategoria: "", Nombre: "", Direccion: "",
    TelefonoContacto: "", CorreoContacto: "", Descripcion: "",
    LinkUrl: "", CoordenadasLat: "", CoordenadasLng: "", HorarioAtencion: "[]"
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
        const negocio = await getMiNegocio();
        const cat = await getCategorias();
        setCategorias(cat);
        if (negocio) {
          setFormData(negocio);
          setHorario(negocio.HorarioAtencion
            ? JSON.parse(negocio.HorarioAtencion)
            : DIAS_SEMANA.map(d => ({ dia:d, activo:false, inicio:"09:00", fin:"18:00" }))
          );
        } else {
          setHorario(DIAS_SEMANA.map(d => ({ dia:d, activo:false, inicio:"09:00", fin:"18:00" })));
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar datos del negocio.");
      } finally { setLoading(false); }
    };
    cargar();
  }, []);

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleHorarioChange = (i, field, value) => { const copia=[...horario]; copia[i][field]=value; setHorario(copia); }

  const handleSubmit = async e => {
    e.preventDefault();
    setError(""); 
    setSuccess("");

    try {
      const data = { ...formData, HorarioAtencion: JSON.stringify(horario) };
      await updateNegocio(formData.IdNegocio || "MiNegocio", data);

     
      Swal.fire({
        title: "¡Datos actualizados!",
        text: "Tu información se guardó correctamente.",
        icon: "success",
        confirmButtonColor: "#0a6fd8",
      });

      setSuccess("Datos actualizados correctamente.");
      setEditMode(false);

    } catch (err) {

      console.error(err);

     
      Swal.fire({
        title: "Error",
        text: "No se pudieron actualizar los datos.",
        icon: "error",
        confirmButtonColor: "#d9534f",
      });

      setError("No se pudieron actualizar los datos.");
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="miempresa-container">
      <h1>Mi Empresa</h1>

      {formData.Nombre ? (
        <div className="datos-empresa tarjeta">
          <div className="foto-arriba">
            {formData.LinkUrl ? <img src={formData.LinkUrl} alt="Negocio"/> : <div className="foto-placeholder">Sin Imagen</div>}
          </div>
          <div className="info-abajo">
            <p><strong>Nombre:</strong> {formData.Nombre}</p>
            <p><strong>Dirección:</strong> {formData.Direccion}</p>
            <p><strong>Teléfono:</strong> {formData.TelefonoContacto}</p>
            <p><strong>Email:</strong> {formData.CorreoContacto}</p>
            <p><strong>Descripción:</strong> {formData.Descripcion}</p>
            <p><strong>Horario:</strong> Configurado</p>
          </div>
        </div>
      ) : <p>No tienes un negocio registrado aún.</p>}

      <button className="editar" onClick={() => setEditMode(true)}>Comenzar a editar mi empresa</button>

      {/* MODAL EDITAR */}
      {editMode && (
        <div className="modal-overlay">
          <div className="modal modal-ancho">
            <form onSubmit={handleSubmit} className="modal-form">
              <h2>Editar Datos de Mi Empresa</h2>

              <div className="modal-body-modalarriba">
                <div className="foto-arriba-modal">
                  {formData.LinkUrl ? <img src={formData.LinkUrl} alt="Negocio"/> : <div className="foto-placeholder">Sin Imagen</div>}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e=>{
                      const file=e.target.files[0];
                      if(file){
                        const reader=new FileReader();
                        reader.onload=()=>setFormData(prev=>({...prev,LinkUrl:reader.result}));
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                <div className="form-col-modal">
                  <label>Nombre:</label><input name="Nombre" value={formData.Nombre} onChange={handleChange}/>
                  <label>Dirección:</label><input name="Direccion" value={formData.Direccion} onChange={handleChange}/>
                  <label>Teléfono:</label><input name="TelefonoContacto" value={formData.TelefonoContacto} onChange={handleChange}/>
                  <label>Correo:</label><input name="CorreoContacto" value={formData.CorreoContacto} onChange={handleChange}/>
                  
                  <label>Categoría:</label>
                  <select name="IdCategoria" value={formData.IdCategoria} onChange={handleChange}>
                    <option value="">Seleccione</option>
                    {categorias.map(c => (
                      <option key={c.IdCategoria} value={c.IdCategoria}>
                        {c.NombreCategoria}
                      </option>
                    ))}
                  </select>

                  <label>Descripción:</label>
                  <textarea name="Descripcion" value={formData.Descripcion} onChange={handleChange}/>
                  
                  <button type="button" className="btn-config-horario" onClick={()=>setShowScheduleModal(true)}>
                    Editar Horarios
                  </button>
                </div>
              </div>

              <div className="botones">
                <button className="guardar" type="submit">Guardar</button>
                <button className="cancelar" type="button" onClick={()=>setEditMode(false)}>Cancelar</button>
              </div>

              {success && <p className="success">{success}</p>}
              {error && <p className="error">{error}</p>}
            </form>
          </div>
        </div>
      )}

      {/* MODAL HORARIO */}
      {showScheduleModal && (
        <div className="modal-horario-overlay" onClick={()=>setShowScheduleModal(false)}>
          <div className="modal-horario-content" onClick={e=>e.stopPropagation()}>
            <div className="modal-horario-header">
              <h3>Configurar Horario</h3>
              <button className="btn-close-modal" onClick={()=>setShowScheduleModal(false)}>×</button>
            </div>

            {horario.map((dia,i)=>(
              <div key={dia.dia} className="horario-row">
                <div className="horario-check">
                  <input
                    type="checkbox"
                    checked={dia.activo}
                    onChange={e=>handleHorarioChange(i,"activo",e.target.checked)}
                  />
                  <span>{dia.dia}</span>
                </div>

                <div className="horario-horas">
                  <input
                    type="time"
                    value={dia.inicio}
                    disabled={!dia.activo}
                    onChange={e=>handleHorarioChange(i,"inicio",e.target.value)}
                  />
                  <input
                    type="time"
                    value={dia.fin}
                    disabled={!dia.activo}
                    onChange={e=>handleHorarioChange(i,"fin",e.target.value)}
                  />
                </div>
              </div>
            ))}

            <button className="btn-save-horario" onClick={()=>setShowScheduleModal(false)}>
              Guardar Horarios
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
