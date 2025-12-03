import { useState, useEffect } from "react";
import { actualizarPerfil } from "../../../services/gestionCuentaService";
import Swal from "sweetalert2";  // ⭐ AÑADIDO
import "./GestionCuenta.css";

export default function GestionCuenta() {
  const [user, setUser] = useState(null);
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const data = localStorage.getItem("nearbiz_user");
    if (data) {
      const u = JSON.parse(data);
      setUser(u);
      setNombre(u.name);
    }
  }, []);

  const guardar = async () => {
    try {
      await actualizarPerfil(user.id, nombre, password);

      // ⭐ ALERTA DE ÉXITO
      Swal.fire({
        title: "Perfil actualizado",
        text: "Tus datos han sido actualizados correctamente.",
        icon: "success",
        confirmButtonColor: "#0a6fd8",
      });

    } catch (e) {

      // ⭐ ALERTA DE ERROR
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el perfil.",
        icon: "error",
        confirmButtonColor: "#d9534f",
      });

    }
  };

  if (!user) return <p className="no-login">No has iniciado sesión</p>;

  return (
    <div className="gestion-caja">
      <h2>⚙ Gestión de Cuenta</h2>

      <label>Nombre de usuario</label>
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <label>
        Nueva contraseña <span>(opcional)</span>
      </label>
      <input
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={guardar}>Guardar Cambios</button>
    </div>
  );
}
