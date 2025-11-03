import React, { useState, useEffect } from "react";
import "./Valoraciones.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function Valoraciones() {
  const [valoraciones, setValoraciones] = useState([]);
  const [filtro, setFiltro] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Obtener valoraciones del backend
  useEffect(() => {
    fetch("http://localhost:5128/api/Valoraciones")
      .then((res) => {
        if (!res.ok) throw new Error(`Error en la API: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setValoraciones(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudieron cargar las valoraciones.");
        setLoading(false);
      });
  }, []);

  // Filtrar por calificación
  const valoracionesFiltradas = filtro
    ? valoraciones.filter((v) => v.Calificacion === filtro)
    : valoraciones;

  // Manejar respuesta
  const handleResponder = (id) => {
    const resp = respuestas[id];
    if (!resp || resp.trim() === "") return;
    console.log(`Respuesta a ${id}: ${resp}`);
    alert(`Respuesta enviada: ${resp}`);
    setRespuestas({ ...respuestas, [id]: "" });
  };

  // Datos para la gráfica
  const dataGrafica = [5, 4, 3, 2, 1].map((star) => ({
    name: `${star}⭐`,
    comentarios: valoraciones.filter((v) => v.Calificacion === star).length,
    color:
      star === 5
        ? "#2e7d32"
        : star === 4
        ? "#66bb6a"
        : star === 3
        ? "#ffeb3b"
        : star === 2
        ? "#ff9800"
        : "#f44336",
  }));

  // Promedio de calificación
  const totalComentarios = valoraciones.length;
  const promedio =
    totalComentarios > 0
      ? (
          valoraciones.reduce((acc, v) => acc + v.Calificacion, 0) /
          totalComentarios
        ).toFixed(1)
      : 0;

  if (loading) return <p>Cargando valoraciones...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="valoraciones-container">
      <div className="valoraciones-lista">
        <h2>Comentarios de Clientes</h2>

        <div className="filtro">
          <label>Filtrar por estrellas:</label>
          <select value={filtro} onChange={(e) => setFiltro(Number(e.target.value))}>
            <option value={0}>Todas</option>
            <option value={5}>5⭐</option>
            <option value={4}>4⭐</option>
            <option value={3}>3⭐</option>
            <option value={2}>2⭐</option>
            <option value={1}>1⭐</option>
          </select>
        </div>

        {valoracionesFiltradas.length === 0 && <p>No hay comentarios con esta calificación.</p>}

        {valoracionesFiltradas.map((v) => (
          <div key={v.IdValoracion} className="comentario-card">
            <div className="header-comentario">
              <span className="cliente-nombre">Cliente #{v.IdCliente}</span>
              <div className="estrellas">
                {Array.from({ length: v.Calificacion }).map((_, i) => (
                  <span key={`star-filled-${v.IdValoracion}-${i}`}>★</span>
                ))}
                {Array.from({ length: 5 - v.Calificacion }).map((_, i) => (
                  <span key={`star-empty-${v.IdValoracion}-${i}`}>☆</span>
                ))}
              </div>
            </div>
            <p className="comentario">{v.Comentario || "(Sin comentario)"}</p>

            <div className="responder">
              <input
                type="text"
                placeholder="Escribe una respuesta..."
                value={respuestas[v.IdValoracion] || ""}
                onChange={(e) =>
                  setRespuestas({ ...respuestas, [v.IdValoracion]: e.target.value })
                }
              />
              <button onClick={() => handleResponder(v.IdValoracion)}>Responder</button>
            </div>
          </div>
        ))}
      </div>

      <div className="valoraciones-grafica">
        <h2>Resumen de Comentarios</h2>
        <p className="promedio">Promedio de calificación: {promedio} ⭐</p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dataGrafica}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="comentarios">
              {dataGrafica.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
