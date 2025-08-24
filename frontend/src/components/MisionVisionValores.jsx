import React from "react";
import { Card, Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";

const TarjetaMVV = ({ titulo, contenido, color, imagen }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <Card
        className="shadow-sm text-center text-white border-0"
        style={{
          background: color,
          minHeight: "60px",
          borderRadius: "20px",
        }}
      >
        <Card.Body className="d-flex flex-column justify-content-between p-4">
          <div>
            <h3 className="fw-bold">{titulo}</h3>
            <hr className="bg-light opacity-100" />
            <p className="fs-6">{contenido}</p>
          </div>
          <img
            src={imagen}
            alt={titulo}
            style={{ width: "270px", alignSelf: "center" }}
          />
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export const MisionVisionValores = () => {
  return (
    <Container className="my-5">
      <Row className="g-4 justify-content-center">
        <Col xs={12} md={4}>
          <TarjetaMVV
            titulo="Misión"
            contenido="Brindar un servicio de salud integral, con calidad y calidez, para mejorar el bienestar de nuestros pacientes y comunidad."
            color="#2A5E97"
            imagen="/valores/mision2.png"
          />
        </Col>
        <Col xs={12} md={4}>
          <TarjetaMVV
            titulo="Visión"
            contenido="Ser reconocidos como una institución líder en salud, innovación y compromiso social, generando un impacto positivo en la sociedad."
            color="#E5B143"
            imagen="/valores/vision.png"
          />
        </Col>
        <Col xs={12} md={4}>
          <TarjetaMVV
            titulo="Valores"
            contenido="Responsabilidad, respeto, empatía, innovación y trabajo en equipo son los pilares que guían nuestro accionar diario."
            color="#248231"
            imagen="/valores/valores.png"
          />
        </Col>
      </Row>
    </Container>
  );
};
