import "./NavbarInicio.css";

function NavbarInicio() {
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

        <nav className="navbar-links">
          <a href="/">Inicio</a>
          <a href="/login">Iniciar Sesion</a>
        </nav>
      </div>
    </header>
  );
}

export default NavbarInicio;
