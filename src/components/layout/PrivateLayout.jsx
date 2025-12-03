
import NavbarInicio from "../Navbar/NavbarInicio";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function PrivateLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);


  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    
    if (hasRedirected) return;

    const roles = user.roles || [];

   
    if (roles.includes("adminNearbiz") || roles.includes("personal")) {
      navigate("/solicitudes-empresas", { replace: true });
      setHasRedirected(true); 
    }

  }, [user, navigate, hasRedirected]);

  if (!user) return null;

  return (
    <div className="nb-shell">
      <NavbarInicio onMenuClick={() => setOpen(true)} user={user} />

      <div className="nb-main">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <main className="nb-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
