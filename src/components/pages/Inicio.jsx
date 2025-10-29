import { useState, useEffect } from "react";
import NavbarInicio from "../Navbar/NavbarInicio";
import "./Inicio.css";

function Inicio() {
  const [index, setIndex] = useState(0);
  const [modal, setModal] = useState(null);

  const images = [
    "https://www.elimparcial.com/resizer/v2/DCCKBIIT4ZALBOOLPZTAR52BGI.jpg?auth=cd496687fa19aeab85c6813df7bac72b36a94973776bfe9dadc771fcb8ad2b8f&smart=true&width=1200&height=800&quality=70",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf_i1749kHYlSThnArAgqOf_9ehCpoMU0Prw&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTY5Rc1Uh9p_NbRU_6e4iUnVVHTQ-iRIpuSA&s",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, );

  const info = {
    nosotros: {
      title: "Sobre Nosotros",
      text: "Somos una empresa que busca ayudarte a mantener organizadas tus citas con tus clientes, de modo que tengas todo al alcance de tus manos. Nuestra misión es simplificar la gestión de tu tiempo y fortalecer la relación con tus clientes mediante una plataforma intuitiva, rápida y segura. NearBiz nació para conectar negocios y personas de manera más eficiente, moderna y confiable.",
    },
    ofrecemos: {
      title: "Qué te ofrecemos",
      text: "Te ofrecemos la oportunidad de digitalizar tu negocio y formar parte de una red de empresas confiables. Con NearBiz podrás aumentar tu visibilidad, automatizar tus citas, ofrecer horarios flexibles y permitir que tus clientes agenden de forma rápida y segura. Además, tendrás acceso a métricas y herramientas para mejorar la atención en tu empresa y la satisfacción de tus clientes.",
    },
    app: {
      title: "Información de nuestra aplicación",
      text: "Nuestra aplicación móvil permite que tus clientes te encuentren fácilmente por ubicación y agenden citas contigo sin complicaciones. Todo dentro de un entorno seguro, moderno y personalizado. Con NearBiz, tu negocio estará más cerca que nunca de tus clientes y tu gestión será más simple que nunca.",
    },
  };

  return (
    <div className="inicio-container">
      <NavbarInicio />

      {/* CARRUSEL */}
      <div className="carrusel">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`slide-${i}`}
            className={`carrusel-img ${i === index ? "active" : ""}`}
          />
        ))}
        <div className="overlay">
          <h1 className="carrusel-title">
            NearBiz: <span>No busques, encuentra.</span>
            <br />
            <small>Tu próxima cita te espera.</small>
          </h1>
        </div>
      </div>

      {/* CUADROS INFORMATIVOS */}
      <section className="info-section">
        <div className="info-card" onClick={() => setModal("nosotros")}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNvSbBRnx40soHLYHO5mhnbMJy5_bGhKn_Rg&s"
            alt="Sobre Nosotros"
          />
          <h3>Sobre Nosotros</h3>
        </div>

        <div className="info-card" onClick={() => setModal("ofrecemos")}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjG-3tyPAPD_K4JmwIFUwzLnTyMq6_B-hQxQ&s"
            alt="Qué te ofrecemos"
          />
          <h3>Qué te ofrecemos</h3>
        </div>

        <div className="info-card" onClick={() => setModal("app")}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOCm3DqsYqw3iAmXRNhtvgSwgaXuaqq2vnnA&s"
            alt="App"
          />
          <h3>Información de nuestra app</h3>
        </div>
      </section>

      {/* BOTONES ABAJO */}
      <div className="hero-buttons">
        <button className="btn-primary">Ver Membresías</button>
        <button className="btn-secondary">Registrar mi Empresa</button>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{info[modal].title}</h2>
            <p>{info[modal].text}</p>
            <button onClick={() => setModal(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inicio;
