import React from "react";
import { Table, Card, Spinner, Badge } from "react-bootstrap";

const TablaBitacora = ({ registros, loading, formatearFecha, error }) => {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Cargando registros...</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ maxHeight: "30vh", overflowY: "auto" }}>
            <Table striped bordered hover className="mb-0">
              <thead>
                <tr style={{ background: "#171E37", color: "white" }}>
                  <th style={{ position: "sticky", top: 0, background: "#171E37", color: "white" }}>ID</th>
                  <th style={{ position: "sticky", top: 0, background: "#171E37", color: "white" }}>Fecha</th>
                  <th style={{ position: "sticky", top: 0, background: "#171E37", color: "white" }}>Usuario</th>
                  <th style={{ position: "sticky", top: 0, background: "#171E37", color: "white" }}>Acción</th>
                  <th style={{ position: "sticky", top: 0, background: "#171E37", color: "white" }}>Realizado por</th>
                </tr>
              </thead>
              <tbody>
                {registros.length > 0 ? (
                  registros.map((registro) => (
                    <tr key={`${registro.id}-${registro.fecha}`}>
                      <td>{registro.id}</td>
                      <td>{formatearFecha(registro.fecha)}</td>
                      <td>
                        {registro.usuario_id ? (
                          <Badge bg="info">
                            {registro.nombre_usuario || `ID: ${registro.usuario_id}`}
                          </Badge>
                        ) : (
                          <Badge bg="secondary">Sistema</Badge>
                        )}
                      </td>
                      <td>{registro.accion}</td>
                      <td>{registro.realizado_por}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      {error ? "Error al cargar datos" : "No se encontraron registros"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default TablaBitacora;
