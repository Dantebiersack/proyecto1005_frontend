import { Routes, Route } from "react-router-dom";
import PrivateLayout from "./components/layout/PrivateLayout.jsx";
import RoleGuard from "./components/RoleGuard.jsx";

import LandingOrHome from "./components/pages/LandingOrHome.jsx";
import Login from "./components/pages/login.jsx";

// Negocio
import MiEmpresa from "./components/pages/Negocio/MiEmpresa.jsx";
import GestionEmpleados from "./components/pages/Negocio/GestionEmpleados.jsx";
import Citas from "./components/pages/Negocio/CitasNegocio.jsx";
import Valoraciones from "./components/pages/Negocio/Valoraciones.jsx";
import RegistroEmpresa from "./components/pages/Negocio/RegistroEmpresa.jsx";
import Categorias from "./components/pages/personalNearbiz/GestionCategorias.jsx";

// Personal Nearbiz
import GestionEmpresas from "./components/pages/personalNearbiz/GestionEmpresas.jsx";
import GestionPersonal from "./components/pages/personalNearbiz/GestionPersonal.jsx";
import SolicitudEmpresas from "./components/pages/personalNearbiz/SolicitudEmpresas.jsx";
import GestionCuenta from "./components/pages/personalNearbiz/GestionCuenta.jsx";
import GestionUsuarios from "./components/pages/personalNearbiz/GestionUsuarios.jsx";
import GestionMembresias from "./components/pages/personalNearbiz/GestionMembresias.jsx";
import GestionCitas from "./components/pages/personalNearbiz/GestionCitas.jsx";
import ServiciosNegocio from "./components/pages/personalNearbiz/GestionServicios.jsx";

export default function App() {
  return (
    <Routes>
      {/* 👇 aquí ya decide si landing o redirección */}
      <Route path="/" element={<LandingOrHome />} />

      <Route path="/login" element={<Login />} />

      <Route path="/registro-empresa" element={<RegistroEmpresa />} />

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
          path="/categorias"
          element={
            <RoleGuard allow={["adminNearbiz"]}>
              <Categorias />
            </RoleGuard>
          }
        />
        <Route
          path="/gestion-membresias"
          element={
            <RoleGuard allow={["adminNearbiz"]}>
              <GestionMembresias />
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
        <Route
          path="/gestion-citas"
          element={
            <RoleGuard allow={["adminNearbiz"]}>
              <GestionCitas />
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
            <RoleGuard allow={["adminNegocio", "personal"]}>
              <Citas
                isSuperAdmin={false}
                tecnicoActualId={null}
                useRoleEndpoint={true}
              />
            </RoleGuard>
          }
        />
        <Route
          path="/servicios-negocio"
          element={
            <RoleGuard allow={["adminNegocio", "personal"]}>
              <ServiciosNegocio/>
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
