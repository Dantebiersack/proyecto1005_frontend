import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarInicio from "../Navbar/NavbarInicio.jsx";
import "./Inicio.css";

export default function Inicio() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [modal, setModal] = useState(null);

  /* ===========================
         IMÁGENES DEL CARRUSEL
     =========================== */
  const images = [
    "https://cdn-3.expansion.mx/dims4/default/6d3c446/2147483647/strip/true/crop/1347x778+0+0/resize/1200x693!/format/webp/quality/60/?url=https%3A%2F%2Fcherry-brightspot.s3.amazonaws.com%2F89%2Fb8%2F55cd36654da795d325a1cdb280e7%2Fistock-618049200.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStPzJFfnRfEll3OnPruBW5N5BFrqzGsN2EGAj14Rh_dStPSrhuP4SZck9uH34-keqqvvg&usqp=CAU",
    "https://www.shutterstock.com/image-photo/business-network-concept-human-video-260nw-2112385895.jpg",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [images.length]);

  /* ===========================
            TEXTOS
     =========================== */
  const info = {
    nosotros: {
      title: "Sobre Nosotros",
      text:
        "Somos una empresa que busca ayudarte a mantener organizadas tus citas con tus clientes, de modo que tengas todo al alcance de tus manos. Nuestra misión es simplificar la gestión de tu tiempo y fortalecer la relación con tus clientes mediante una plataforma intuitiva, rápida y segura.",
    },
    ofrecemos: {
      title: "Qué te ofrecemos",
      text:
        "Digitaliza tu negocio, aumenta tu visibilidad, automatiza tus citas y permite que tus clientes agenden de forma rápida y segura. NearBiz te ofrece herramientas y métricas para mejorar el servicio y la relación con tus clientes.",
    },
    app: {
      title: "Aplicación Móvil",
      text:
        "Nuestra app permite que tus clientes te encuentren rápidamente por ubicación y agenden citas sin complicaciones, dentro de un entorno seguro y moderno.",
    },
  };

  /* ===========================
            RENDER
     =========================== */
  return (
    <div className="inicio-container">
      <NavbarInicio />

      {/* ===========================
              CARRUSEL
          =========================== */}
      <div className="carrusel pequeño">
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
            NearBiz <br />
            <span>No busques, encuentra</span>
          </h1>
        </div>
      </div>

      {/* ===========================
            TARJETAS INFORMATIVAS
          =========================== */}
      <section className="info-section nueva">
        {Object.keys(info).map((key) => (
          <div
            className="info-card nueva-card"
            key={key}
            onClick={() => setModal(key)}
          >
            <img
              src={
                key === "nosotros"
                  ? "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  : key === "ofrecemos"
                  ? "https://cdn-icons-png.flaticon.com/512/7915/7915523.png"
                  : "https://cdn-icons-png.flaticon.com/128/3437/3437364.png"
              }
              alt={info[key].title}
            />
            <h3>{info[key].title}</h3>
          </div>
        ))}
      </section>

      {/* ===========================
                CTA FINAL
          =========================== */}
      <div className="cta-box">
        <h2>Bienvenido a NearBiz</h2>
        <p>
          Únete a nuestra red de negocios digitales.  
          Envía tu solicitud de registro y recibe en tu correo los accesos para administrar tu empresa.
        </p>

        <button
          className="cta-btn"
          onClick={() => navigate("/registro-empresa")}
        >
          Enviar solicitud de registro de mi empresa
        </button>
      </div>

      {/* ===========================
                MODAL
          =========================== */}
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
