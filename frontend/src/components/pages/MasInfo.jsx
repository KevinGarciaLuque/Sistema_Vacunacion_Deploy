import React from "react";
import { Container, Row, Col, Button, Accordion, Card } from "react-bootstrap";
import {
  FaSyringe,
  FaShieldAlt,
  FaGlobeAmericas,
  FaInfoCircle,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "../styles/MasInfo.css";

const MasInfo = () => (
  <section className="mas-info bg-light py-5">
    <Container>
      {/* Encabezado */}
      <Row className="mb-5 text-center">
        <Col>
          <h2 className="fw-bold">Aprende sobre Vacunación con OPS</h2>
          <p className="lead text-muted">
            Recursos esenciales y datos actualizados de la OPS para fortalecer la inmunización.
          </p>
        </Col>
      </Row>

      {/* Tarjetas informativas */}
      <Row className="text-center g-4 mb-5">
        <Col md={6} lg={3}>
          <Card className="info-card h-100 shadow-sm border-0">
            <FaSyringe className="info-icon mb-3" />
            <Card.Body>
              <Card.Title>Eficacia comprobada</Card.Title>
              <Card.Text>
                La vacunación previene enfermedades graves como sarampión, polio y difteria.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="info-card h-100 shadow-sm border-0">
            <FaShieldAlt className="info-icon mb-3" />
            <Card.Body>
              <Card.Title>Seguridad garantizada</Card.Title>
              <Card.Text>
                Las vacunas son evaluadas rigurosamente por la OMS y organismos internacionales.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="info-card h-100 shadow-sm border-0">
            <FaGlobeAmericas className="info-icon mb-3" />
            <Card.Body>
              <Card.Title>Campañas regionales</Card.Title>
              <Card.Text>
                La OPS coordina campañas anuales como la Semana de Vacunación en las Américas.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="info-card h-100 shadow-sm border-0">
            <FaInfoCircle className="info-icon mb-3" />
            <Card.Body>
              <Card.Title>Recursos confiables</Card.Title>
              <Card.Text>
                Accede a guías, boletines y material educativo verificado por la OPS.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Preguntas frecuentes */}
      <Row className="mt-4">
        <Col lg={8} className="mx-auto">
          <h3 className="text-center mb-4 fw-bold">Preguntas Frecuentes</h3>
          <Accordion flush>
            <Accordion.Item eventKey="0">
              <Accordion.Header>¿Cuántas enfermedades se pueden prevenir con vacunas?</Accordion.Header>
              <Accordion.Body>
                Actualmente existen vacunas para al menos 27 enfermedades prevenibles, según la OPS.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>¿Qué cobertura de vacunación se recomienda?</Accordion.Header>
              <Accordion.Body>
                La OPS recomienda una cobertura superior al 95% para alcanzar la inmunidad colectiva.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>¿Dónde puedo consultar información oficial?</Accordion.Header>
              <Accordion.Body>
                Puedes acceder al sitio oficial de la OPS:{" "}
                <a
                  href="https://www.paho.org/es/temas/inmunizacion"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  paho.org/inmunizacion
                </a>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
      </Row>

      {/* CTA final */}
      <Row className="mt-5 text-center">
        <Col>
          <Button
            as="a"
            href="https://www.paho.org/es/temas/inmunizacion"
            target="_blank"
            rel="noopener noreferrer"
            variant="outline-primary"
            size="lg"
          >
            Explora más en la OPS
          </Button>
        </Col>
      </Row>
    </Container>
  </section>
);

export default MasInfo;
