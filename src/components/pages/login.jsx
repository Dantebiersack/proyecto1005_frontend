import React from "react";
import "./login.css";
import NavbarInicio from "../Navbar/NavbarInicio"; // 👈 tu menú

export default function Login() {
  return (
    <div className="login-page">
      {/* === NAVBAR === */}
      <NavbarInicio />

      {/* === CONTENEDOR PRINCIPAL === */}
      <div className="login-wrapper">
        <div className="login-container">
          {/* Sección izquierda: logo */}
          <div className="login-left">
            <div className="logo-content">
              <img
                src="https://i.pinimg.com/736x/3b/d8/f6/3bd8f650d3ec2b5a943f441560de65a4.jpg"
                alt="NearBiz Logo"
                className="login-logo"
              />
              <h1 className="login-title">NEARBIZ</h1>
              <p className="login-subtitle">Tu agenda, tus empresas cercanas</p>
            </div>
          </div>

          {/* Sección derecha: formulario */}
          <div className="login-right">
            <div className="login-card">
              <div className="login-avatar">
                <i className="fa fa-user-circle"></i>
              </div>

              <form>
                <label htmlFor="username">NOMBRE DE USUARIO</label>
                <input
                  type="text"
                  id="username"
                  placeholder="Ingresa tu usuario"
                />

                <label htmlFor="password">CONTRASEÑA</label>
                <input type="password" id="password" placeholder="********" />

                <button type="button" className="btn-ingresar">
                  INGRESAR
                </button>
              </form>

              <p className="login-register-text">
                ¿NO CUENTAS CON UNA CUENTA?<br />
                DA CLICK AQUÍ PARA REGÍSTRATE
              </p>

              <button type="button" className="btn-crear-cuenta">
                CREAR UNA CUENTA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
