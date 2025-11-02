// src/components/pages/LandingOrHome.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import Inicio from "./Inicio.jsx";

export default function LandingOrHome() {
  const { user } = useAuth();

  // no hay sesión → muestro la landing normal
  if (!user) {
    return <Inicio />;
  }

  // sí hay sesión → lo mando a su home según rol
  const roles = user.roles || [];

  // prioridad: adminNearbiz y personal al panel de gestión
  if (roles.includes("adminNearbiz") || roles.includes("personal")) {
    return <Navigate to="/gestion-empresas" replace />;
  }

  // admin de negocio
  if (roles.includes("adminNegocio")) {
    return <Navigate to="/mi-empresa" replace />;
  }

  // si por alguna razón viene con algo raro
  return <Navigate to="/mi-empresa" replace />;
}
