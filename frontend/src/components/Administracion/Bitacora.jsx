import React, { useState, useEffect } from "react";
import {
  Table,
  Alert,
  Badge,
  Form,
  Button,
  Spinner,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FiCalendar, FiUser, FiSearch, FiClock } from "react-icons/fi";
import { useDebounce } from "use-debounce";
import { toast } from "react-toastify";
import "../styles/Bitacora.css";
import { fetchBitacora } from "../../api/bitacora";

const Bitacora = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState({
    fechaDesde: "",
    fechaHasta: "",
    usuario: "",
    accion: "",
  });
  
  // Usar debounce para los filtros de texto
  const [debouncedUsuario] = useDebounce(filtros.usuario, 500);
  const [debouncedAccion] = useDebounce(filtros.accion, 500);
  
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    porPagina: 10,
    total: 0,
    totalPaginas: 0,
  });

  useEffect(() => {
    cargarRegistros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginacion.pagina, debouncedUsuario, debouncedAccion, filtros.fechaDesde, filtros.fechaHasta]);

  const cargarRegistros = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        pagina: paginacion.pagina,
        porPagina: paginacion.porPagina,
        ...filtros,
        usuario: debouncedUsuario,
        accion: debouncedAccion,
      };

      const data = await fetchBitacora(params);

      setRegistros(data.registros || []);
      setPaginacion(prev => ({
        ...prev,
        total: data.paginacion?.total || 0,
        totalPaginas: data.paginacion?.totalPaginas || 0,
      }));
    } catch (err) {
      const serverMessage = err.response?.data?.error || err.response?.data?.message;
      const errorMessage = serverMessage || err.message || "Error al cargar los registros de bitácora";
      
      setError(errorMessage);
      setRegistros([]);
      setPaginacion(prev => ({
        ...prev,
        total: 0,
        totalPaginas: 0,
      }));
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();
    // Resetear a la primera página al aplicar nuevos filtros
    setPaginacion(prev => ({ ...prev, pagina: 1 }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: "",
      fechaHasta: "",
      usuario: "",
      accion: "",
    });
    setPaginacion(prev => ({ ...prev, pagina: 1 }));
  };

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPaginas) {
      setPaginacion(prev => ({
        ...prev,
        pagina: nuevaPagina,
      }));
    }
  };

  const formatearFecha = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleString();
    } catch (e) {
      return "Fecha inválida";
    }
  };

  return (
    <div className="bitacora-container">
      <h2 className="mb-4">
        <FiClock className="me-2" />
        Bitácora de Actividades
      </h2>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      {/* Filtros */}
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
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Aplicar Filtros"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Resultados */}
      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Cargando registros...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table striped bordered hover className="bitacora-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Usuario</th>
                      <th>Acción</th>
                      <th>Realizado por</th>
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
                              <Badge bg="info" className="user-badge">
                                {registro.nombre_usuario ||
                                  `ID: ${registro.usuario_id}`}
                              </Badge>
                            ) : (
                              <Badge bg="secondary" className="user-badge">
                                Sistema
                              </Badge>
                            )}
                          </td>
                          <td>{registro.accion}</td>
                          <td>{registro.realizado_por}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          {error
                            ? "Error al cargar datos"
                            : "No se encontraron registros"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Paginación */}
              {paginacion.total > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Mostrando{" "}
                    {(paginacion.pagina - 1) * paginacion.porPagina + 1} -{" "}
                    {Math.min(
                      paginacion.pagina * paginacion.porPagina,
                      paginacion.total
                    )}{" "}
                    de {paginacion.total} registros
                  </div>
                  <div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={paginacion.pagina === 1 || loading}
                      onClick={() => cambiarPagina(paginacion.pagina - 1)}
                      className="me-2"
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={
                        paginacion.pagina * paginacion.porPagina >= paginacion.total ||
                        loading
                      }
                      onClick={() => cambiarPagina(paginacion.pagina + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Bitacora;