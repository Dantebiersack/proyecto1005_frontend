// src/components/Navbar/NavbarInicio.jsx
import "./NavbarInicio.css";
import { MdMenu } from "react-icons/md";
import { useAuth } from "../../auth/AuthContext";

function NavbarInicio({ showMenu = false, onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="navbar-inicio">
      <div className="navbar-container">
        <div className="logo-container">
          <img
            src="https://i.pinimg.com/736x/3b/d8/f6/3bd8f650d3ec2b5a943f441560de65a4.jpg"
            alt="NearBiz Logo"
            className="navbar-logo"
          />
          <span className="logo-text">NEARBIZ</span>
        </div>

        {/* Si hay sesión y estamos en zona privada, muestra el botón menú */}
        {showMenu && user ? (
          <button className="navbar-menu-btn" onClick={onMenuClick} aria-label="Abrir menú">
            <MdMenu size={22} />
          </button>
        ) : (
          <nav className="navbar-links">
            <a href="/">Inicio</a>
            <a href="/login">Iniciar Sesion</a>
          </nav>
        )}
      </div>
    </header>
  );
}

export default NavbarInicio;
