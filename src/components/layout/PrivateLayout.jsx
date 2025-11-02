// src/components/layout/PrivateLayout.jsx
import NavbarInicio from "../Navbar/NavbarInicio";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function PrivateLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="nb-shell">
      {/* header fijo arriba */}
      <NavbarInicio onMenuClick={() => setOpen(true)} user={user} />

      {/* cuerpo: sidebar + content */}
      <div className="nb-main">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <main className="nb-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
