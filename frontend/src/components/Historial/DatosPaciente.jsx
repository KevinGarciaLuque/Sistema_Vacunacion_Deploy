import React, { useState } from "react";
import { Card, Button, Collapse, Row, Col } from "react-bootstrap"; // <-- AGREGADO Row, Col
import {
  FaUser,
  FaIdCard,
  FaBirthdayCake,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaChevronDown,
  FaChevronUp,
  FaUserTie
} from "react-icons/fa";

const DatosPaciente = ({ usuario }) => {
  const [open, setOpen] = useState(false);

  if (!usuario) return null;

  // Formatear fecha para mostrar solo yyyy-MM-dd
  const formateaFecha = (fecha) => {
    if (!fecha) return "—";
    return fecha.split("T")[0];
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap">
          <div className="d-flex align-items-center flex-wrap">
            <h4 className="fw-bold mb-0 me-3 d-flex align-items-center">
              <FaUser className="me-2 text-primary" />        
              {usuario.nombre_completo || "Nombre no disponible"}
            </h4>            
          </div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setOpen(!open)}
            aria-controls="collapse-info-paciente"
            aria-expanded={open}
          >
            {open ? (
              <>
                <FaChevronUp className="me-1" />
                Ocultar
              </>
            ) : (
              <>
                <FaChevronDown className="me-1" />
                Mostrar
              </>
            )}
          </Button>
        </div>

        <Collapse in={open}>
          <div>
            <Row>
              <Col md={6} className="mb-2">
                <FaIdCard className="me-1 text-secondary" />
                <strong>DNI:</strong> {usuario?.dni || "—"}
              </Col>
              <Col md={6} className="mb-2">
                <FaUser className="me-1 text-secondary" />
                <strong>Nombre:</strong> {usuario?.nombre_completo || "—"}
              </Col>
              <Col md={6} className="mb-2">
                <FaBirthdayCake className="me-1 text-secondary" />
                <strong>Fecha Nacimiento:</strong>{" "}
                {usuario?.fecha_nacimiento
                  ? new Date(usuario.fecha_nacimiento).toLocaleDateString("es-ES")
                  : "—"}
              </Col>
              <Col md={6} className="mb-2">
                <FaBirthdayCake className="me-1 text-secondary" />
                <strong>Edad:</strong> {usuario?.edad || "—"}
              </Col>
              <Col md={6} className="mb-2">
                <FaMapMarkerAlt className="me-1 text-secondary" />
                <strong>Dirección:</strong> {usuario?.direccion || "—"}
              </Col>
              <Col md={6} className="mb-2">
                <FaPhone className="me-1 text-secondary" />
                <strong>Teléfono:</strong> {usuario?.telefono || "—"}
              </Col>
              <Col md={6} className="mb-2">
                <FaEnvelope className="me-1 text-secondary" />
                <strong>Correo:</strong> {usuario?.correo || "—"}
              </Col>
              <Col md={6} className="mb-2">
                <FaBriefcase className="me-1 text-secondary" />
                <strong>Área Laboral:</strong>{" "}
                {usuario?.area_laboral && usuario?.area_laboral.trim() !== ""
                  ? usuario.area_laboral
                  : "No especificado"}
              </Col>
              <Col md={6} className="mb-2">
                <FaUserTie className="me-1 text-secondary" />
                <strong>Cargo:</strong>{" "}
                {usuario?.cargo && usuario?.cargo.trim() !== ""
                  ? usuario.cargo
                  : "No especificado"}
              </Col>
            </Row>
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );
};

export default DatosPaciente;
