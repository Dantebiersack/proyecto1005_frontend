import { NavLink, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import "./Sidebar.css";

import {
  MdBusiness,
  MdGroup,
  MdEvent,
  MdStarRate,
  MdManageAccounts,
  MdAssignment,
  MdClose,
  MdCreditCard,
} from "react-icons/md";
const sections = [
  {
    title: "Personal NearBiz",
    items: [
      {
        to: "/gestion-empresas",
        label: "Gestión de empresas",
        roles: ["adminNearbiz", "personal", "adminNegocio"],
        Icon: MdBusiness,
      },
      {
        to: "/gestion-usuarios",
        label: "Gestión de usuarios",
        roles: ["adminNearbiz", "personal", "adminNegocio"],
        Icon: MdGroup,
      },
      {
        to: "/solicitudes-empresas",
        label: "Solicitudes de empresas",
        roles: ["adminNearbiz", "personal", "adminNegocio"],
        Icon: MdAssignment,
      },
      {
        to: "/gestion-cuenta",
        label: "Gestión de cuenta",
        roles: ["adminNearbiz", "personal", "adminNegocio"],
        Icon: MdManageAccounts,
      },
      {
        to: "/gestion-membresias",
        label: "Membresías",
        roles: ["adminNearbiz"],
        Icon: MdCreditCard,
      },
      {
        to: "/gestion-citas",
        label: "Citas",
        roles: ["adminNearbiz"],
        Icon: MdEvent,
      }
    ],
  },
  {
    title: "Negocios",
    items: [
      {
        to: "/mi-empresa",
        label: "Mi empresa",
        roles: ["adminNearbiz", "personal", "adminNegocio"],
        Icon: MdBusiness,
      },
      {
        to: "/gestion-empleados",
        label: "Gestión empleados",
        roles: ["adminNearbiz", "personal", "adminNegocio"],
        Icon: MdGroup,
      },
      {
        to: "/citas",
        label: "Citas",
        roles: ["adminNearbiz", "personal", "adminNegocio"],
        Icon: MdEvent,
      },
      {
        to: "/valoraciones",
        label: "Valoraciones",
        roles: ["adminNearbiz", "personal", "adminNegocio"],
        Icon: MdStarRate,
      },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  // <-- props bien
  const { user, logout } = useAuth();
  const roles = user?.roles ?? [];
  const location = useLocation();

  // Esc para cerrar
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  // Cierra al cambiar de ruta
  useEffect(() => {
    if (open) onClose();
  }, [location.pathname]); // eslint-disable-line

  return (
    <>
      <div className={`nb-overlay ${open ? "open" : ""}`} onClick={onClose} />

      <aside className={`nb-sidebar ${open ? "open" : ""}`}>
        <button className="nb-close-btn" onClick={onClose} aria-label="Cerrar">
          <MdClose size={20} color="#fff" />
        </button>

        <div className="nb-user">
          <img className="nb-avatar" src="https://i.pravatar.cc/80" alt="" />
          <div>
            <div className="nb-name">{user?.name ?? "Invitado"}</div>
            <div className="nb-email">{user?.email ?? "sin-correo"}</div>
          </div>
        </div>

        <nav className="nb-sections">
          {sections.map((sec) => {
            const visible = sec.items.filter((i) =>
              i.roles.some((r) => roles.includes(r))
            );
            if (!visible.length) return null;
            return (
              <div className="nb-section" key={sec.title}>
                <div className="nb-section-title">{sec.title}</div>
                <ul>
                  {visible.map((it) => (
                    <li key={it.to}>
                      <NavLink
                        to={it.to}
                        className={({ isActive }) =>
                          "nb-link" + (isActive ? " active" : "")
                        }
                        onClick={onClose}
                      >
                        {it.Icon && <it.Icon className="nb-icon" size={18} />}
                        {it.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="nb-footer">
          <button className="nb-logout" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
