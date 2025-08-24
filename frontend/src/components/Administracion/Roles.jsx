import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Table,
  Alert,
  Badge,
  Spinner,
  Card,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Roles.css";

import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  toggleRoleStatus,
} from "../../api/roles.js";

import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRole, setCurrentRole] = useState({ id: "", nombre: "" });
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [roleToToggle, setRoleToToggle] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState({
    listado: false,
    guardando: false,
    eliminando: false,
  });

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    try {
      setLoading((prev) => ({ ...prev, listado: true }));
      setError("");
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar los roles");
    } finally {
      setLoading((prev) => ({ ...prev, listado: false }));
    }
  };

  const abrirModalNuevoRol = () => {
    setCurrentRole({ id: "", nombre: "" });
    setEditMode(false);
    setShowModal(true);
  };

  const abrirModalEditarRol = (rol) => {
    setCurrentRole(rol);
    setEditMode(true);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentRole((prev) => ({ ...prev, [name]: value }));
  };

  const validarRol = () => {
    if (!currentRole.nombre.trim()) {
      setError("El nombre del rol es obligatorio");
      return false;
    }
    return true;
  };

  const guardarRol = async () => {
    if (!validarRol()) return;
    try {
      setLoading((prev) => ({ ...prev, guardando: true }));
      setError("");
      if (editMode) {
        await updateRole(currentRole.id, { nombre: currentRole.nombre });
      } else {
        await createRole({ nombre: currentRole.nombre });
      }
      setSuccess(`Rol ${editMode ? "actualizado" : "creado"} correctamente`);
      setShowModal(false);
      cargarRoles();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar el rol");
    } finally {
      setLoading((prev) => ({ ...prev, guardando: false }));
    }
  };

  const confirmarEliminarRol = (rol) => {
    setRoleToDelete(rol);
    setShowConfirmModal(true);
  };

  const eliminarRol = async () => {
    if (!roleToDelete) return;
    try {
      setLoading((prev) => ({ ...prev, eliminando: true }));
      setError("");
      await deleteRole(roleToDelete.id);
      setSuccess("Rol eliminado correctamente");
      cargarRoles();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar el rol");
    } finally {
      setLoading((prev) => ({ ...prev, eliminando: false }));
      setShowConfirmModal(false);
    }
  };

  const confirmarToggleEstado = (rol) => {
    setRoleToToggle(rol);
    setShowToggleModal(true);
  };

  const cambiarEstadoRol = async () => {
    if (!roleToToggle) return;
    try {
      setError("");
      await toggleRoleStatus(roleToToggle.id);
      setSuccess(`Rol ${roleToToggle.activo ? "desactivado" : "activado"} correctamente`);
      cargarRoles();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Error al cambiar el estado del rol");
    } finally {
      setShowToggleModal(false);
    }
  };

  return (
    <div className="roles-container">
      <h2 className="mb-4">Administración de Roles</h2>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess("")} dismissible>
          {success}
        </Alert>
      )}

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Listado de Roles</h4>
            <Button variant="primary" onClick={abrirModalNuevoRol} disabled={loading.listado}>
              Crear Nuevo Rol
            </Button>
          </div>

          {loading.listado ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.length > 0 ? (
                  roles.map((rol) => (
                    <tr key={rol.id}>
                      <td>{rol.id}</td>
                      <td>
                        {rol.nombre}
                        {rol.nombre.toLowerCase() === "administrador" && (
                          <Badge bg="danger" className="ms-2">
                            Sistema
                          </Badge>
                        )}
                      </td>
                      <td>
                        <Badge bg={rol.activo ? "success" : "danger"}>
                          {rol.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => abrirModalEditarRol(rol)}
                          disabled={rol.nombre.toLowerCase() === "administrador"}
                        >
                          <FaEdit className="me-1" />
                          
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="me-2"
                          onClick={() => confirmarEliminarRol(rol)}
                          disabled={rol.nombre.toLowerCase() === "administrador"}
                        >
                          <FaTrash className="me-1" />
                         
                        </Button>
                        <Button
                          variant={rol.activo ? "outline-warning" : "outline-success"}
                          size="sm"
                          onClick={() => confirmarToggleEstado(rol)}
                          disabled={rol.nombre.toLowerCase() === "administrador"}
                        >
                          {rol.activo ? (
                            <>
                              <FaToggleOff className="me-1" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <FaToggleOn className="me-1" />
                              Activar
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      No se encontraron roles
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal Crear/Editar */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>{editMode ? "Editar Rol" : "Crear Nuevo Rol"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Rol *</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={currentRole.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Médico, Enfermero"
                autoFocus
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading.guardando}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarRol} disabled={loading.guardando}>
            {loading.guardando ? (
              <>
                <Spinner as="span" size="sm" animation="border" />
                <span className="ms-2">{editMode ? "Actualizando..." : "Creando..."}</span>
              </>
            ) : editMode ? (
              "Actualizar Rol"
            ) : (
              "Crear Rol"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Confirmación Eliminar */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar el rol "{roleToDelete?.nombre}"? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={eliminarRol} disabled={loading.eliminando}>
            {loading.eliminando ? (
              <>
                <Spinner as="span" size="sm" animation="border" />
                <span className="ms-2">Eliminando...</span>
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Confirmación Activar/Desactivar */}
      <Modal show={showToggleModal} onHide={() => setShowToggleModal(false)} centered>
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>Confirmar Cambio de Estado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas {roleToToggle?.activo ? "desactivar" : "activar"} el rol "{roleToToggle?.nombre}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowToggleModal(false)}>
            Cancelar
          </Button>
          <Button variant="warning" onClick={cambiarEstadoRol}>
            {roleToToggle?.activo ? "Desactivar" : "Activar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Roles;
