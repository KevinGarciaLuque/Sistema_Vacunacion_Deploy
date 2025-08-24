import React from "react";
import { Container, Row, Col, ListGroup, Button } from "react-bootstrap";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiFacebook,
  FiInstagram,
  FiLinkedin,
} from "react-icons/fi";
import "../styles/Footer.css";

export const Footer = () => {
  return (
    <footer className="site-footer bg-dark text-light pt-5">
      <div className="footer-top">
        <Container>
          <Row className="g-4 g-lg-5">
            {/* Logo y descripción */}
            <Col lg={6}>
              <div className="footer-logo mb-3">
                <h4 className="fw-bold text-white">
                  Hospital María, <p className="text-primary">Especialidades Pediátricas</p>
                </h4>
              </div>
              <p className="footer-text text-light">
                Hospital público de referencia nacional en especialidades pediátricas. Ofrece atención integral y especializada para niños y adolescentes.
              </p>

              <div className="social-links mt-4 d-flex gap-3">
                <a
                  href="https://www.facebook.com/hospitalmariaep"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon text-light fs-5"
                >
                  <FiFacebook />
                </a>
                <a href="https://www.instagram.com/hospital_maria?igsh=MWZiNXV3YmhlN3ZscQ==" className="social-icon text-light fs-5">
                  <FiInstagram />
                </a>
                <a href="https://www.linkedin.com/company/fundaci%C3%B3n-amigos-del-hospital-mar%C3%ADa/" className="social-icon text-light fs-5">
                  <FiLinkedin />
                </a>
              </div>
            </Col>

            {/* Contacto */}
            <Col lg={6}>
              <h5 className="footer-title text-white mb-3">Contáctanos</h5>
              <ListGroup variant="flush" className="footer-list">
                <ListGroup.Item
                  key="direccion"
                  className="footer-item bg-dark text-light border-0 d-flex align-items-center mb-2"
                >
                  <FiMapPin className="me-2 fs-5 text-primary" />
                  <span>Col. Nueva Suyapa, 150 m del Anillo Periférico, Tegucigalpa</span>
                </ListGroup.Item>
                <ListGroup.Item
                  key="telefono"
                  className="footer-item bg-dark text-light border-0 d-flex align-items-center mb-2"
                >
                  <FiPhone className="me-2 fs-5 text-primary" />
                  <span>PBX: +504 2236‑0900 </span>
                </ListGroup.Item>
                <ListGroup.Item
                  key="correo"
                  className="footer-item bg-dark text-light border-0 d-flex align-items-center mb-2"
                >
                  <FiMail className="me-2 fs-5 text-primary" />
                  <span>info@hospitalmaria.org</span>
                </ListGroup.Item>
                
              </ListGroup>

              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                as="a"
                href="https://www.facebook.com/hospitalmariaep"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visita nuestro Facebook
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <div className="footer-bottom border-top border-secondary mt-5">
        <Container>
          <Row className="justify-content-center text-center py-4">
            <Col md={12}>
              <small className="text- d-block mb-3">
                Desarrollado por <strong>Kevin Garcia Luque.</strong>
              </small>
              <small className="text-light d-block mb-2">
                &copy; {new Date().getFullYear()}  Todos los derechos reservados.
              </small>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};
