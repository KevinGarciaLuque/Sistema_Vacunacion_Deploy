import React, { useEffect, useState } from "react";
import { Spinner, Alert, Card, Row, Col, Container, Button } from "react-bootstrap";
import { getSobreNosotros } from "../../api/sobreNosotros";
import { motion } from "framer-motion";
import {MisionVisionValores} from "../../components/MisionVisionValores"

export const SobreNosotros = () => {
  const [contenido, setContenido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchContenido = async () => {
    try {
      const data = await getSobreNosotros();
      setContenido(data);
    } catch (err) {
      console.error("❌ Error al cargar Sobre Nosotros:", err);
      setError("Error cargando contenido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContenido();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        {error}
      </Alert>
    );
  }

  const obtenerUrlImagen = (url) => {
    if (!url) return "/logo.png";
    if (url.startsWith("http")) return url;
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return `${apiUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">
          {contenido.titulo || "Sobre Nosotros"}
        </h1>
        <h3 className="lead text-muted">
          {contenido.subtitulo || "Subtítulo de sección"}
        </h3>
      </div>

      <MisionVisionValores />


      {contenido.secciones?.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {contenido.secciones.map((sec, idx) => (
            <Col key={idx}>
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0px 8px 20px rgba(0,0,0,0.15)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="h-100 shadow-sm border-0 rounded-4">
                  {sec.imagen && (
                    <Card.Img
                      variant="top"
                      src={obtenerUrlImagen(sec.imagen)}
                      alt={sec.titulo}
                      style={{ height: "220px", objectFit: "cover" }}
                      className="rounded-top-4"
                    />
                  )}
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="fw-bold text-success">
                      {sec.titulo}
                    </Card.Title>
                    <Card.Text className="text-muted flex-grow-1">
                      {sec.descripcion}
                    </Card.Text>
                    {sec.puntos && sec.puntos.length > 0 && (
                      <ul className="list-unstyled mt-2">
                        {sec.puntos.map((p, i) => (
                          <li key={i} className="d-flex align-items-center">
                            <i className="fas fa-check-circle text-success me-2"></i>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      ) : (
        <p className="text-center text-muted">
          No hay secciones disponibles por el momento.
        </p>
      )}

      <Card className="bg-primary text-white text-center p-5 mt-5 border-0 shadow-sm rounded-3">
        <Card.Body>
          <h2 className="fw-bold mb-3">
            {contenido.ctaTitulo || "¡Actúa ahora por tu salud!"}
          </h2>
          <p className="fs-5 mb-4">
            {contenido.ctaDescripcion ||
              "Consulta tu esquema de vacunación y mantente protegido."}
          </p>
          
        </Card.Body>
      </Card>
    </Container>
  );
};
