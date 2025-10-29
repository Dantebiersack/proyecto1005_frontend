import { Routes, Route } from "react-router-dom";
import PrivateLayout from "./components/layout/PrivateLayout.jsx";
import RoleGuard from "./components/RoleGuard.jsx";

// 👇 OJO: ahora desde components/pages/...
import Inicio from "./components/pages/Inicio.jsx"; // mueve tu Inicio.jsx aquí o ajusta la ruta real
import Login from "./components/pages/login.jsx";   // idem (si tu archivo está con mayúscula, respétalas)

// Negocio
import MiEmpresa from "./components/pages/Negocio/MiEmpresa.jsx";
import GestionEmpleados from "./components/pages/Negocio/GestionEmpleados.jsx";
import Citas from "./components/pages/Negocio/Citas.jsx";
import Valoraciones from "./components/pages/Negocio/Valoraciones.jsx";

// Personal Nearbiz
import GestionEmpresas from "./components/pages/personalNearbiz/GestionEmpresas.jsx";
import GestionPersonal from "./components/pages/personalNearbiz/GestionPersonal.jsx";
import SolicitudEmpresas from "./components/pages/personalNearbiz/SolicitudEmpresas.jsx";
import GestionCuenta from "./components/pages/personalNearbiz/GestionCuenta.jsx";

export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />

      {/* Privadas */}
      <Route element={<PrivateLayout />}>
        {/* Personal */}
        <Route path="/gestion-empresas" element={<RoleGuard allow={['admin','personal']}><GestionEmpresas/></RoleGuard>} />
        <Route path="/gestion-usuarios" element={<RoleGuard allow={['admin','personal']}><GestionPersonal/></RoleGuard>} />
        <Route path="/solicitudes-empresas" element={<RoleGuard allow={['admin','personal']}><SolicitudEmpresas/></RoleGuard>} />
        <Route path="/gestion-cuenta" element={<RoleGuard allow={['admin','personal']}><GestionCuenta/></RoleGuard>} />

        {/* Negocios */}
        <Route path="/mi-empresa" element={<RoleGuard allow={['admin','negocio']}><MiEmpresa/></RoleGuard>} />
        <Route path="/gestion-empleados" element={<RoleGuard allow={['admin','negocio']}><GestionEmpleados/></RoleGuard>} />
        <Route path="/citas" element={<RoleGuard allow={['admin','negocio']}><Citas/></RoleGuard>} />
        <Route path="/valoraciones" element={<RoleGuard allow={['admin','negocio']}><Valoraciones/></RoleGuard>} />
      </Route>
    </Routes>
  );
}
