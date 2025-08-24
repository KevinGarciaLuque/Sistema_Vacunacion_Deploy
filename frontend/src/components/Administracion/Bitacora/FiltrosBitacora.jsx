import React from "react";
import { Card, Form, Button, Spinner, Row, Col } from "react-bootstrap";
import { FiCalendar, FiUser, FiSearch } from "react-icons/fi";

const FiltrosBitacora = ({
  filtros,
  handleFiltroChange,
  aplicarFiltros,
  limpiarFiltros,
  loading,
}) => {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <h5 className="mb-3">
          <FiSearch className="me-2" />
          Filtros
        </h5>
        <Form onSubmit={aplicarFiltros}>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FiCalendar className="me-1" />
                  Fecha desde
                </Form.Label>
                <Form.Control
                  type="date"
                  name="fechaDesde"
                  value={filtros.fechaDesde}
                  onChange={handleFiltroChange}
                  max={filtros.fechaHasta || undefined}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FiCalendar className="me-1" />
                  Fecha hasta
                </Form.Label>
                <Form.Control
                  type="date"
                  name="fechaHasta"
                  value={filtros.fechaHasta}
                  onChange={handleFiltroChange}
                  min={filtros.fechaDesde || undefined}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FiUser className="me-1" />
                  Usuario
                </Form.Label>
                <Form.Control
                  type="text"
                  name="usuario"
                  value={filtros.usuario}
                  onChange={handleFiltroChange}
                  placeholder="Nombre de usuario"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Acción</Form.Label>
                <Form.Control
                  type="text"
                  name="accion"
                  value={filtros.accion}
                  onChange={handleFiltroChange}
                  placeholder="Tipo de acción"
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="outline-secondary"
              onClick={limpiarFiltros}
              disabled={loading}
            >
              Limpiar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Aplicar Filtros"}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FiltrosBitacora;
