// src/components/layout/PrivateLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import NavbarInicio from "../Navbar/NavbarInicio";
import { useAuth } from "../../auth/AuthContext";
import "./PrivateLayout.css";

export default function PrivateLayout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="nb-app">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      {/* Usamos tu Navbar como topbar en privado, con botón de menú */}
      <NavbarInicio showMenu onMenuClick={() => setOpen(true)} />
      <main className="nb-content">
        <Outlet />
      </main>
    </div>
  );
}
