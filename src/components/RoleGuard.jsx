import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function RoleGuard({ allow = [], children }) {
  const { user } = useAuth();

  // no logueado
  if (!user) return <Navigate to="/login" replace />;

  // normalizamos roles
  const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles].filter(Boolean);

  // si no pasaste allow, deja entrar
  if (!allow.length) return children;

  // si es super, deja entrar
  if (userRoles.includes("adminNearbiz")) return children;

  // verifica
  const ok = userRoles.some((r) => allow.includes(r));

  return ok ? (
    children
  ) : (
    <h3 style={{ padding: 16 }}>No tienes permiso para ver esta página.</h3>
  );
}
