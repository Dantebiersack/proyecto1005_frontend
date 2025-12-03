import React from "react";
import { useNavigate } from "react-router-dom";
import NavbarInicio from "../Navbar/NavbarInicio"; 
import "./NotFound.css"; 

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      
      <NavbarInicio />

      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">¡Ups! Página no encontrada</h2>
        <p className="error-text">
          Lo sentimos, no pudimos encontrar la página que estás buscando. 
          Pudo haber sido eliminada, cambiada de nombre o no está disponible temporalmente.
        </p>
        
        <button className="btn-home" onClick={() => navigate("/")}>
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}