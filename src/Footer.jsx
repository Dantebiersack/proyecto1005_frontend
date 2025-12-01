import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* COLUMNA 1 */}
        <div className="footer-section">
          <h3>NearBiz</h3>
          <p className="footer-desc">
            Conectando negocios con personas.  
            Simplifica, organiza y haz crecer tu empresa.
          </p>
        </div>

        {/* COLUMNA 2 */}
        <div className="footer-section">
          <h4>Contacto</h4>
          <p> Correo:</p>
          <a href="mailto:nearbizcompany@gmail.com" className="footer-link">
            nearbizcompany@gmail.com
          </a>

          <p style={{ marginTop: "10px" }}> Teléfono:</p>
          <a href="tel:4792903090" className="footer-link">
            479 290 3090
          </a>
        </div>

        {/* COLUMNA 3 */}
        <div className="footer-section">
          <h4>Síguenos</h4>
          <div className="social-icons">

            <a href="#" className="social-icon">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" 
                alt="Instagram" 
              />
            </a>

            <a href="#" className="social-icon">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3670/3670042.png" 
                alt="Facebook" 
              />
            </a>

            <a href="#" className="social-icon">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" 
                alt="TikTok" 
              />
            </a>

          </div>
        </div>

      </div>

      {/* COPYRIGHT */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} NearBiz — Todos los derechos reservados.
      </div>
    </footer>
  );
}
