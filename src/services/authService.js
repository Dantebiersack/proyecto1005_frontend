// src/services/authService.js
import api from "./api";

export async function login(userOrEmail, password) {
  const resp = await api.post("/auth/login", {
    userOrEmail,
    password,
  });

  const data = resp.data;
  console.log("LOGIN RESP >>>", data); 

  // el back puede mandar PascalCase
  const token = data.token || data.Token;
  const nombre = data.nombre || data.Nombre;
  const rol = data.rol || data.Rol;
  const idUsuario = data.idUsuario || data.IdUsuario;
  const expira = data.expira || data.Expira;
  let email = data.email || data.Email || null;

  // si no vino email pero el userOrEmail tenía @, úsalo
  if (!email && userOrEmail && userOrEmail.indexOf("@") !== -1) {
    email = userOrEmail;
  }

  // guarda token
  if (token) {
    localStorage.setItem("nearbiz_token", token);
  }

  const userToStore = {
    id: idUsuario,
    name: nombre,
    email: email,
    roles: rol ? [rol] : [],
    exp: expira,
  };

  localStorage.setItem("nearbiz_user", JSON.stringify(userToStore));

  return {
    token,
    nombre,
    rol,
    idUsuario,
    expira,
    email,
  };
}

export function logout() {
  localStorage.removeItem("nearbiz_token");
  localStorage.removeItem("nearbiz_user");
}

/*export function getCurrentUser() {
  const str = localStorage.getItem("nearbiz_user");
  if (!str) return null;
  try {
    const u = JSON.parse(str);
    // PARCHE: si es un user viejo sin email pero sí hay name con @
    if (!u.email && u.name && u.name.indexOf("@") !== -1) {
      u.email = u.name;
    }
    return u;
  } catch (e) {
    return null;
  }
}*/

export function getCurrentUser() {
  const str = localStorage.getItem("nearbiz_user");
  if (!str) return null;
  try {
    const u = JSON.parse(str);
    if (!u.email && u.name && u.name.indexOf("@") !== -1) {
      u.email = u.name;
    }
    return u;
  } catch {
    return null;
  }
}

