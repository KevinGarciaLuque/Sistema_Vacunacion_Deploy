import React from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup,
  Badge,
} from "react-bootstrap";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiSend,
  FiArrowLeft,
} from "react-icons/fi";
import { Link } from "react-router-dom";

export const Contacto = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para manejar el envío del formulario
    alert("Mensaje enviado correctamente");
  };

  return (
    <Container fluid className="main-content-container px-0">
      <Row className="g-0">
        <Col className="content-col py-4 px-3 px-md-4">
          <Card className="shadow border-0 overflow-hidden">
            <Card.Body className="p-0">
              {/* Header con botón de volver */}
              <div className="bg-primary-gradient text-white p-4 p-md-5 position-relative">
                <Button
                  as={Link}
                  to="/"
                  variant="light"
                  size="sm"
                  className="position-absolute top-0 start-0 m-3 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "40px", height: "40px" }}
                >
                  <FiArrowLeft size={18} />
                </Button>
                <h1 className="text-center mb-3 fw-bold text-black">
                  Contáctanos
                </h1>
                <p className="text-center mb-0 opacity-75 text-black">
                  ¿Tienes preguntas? Escríbenos y te responderemos lo antes posible.
                </p>
              </div>

              <Row className="g-4 p-4 p-md-5">
                {/* Información de contacto */}
                <Col md={5}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="p-4">
                      <h4 className="fw-bold mb-4">
                        <Badge bg="primary" className="me-2">
                          •
                        </Badge>
                        Información de contacto
                      </h4>

                      <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex align-items-start border-0 py-3" style={{ backgroundColor: 'transparent' }}>
                          <FiMail className="text-primary mt-1 me-3" size={20} />
                          <div>
                            <h6 className="fw-bold mb-1">Correo electrónico</h6>
                            <p className="text-muted mb-0">
                              info@hospitalmaria.hn
                            </p>
                          </div>
                        </ListGroup.Item>

                        <ListGroup.Item className="d-flex align-items-start border-0 py-3" style={{ backgroundColor: 'transparent' }}>
                          <FiPhone className="text-primary mt-1 me-3" size={20} />
                          <div>
                            <h6 className="fw-bold mb-1">Teléfono</h6>
                            <p className="text-muted mb-0">+504 2235-1011</p>
                          </div>
                        </ListGroup.Item>

                        <ListGroup.Item className="d-flex align-items-start border-0 py-3" style={{ backgroundColor: 'transparent' }}>
                          <FiMapPin className="text-primary mt-1 me-3" size={20} />
                          <div>
                            <h6 className="fw-bold mb-1">Dirección</h6>
                            <p className="text-muted mb-0">
                              Boulevard Suyapa, contiguo a la UNAH, Tegucigalpa, Honduras
                            </p>
                          </div>
                        </ListGroup.Item>

                        <ListGroup.Item className="d-flex align-items-start border-0 py-3" style={{ backgroundColor: 'transparent' }}>
                          <FiClock className="text-primary mt-1 me-3" size={20} />
                          <div>
                            <h6 className="fw-bold mb-1">
                              Horario de atención
                            </h6>
                            <p className="text-muted mb-0">
                              Lunes a Viernes: 7:00 AM - 4:00 PM<br />
                              Sábado y Domingo: Emergencias 24 horas
                            </p>
                          </div>
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Formulario de contacto */}
                <Col md={7}>
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="p-4">
                      <h4 className="fw-bold mb-4">
                        <Badge bg="primary" className="me-2">
                          •
                        </Badge>
                        Envíanos un mensaje
                      </h4>

                      <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                          <Col md={6}>
                            <Form.Group controlId="formNombre">
                              <Form.Label>Nombre completo</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Ingresa tu nombre"
                                required
                              />
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group controlId="formEmail">
                              <Form.Label>Correo electrónico</Form.Label>
                              <Form.Control
                                type="email"
                                placeholder="Ingresa tu email"
                                required
                              />
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group controlId="formTelefono">
                              <Form.Label>Teléfono (opcional)</Form.Label>
                              <Form.Control
                                type="tel"
                                placeholder="Ingresa tu teléfono"
                              />
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group controlId="formAsunto">
                              <Form.Label>Asunto</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="¿Sobre qué quieres contactarnos?"
                                required
                              />
                            </Form.Group>
                          </Col>

                          <Col xs={12}>
                            <Form.Group controlId="formMensaje">
                              <Form.Label>Mensaje</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={5}
                                placeholder="Escribe tu mensaje aquí..."
                                required
                              />
                            </Form.Group>
                          </Col>

                          <Col xs={12} className="mt-2">
                            <Button
                              variant="primary"
                              type="submit"
                              className="px-4 rounded-pill fw-semibold shadow-sm"
                            >
                              <FiSend className="me-2" />
                              Enviar mensaje
                            </Button>
                          </Col>
                        </Row>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};