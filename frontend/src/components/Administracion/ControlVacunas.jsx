import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Table,
  Spinner,
  Form,
  Badge,
  Card,
  Alert,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import {
  PencilSquare,
  Trash,
  Power,
  PlusCircle,
  EyeFill,
  CheckCircle,
  XCircle,
} from "react-bootstrap-icons";
import { toast } from "react-toastify";
import { FaCheckCircle } from "react-icons/fa";
import {
  getVacunas,
  addVacuna,
  updateVacuna,
  deleteVacuna,
  toggleVacunaEstado,
} from "../../api/vacunas";
import { getAplicadasHoyPorVacuna } from "../../api/vacunas"; 

const ControlVacunas = () => {
  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    fabricante: "",
    dosis_requeridas: "",
    lote: "",
    fecha_lote: "",
    responsable: "",
    stock_disponible: "",
  });

  const [intervaloCantidad, setIntervaloCantidad] = useState("");
  const [intervaloTipo, setIntervaloTipo] = useState("dias");
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [vacunas, setVacunas] = useState([]);
  const [showListModal, setShowListModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [validated, setValidated] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [vacunaToDelete, setVacunaToDelete] = useState(null);

  useEffect(() => {
    refreshVacunas();
  }, []);

  const refreshVacunas = async () => {
    try {
      setTableLoading(true);
      const data = await getVacunas();
      setVacunas(data.sort((a, b) => b.id - a.id));
    } catch {
      toast.error("Error al cargar las vacunas");
    } finally {
      setTableLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
  
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
  
    try {
      setLoading(true);
      let intervalo_dias = 0;
      const cantidad = parseInt(intervaloCantidad);
      if (!isNaN(cantidad)) {
        if (intervaloTipo === "dias") intervalo_dias = cantidad;
        if (intervaloTipo === "meses") intervalo_dias = cantidad * 30;
        if (intervaloTipo === "anios") intervalo_dias = cantidad * 365;
      }
  
      const stockDisponible = parseInt(formData.stock_disponible) || 0;
      let nuevoStock = stockDisponible;
  
      if (isEditing) {
        const aplicadasHoy = await getAplicadasHoyPorVacuna(formData.id);
        nuevoStock = stockDisponible - aplicadasHoy;
        if (nuevoStock < 0) nuevoStock = 0;
      }
  
      const vacunaData = {
        ...formData,
        intervalo_dias,
        stock_disponible: nuevoStock,
      };
  
      if (isEditing) {
        await updateVacuna(formData.id, vacunaData);
        toast.success(`Vacuna actualizada correctamente. Stock ajustado a ${nuevoStock}`);
      } else {
        await addVacuna(vacunaData);
        toast.success("Vacuna registrada correctamente");
      }
  
      resetForm();
      refreshVacunas();
      setShowSuccessModal(true);
      setShowEditModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al guardar la vacuna");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      nombre: "",
      fabricante: "",
      dosis_requeridas: "",
      lote: "",
      fecha_lote: "",
      responsable: "",
      stock_disponible: "",
    });
    setIntervaloCantidad("");
    setIntervaloTipo("dias");
    setIsEditing(false);
    setValidated(false);
  };

  const handleEdit = (vacuna) => {
    setFormData({
      id: vacuna.id,
      nombre: vacuna.nombre,
      fabricante: vacuna.fabricante,
      dosis_requeridas: vacuna.dosis_requeridas,
      lote: vacuna.lote || "",
      fecha_lote: vacuna.fecha_lote ? vacuna.fecha_lote.split("T")[0] : "",
      responsable: vacuna.responsable || "",
      stock_disponible: vacuna.stock_disponible?.toString() || "",
    });

    const dias = vacuna.intervalo_dias || 0;
    if (dias % 365 === 0 && dias !== 0) {
      setIntervaloTipo("anios");
      setIntervaloCantidad(dias / 365);
    } else if (dias % 30 === 0 && dias !== 0) {
      setIntervaloTipo("meses");
      setIntervaloCantidad(dias / 30);
    } else {
      setIntervaloTipo("dias");
      setIntervaloCantidad(dias);
    }

    setIsEditing(true);
    setShowEditModal(true);
  };

  const confirmarEliminar = (vacuna) => {
    setVacunaToDelete(vacuna);
    setShowDeleteModal(true);
  };

  const eliminarVacunaConfirmada = async () => {
    try {
      await deleteVacuna(vacunaToDelete.id);
      toast.success("Vacuna eliminada correctamente");
      refreshVacunas();
    } catch (error) {
      toast.error("Error al eliminar la vacuna");
    }
    setShowDeleteModal(false);
  };

  const handleToggleEstado = async (id) => {
    try {
      await toggleVacunaEstado(id);
      toast.success("Estado actualizado correctamente");
      refreshVacunas();
    } catch (error) {
      toast.error("Error al cambiar el estado");
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">
              <i className="bi bi-syringe me-2"></i> Control de Vacunas
            </h2>
            <Button
              variant="outline-primary"
              onClick={() => setShowListModal(true)}
              className="d-flex align-items-center"
            >
              <EyeFill className="me-2" /> Ver Listado
            </Button>
          </div>

          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body>
              <h5 className="text-primary mb-4">
                {isEditing ? (
                  <>
                    <PencilSquare className="me-2" /> Editar Vacuna
                  </>
                ) : (
                  <>
                    <PlusCircle className="me-2" /> Registrar Nueva Vacuna
                  </>
                )}
              </h5>

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Ingrese el nombre
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fabricante *</Form.Label>
                      <Form.Control
                        type="text"
                        name="fabricante"
                        value={formData.fabricante}
                        onChange={handleInputChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Ingrese el fabricante
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Dosis Requeridas *</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        name="dosis_requeridas"
                        value={formData.dosis_requeridas}
                        onChange={handleInputChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Ingrese un número válido
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Intervalo entre dosis</Form.Label>
                      <Row>
                        <Col xs={6}>
                          <Form.Control
                            type="number"
                            min="0"
                            placeholder="Cantidad"
                            value={intervaloCantidad}
                            onChange={(e) => setIntervaloCantidad(e.target.value)}
                          />
                        </Col>
                        <Col xs={6}>
                          <Form.Select
                            value={intervaloTipo}
                            onChange={(e) => setIntervaloTipo(e.target.value)}
                          >
                            <option value="dias">Días</option>
                            <option value="meses">Meses</option>
                            <option value="anios">Años</option>
                          </Form.Select>
                        </Col>
                      </Row>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Lote *</Form.Label>
                      <Form.Control
                        type="text"
                        name="lote"
                        value={formData.lote}
                        onChange={handleInputChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Ingrese el número de lote
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha del Lote *</Form.Label>
                      <Form.Control
                        type="date"
                        name="fecha_lote"
                        value={formData.fecha_lote}
                        onChange={handleInputChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Seleccione la fecha del lote
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Responsable *</Form.Label>
                      <Form.Control
                        type="text"
                        name="responsable"
                        value={formData.responsable}
                        onChange={handleInputChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Ingrese el responsable
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Total de vacunas disponibles *</Form.Label>
                      <Form.Control
                        type="number"
                        name="stock_disponible"
                        min="0"
                        value={formData.stock_disponible}
                        onChange={handleInputChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Ingrese la cantidad disponible
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end gap-2">
                  {isEditing && (
                    <Button variant="outline-secondary" onClick={resetForm} disabled={loading}>
                      Cancelar
                    </Button>
                  )}
                  <Button
                    variant={isEditing ? "primary" : "success"}
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <CheckCircle className="me-2" />
                    )}
                    {isEditing ? "Actualizar" : "Registrar"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      {/* Modal de Listado */}
      <Modal
        show={showListModal}
        onHide={() => setShowListModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <EyeFill className="me-2" />
            Listado de Vacunas Registradas
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tableLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-3">Cargando vacunas...</p>
            </div>
          ) : vacunas.length === 0 ? (
            <Alert variant="info" className="text-center">
              No hay vacunas registradas
            </Alert>
          ) : (
            <div className="table-responsive" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <Table striped hover className="align-middle mb-0">
                <thead>
                  <tr style={{ background: "#0d6efd", color: "white" }}>
                    <th>Nombre</th>
                    <th>Fabricante</th>
                    <th className="text-center">Dosis</th>
                    <th className="text-center">Intervalo</th>
                    <th>Lote</th>
                    <th>Fecha Lote</th>
                    <th className="text-center">Stock</th>
                    <th className="text-center">Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {vacunas.map((v) => (
                    <tr key={v.id}>
                      <td>{v.nombre}</td>
                      <td>{v.fabricante}</td>
                      <td className="text-center">{v.dosis_requeridas}</td>
                      <td className="text-center">{v.intervalo_dias || "N/A"}</td>
                      <td>{v.lote || "N/A"}</td>
                      <td>{v.fecha_lote ? v.fecha_lote.split("T")[0] : "N/A"}</td>
                      <td className="text-center">{v.stock_disponible ?? 0}</td>
                      <td className="text-center">
                        <Badge bg={v.activa ? "success" : "danger"} className="px-3 py-2">
                          {v.activa ? "Activa" : "Inactiva"}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Button variant="outline-primary" size="sm" onClick={() => handleEdit(v)} className="me-2" title="Editar">
                          <PencilSquare />
                        </Button>
                        <Button
                          variant={v.activa ? "outline-danger" : "outline-success"}
                          size="sm"
                          onClick={() => handleToggleEstado(v.id)}
                          className="me-2"
                          title={v.activa ? "Desactivar" : "Activar"}
                        >
                          <Power />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => confirmarEliminar(v)}
                          title="Eliminar"
                        >
                          <Trash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowListModal(false)}>
            <XCircle className="me-2" /> Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Edición */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <PencilSquare className="me-2" />
            Editar Vacuna
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Ingrese el nombre
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fabricante *</Form.Label>
                  <Form.Control
                    type="text"
                    name="fabricante"
                    value={formData.fabricante}
                    onChange={handleInputChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Ingrese el fabricante
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Dosis Requeridas *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    name="dosis_requeridas"
                    value={formData.dosis_requeridas}
                    onChange={handleInputChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Ingrese un número válido
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Intervalo entre dosis</Form.Label>
                  <Row>
                    <Col xs={6}>
                      <Form.Control
                        type="number"
                        min="0"
                        placeholder="Cantidad"
                        value={intervaloCantidad}
                        onChange={(e) => setIntervaloCantidad(e.target.value)}
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Select
                        value={intervaloTipo}
                        onChange={(e) => setIntervaloTipo(e.target.value)}
                      >
                        <option value="dias">Días</option>
                        <option value="meses">Meses</option>
                        <option value="anios">Años</option>
                      </Form.Select>
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Lote *</Form.Label>
                  <Form.Control
                    type="text"
                    name="lote"
                    value={formData.lote}
                    onChange={handleInputChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Ingrese el número de lote
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha del Lote *</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha_lote"
                    value={formData.fecha_lote}
                    onChange={handleInputChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Seleccione la fecha del lote
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Responsable *</Form.Label>
                  <Form.Control
                    type="text"
                    name="responsable"
                    value={formData.responsable}
                    onChange={handleInputChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Ingrese el responsable
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Total de vacunas disponibles *</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock_disponible"
                    min="0"
                    value={formData.stock_disponible}
                    onChange={handleInputChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Ingrese la cantidad disponible
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <CheckCircle className="me-2" />
            )}
            Actualizar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar la vacuna <strong>{vacunaToDelete?.nombre}</strong>? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={eliminarVacunaConfirmada}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Éxito */}
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Body className="text-center p-4">
          <FaCheckCircle className="text-success mb-3" style={{ fontSize: "3rem" }} />
          <h4>¡Operación Exitosa!</h4>
          <p className="mb-3">
            La vacuna ha sido {isEditing ? "actualizada" : "registrada"} correctamente.
          </p>
          <Button variant="success" onClick={() => setShowSuccessModal(false)}>
            Aceptar
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ControlVacunas;