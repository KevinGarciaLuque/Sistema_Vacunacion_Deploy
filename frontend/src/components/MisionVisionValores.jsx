import React from "react";
import { Card, Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";

import imgMision from "../assets/valores/mision2.png";
import imgVision from "../assets/valores/vision.png";
import imgValores from "../assets/valores/valores.png";



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
            
           
            color="#2A5E97"
            imagen={imgMision}
          />
        </Col>
        <Col xs={12} md={4}>
          <TarjetaMVV
        
           
            color="#E5B143"
            imagen={imgVision}
          />
        </Col>
        <Col xs={12} md={4}>
          <TarjetaMVV
      
           
            color="#248231"
            imagen={imgValores}
          />
        </Col>
      </Row>
    </Container>
  );
};
