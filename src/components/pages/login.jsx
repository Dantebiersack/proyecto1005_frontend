import React, { useState } from "react";
import "./login.css";
import NavbarInicio from "../Navbar/NavbarInicio"; // tu menú
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext"; // <- del mock que hicimos

export default function Login() {
  const navigate = useNavigate();
  const { loginAs, user } = useAuth();

  // TEMP: credenciales y rol (mock)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // Roles de ejemplo: admin, personal, negocio
  const [role, setRole] = useState("negocio"); 

  // Dónde aterriza cada rol al entrar
  const homeByRole = {
    admin: "/gestion-empresas",
    personal: "/gestion-empresas",
    negocio: "/mi-empresa",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría tu llamada al backend; por ahora solo setea el rol mock
    loginAs([role]); // p.ej. ['negocio'] o ['admin']
    const next = homeByRole[role] || "/";
    navigate(next, { replace: true });
  };

  const goRegister = () => {
    navigate("/registro-empresa");
  };

  // Si ya está logueado, mándalo al home correspondiente
  if (user?.roles?.length) {
    const r = user.roles[0];
    const next = homeByRole[r] || "/";
    navigate(next, { replace: true });
    return null;
  }

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

              <form onSubmit={handleSubmit}>
                <label htmlFor="username">NOMBRE DE USUARIO</label>
                <input
                  type="text"
                  id="username"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />

                <label htmlFor="password">CONTRASEÑA</label>
                <input
                  type="password"
                  id="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />

                {/* Selector de rol temporal (mientras no hay back) */}
                <label htmlFor="rol" style={{ marginTop: 8 }}>ROL (temporal)</label>
                <select
                  id="rol"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="login-select"
                >
                  <option value="negocio">Negocio</option>
                  <option value="personal">Personal NearBiz</option>
                  <option value="admin">Admin</option>
                </select>

                <button type="submit" className="btn-ingresar" style={{ marginTop: 12 }}>
                  INGRESAR
                </button>
              </form>

              <p className="login-register-text">
                ¿NO CUENTAS CON UNA CUENTA?<br />
                DA CLICK AQUÍ PARA REGÍSTRATE
              </p>

              <button type="button" className="btn-crear-cuenta" onClick={goRegister}>
                CREAR UNA CUENTA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
