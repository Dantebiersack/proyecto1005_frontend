// src/auth/AuthContext.jsx
import { createContext, useContext, useState } from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());

  async function login(username, password) {
    const data = await apiLogin(username, password);
    setUser({
      id: data.idUsuario,
      name: data.nombre,
      email: data.email,
      roles: [data.rol],
      exp: data.expira,
    });
  }

  function logout() {
    apiLogout();
    setUser(null);
    
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider />");
  return ctx;
}
