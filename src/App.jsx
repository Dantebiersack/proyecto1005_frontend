import { Routes, Route } from "react-router-dom";
import PrivateLayout from "./components/layout/PrivateLayout.jsx";
import RoleGuard from "./components/RoleGuard.jsx";

import LandingOrHome from "./components/pages/LandingOrHome.jsx";
import Login from "./components/pages/login.jsx";

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
import GestionUsuarios from "./components/pages/personalNearbiz/GestionUsuarios.jsx";

export default function App() {
  return (
    <Routes>
      {/* 👇 aquí ya decide si landing o redirección */}
      <Route path="/" element={<LandingOrHome />} />

      <Route path="/login" element={<Login />} />

      <Route element={<PrivateLayout />}>
        {/* Personal */}
        <Route
          path="/gestion-empresas"
          element={
            <RoleGuard allow={["adminNearbiz", "personal", "adminNegocio"]}>
              <GestionEmpresas />
            </RoleGuard>
          }
        />
        <Route
          path="/gestion-personal"
          element={
            <RoleGuard allow={["adminNearbiz", "personal", "adminNegocio"]}>
              <GestionPersonal />
            </RoleGuard>
          }
        />
        <Route
          path="/solicitudes-empresas"
          element={
            <RoleGuard allow={["adminNearbiz", "personal", "adminNegocio"]}>
              <SolicitudEmpresas />
            </RoleGuard>
          }
        />
        <Route
          path="/gestion-cuenta"
          element={
            <RoleGuard allow={["adminNearbiz", "personal", "adminNegocio"]}>
              <GestionCuenta />
            </RoleGuard>
          }
        />
        <Route
          path="/gestion-usuarios"
          element={
            <RoleGuard allow={["adminNearbiz", "personal", "adminNegocio"]}>
              <GestionUsuarios />
            </RoleGuard>
          }
        />

        {/* Negocio */}
        <Route
          path="/mi-empresa"
          element={
            <RoleGuard allow={["adminNearbiz", "personal", "adminNegocio"]}>
              <MiEmpresa />
            </RoleGuard>
          }
        />
        <Route
          path="/gestion-empleados"
          element={
            <RoleGuard allow={["adminNearbiz", "personal", "adminNegocio"]}>
              <GestionEmpleados />
            </RoleGuard>
          }
        />
        <Route
          path="/citas"
          element={
            <RoleGuard allow={["adminNearbiz", "personal", "adminNegocio"]}>
              <Citas />
            </RoleGuard>
          }
        />
        <Route
          path="/valoraciones"
          element={
            <RoleGuard allow={["adminNearbiz", "personal", "adminNegocio"]}>
              <Valoraciones />
            </RoleGuard>
          }
        />
      </Route>
    </Routes>
  );
}
