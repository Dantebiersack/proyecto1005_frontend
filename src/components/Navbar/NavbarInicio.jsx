import { Link } from "react-router-dom";
import { MdMenu } from "react-icons/md";
import { useAuth } from "../../auth/AuthContext";
import "./NavbarInicio.css";

function NavbarInicio({ onMenuClick }) {
  const { user } = useAuth();
  const isAuth = !!user;

  return (
    <header className="navbar-inicio">
      <div className="navbar-container">
        {/* logo */}
        <div className="logo-container">
          <img
            src="https://i.pinimg.com/736x/3b/d8/f6/3bd8f650d3ec2b5a943f441560de65a4.jpg"
            alt="NearBiz Logo"
            className="navbar-logo"
          />
          <span className="logo-text">NEARBIZ</span>
        </div>

        {/* derecha */}
        {isAuth ? (
          <div className="navbar-right">
            {/* botón hamburguesa */}
            <button
              type="button"
              className="navbar-icon-btn"
              onClick={onMenuClick}
              aria-label="Abrir menú"
            >
              <MdMenu size={26} />
            </button>
          </div>
        ) : (
          <nav className="navbar-links">
            <Link to="/">Inicio</Link>
            <Link to="/login">Iniciar sesión</Link>
          </nav>
        )}
      </div>
    </header>
  );
}

export default NavbarInicio;
