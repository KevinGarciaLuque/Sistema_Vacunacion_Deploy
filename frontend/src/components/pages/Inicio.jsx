import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSyringe, FaHeartbeat, FaShieldAlt, FaUsers } from "react-icons/fa";
import {
  Container,
  Row,
  Col,
  Carousel,
  Button,
  Card,
  Badge,
  Spinner,
  Alert,
  Ratio,
} from "react-bootstrap";
import { FiInfo } from "react-icons/fi";
import { Navbar } from "../../components/layout/Navbar";
import { Aside } from "../../components/layout/Aside";
import api from "../../api/axios";
import "../styles/Inicio.css";

export const Inicio = () => {
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data } = await api.get("/api/carousel");
        setImages(data);
      } catch (err) {
        console.error(err);
        setError("❌ Error al cargar las imágenes del carrusel.");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [images]);

  const features = [
    {
      icon: <FaShieldAlt className="feature-icon" />,
      title: "Vacunarse es protegerse",
      description: "Reduce el riesgo de enfermedades graves y fortalece tu salud.",
    },
    {
      icon: <FaHeartbeat className="feature-icon" />,
      title: "Prevenir es mejor que curar",
      description: "Evita complicaciones futuras actuando a tiempo con tus vacunas.",
    },
    {
      icon: <FaSyringe className="feature-icon" />,
      title: "Una vacuna, mil defensas",
      description: "Cada dosis activa múltiples barreras de protección en tu cuerpo.",
    },
    {
      icon: <FaUsers className="feature-icon" />,
      title: "Cuidarte es cuidar a todos",
      description: "Vacunarte ayuda a proteger también a quienes te rodean.",
    },
  ];

  return (
    <Container fluid className="main-content-container px-0">
      <Row className="g-0">
        <Navbar />
        <Col className="content-col py-4 px-3 px-md-4">
          <Card className="shadow border-0 overflow-hidden">
            <Card.Body className="p-0">
              {/* Hero Section */}
              <div className="hero-section text-center p-4 p-md-5">
              <Badge pill bg="light" text="dark" className="mb-3 px-3 py-2">
              <h2 style={{ color: "black" }}>Control de Vacunas</h2>
              <h1 className="fw-bold" style={{ color: "black" }}>Hospital María,</h1>
               <h2 style={{ color: "black" }}>Especialidades Pediátricas</h2>
              </Badge>

                <h1 className="display-5 fw-bold text-dark mb-3">
                  Protegiendo tu salud,{" "}
                  <span className="text-primary">simplificando tu vida</span>
                </h1>
                <p className="lead text-muted mb-4">
                  Gestiona tus registros de vacunación de manera segura y accesible desde cualquier lugar
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  <Button
                    variant="primary"
                    size="lg"
                    className="px-4 rounded-pill fw-semibold shadow-sm"
                    as={Link}
                    to="/registro"
                  >
                    Registrate Aquí
                  </Button>
                {/**   <Button
                    variant="outline-primary"
                    size="lg"
                    className="px-4 rounded-pill fw-semibold shadow-sm"
                    as={Link}
                    to="/mas-info"
                  >
                    <FiInfo className="me-2" />
                    Más Información
                  </Button>
                  */}
                </div>
              </div>

              {/* Carousel Section */}
              <Row className="justify-content-center my-2 my-md-3">
                <Col xs={12} md={10} lg={8}>
                  {loading ? (
                    <div className="text-center my-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2">Cargando carrusel...</p>
                    </div>
                  ) : error ? (
                    <Alert variant="danger" className="text-center">
                      {error}
                    </Alert>
                  ) : images.length === 0 ? (
                    <Alert variant="info" className="text-center">
                      No hay imágenes cargadas en el carrusel.
                    </Alert>
                  ) : (
                    <Carousel
                      activeIndex={index}
                      onSelect={handleSelect}
                      controls={images.length > 1}
                      indicators={images.length > 1}
                      className="rounded-3 overflow-hidden shadow-sm"
                    >
                      {images.map((img, idx) => (
                        <Carousel.Item key={idx}>
                          <Ratio aspectRatio="16x9">
                            <img
                              className="d-block w-100 h-100 rounded-3"
                              src={img}
                              alt={`Slide ${idx + 1}`}
                              style={{
                                objectFit: "contain",
                              }}
                            />
                          </Ratio>
                          <Carousel.Caption className="d-none d-md-block bg-dark bg-opacity-50 rounded-3 p-3">
                            <h5 className="text-white">Sistema de vacunación HMEP</h5>
                            <p className="text-white-80">La mejor manera de proteger tu salud</p>
                          </Carousel.Caption>
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  )}
                </Col>
              </Row>




              {/* Features Section */}
              <div className="features-section bg-light p-4 p-md-5">
                <h2 className="text-center mb-4 mb-md-5 fw-bold">
                  Cuatro razones para vacunarte
                  <div
                    className="mx-auto mt-3"
                    style={{
                      height: "3px",
                      width: "80px",
                      background: "linear-gradient(90deg, #657eff 0%, #8b5cf6 100%)",
                      borderRadius: "3px",
                    }}
                  ></div>
                </h2>
                <Row className="g-4">
                  {features.map((feature, index) => (
                    <Col key={index} md={6} lg={3} className="feature-col">
                      <Card className="h-100 border-0 shadow-sm hover-lift">
                        <Card.Body className="text-center p-4">
                          <div className="icon-wrapper bg-primary-light text-primary rounded-circle mx-auto mb-3">
                            {feature.icon}
                          </div>
                          <h5 className="fw-bold mb-3">{feature.title}</h5>
                          <p className="text-muted mb-0">{feature.description}</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>

              {/* CTA Section */}
              <div className="cta-section text-center p-4 p-md-5 bg-primary-gradient text-white">
                <h2 className="fw-bold mb-3">¿Listo para comenzar?</h2>
                <p className="lead mb-4 opacity-75">
                  Regístrate ahora y lleva el control de tu salud en tus manos
                </p>
                <Button
                  variant="light"
                  size="lg"
                  className="px-4 rounded-pill fw-semibold shadow-sm"
                  as={Link}
                  to="/registro"
                >
                  Comenzar ahora
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
