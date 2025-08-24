import React, { useEffect, useState } from "react";
import { Table, Button, Spinner, Alert } from "react-bootstrap";
import { getVacunas, toggleVacunaEstado } from "../../api/vacunas";

export default function AdminVacunas() {
  const [vacunas, setVacunas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const cargarVacunas = async () => {
    setLoading(true);
    try {
      const data = await getVacunas();
      setVacunas(data);
    } catch {
      setMensaje("Error al cargar las vacunas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVacunas();
  }, []);

  const handleToggleEstado = async (id) => {
    setLoading(true);
    try {
      const resp = await toggleVacunaEstado(id);
      setMensaje(resp.mensaje);
      cargarVacunas();
    } catch {
      setMensaje("Error al cambiar el estado de la vacuna.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="mb-4">Gestión de Vacunas</h3>
      {mensaje && <Alert variant={mensaje.includes("activada") ? "success" : "warning"}>{mensaje}</Alert>}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Fabricante</th>
            <th>Dosis requeridas</th>
            <th>Intervalo (días)</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {vacunas.map((v) => (
            <tr key={v.id}>
              <td>{v.nombre}</td>
              <td>{v.fabricante}</td>
              <td>{v.dosis_requeridas}</td>
              <td>{v.intervalo_dias}</td>
              <td>
                <span className={v.activa ? "text-success" : "text-danger"}>
                  {v.activa ? "Activa" : "Inactiva"}
                </span>
              </td>
              <td>
                <Button
                  size="sm"
                  variant={v.activa ? "outline-danger" : "outline-success"}
                  onClick={() => handleToggleEstado(v.id)}
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner size="sm" animation="border" />
                  ) : v.activa ? (
                    "Desactivar"
                  ) : (
                    "Activar"
                  )}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
