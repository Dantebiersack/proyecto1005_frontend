import React, { useState } from "react";
import "./login.css";
import NavbarInicio from "../Navbar/NavbarInicio";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate("/mi-empresa"); // o /dashboard
    } catch (err) {
      console.error(err);
      setError("Usuario o contraseña inválidos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <NavbarInicio />
      <div className="login-wrapper">
        <div className="login-container">
          <div className="login-left">
            <div className="logo-content">
              <img
                src="../../assets/nearBizLogo.jpg"
                alt="NearBiz Logo"
                className="login-logo"
              />
              <h1 className="login-title">NEARBIZ</h1>
              <p className="login-subtitle">Tu agenda, tus empresas cercanas</p>
            </div>
          </div>

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
                  value={form.username}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, username: e.target.value }))
                  }
                  placeholder="Ingresa tu usuario o email"
                  required
                />

                <label htmlFor="password">CONTRASEÑA</label>
                <input
                  type="password"
                  id="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="********"
                  required
                />

                <button type="submit" className="btn-ingresar" disabled={loading}>
                  {loading ? "Ingresando..." : "INGRESAR"}
                </button>

                {error && (
                  <p style={{ color: "#ffb3b3", marginTop: "10px" }}>{error}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
