import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Table,
  Alert,
  Badge,
  Spinner,
  Card,
  Form,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import {
  getRoles,
  getUsuariosConRoles,
  getUsuarioRoles,
  updateUsuarioRoles,
} from "../../api/roles";
import { getUsuarioByDNI } from "../../api/usuarios";

const UsuarioRol = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [rolesAsignados, setRolesAsignados] = useState([]);
  const [busquedaDNI, setBusquedaDNI] = useState("");
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState({
    general: false,
    busqueda: false,
    modal: false,
  });

  // Cargar roles y usuarios al iniciar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading((prev) => ({ ...prev, general: true }));
        setError("");
        const [roles, usuarios] = await Promise.all([
          getRoles(),
          getUsuariosConRoles(),
        ]);
        setRolesDisponibles(Array.isArray(roles) ? roles : []);
        setUsuarios(Array.isArray(usuarios) ? usuarios : []);
      } catch (err) {
        setError(err.message || "Error al cargar los datos iniciales");
        setRolesDisponibles([]);
        setUsuarios([]);
      } finally {
        setLoading((prev) => ({ ...prev, general: false }));
      }
    };
    cargarDatos();
  }, []);

  // Buscar usuario por DNI
  const buscarUsuarioPorDNI = async () => {
    if (!busquedaDNI.trim()) {
      setError("Por favor ingrese un DNI válido");
      return;
    }
    try {
      setLoading((prev) => ({ ...prev, busqueda: true }));
      setError("");
      const usuario = await getUsuarioByDNI(busquedaDNI);
      setUsuarioEncontrado(usuario);
      const roles = await getUsuarioRoles(usuario.id);
      setRolesAsignados(Array.isArray(roles) ? roles.map((r) => r.id) : []);
    } catch (err) {
      setUsuarioEncontrado(null);
      setRolesAsignados([]);
      setError(err.message || "Usuario no encontrado o error en la búsqueda");
    } finally {
      setLoading((prev) => ({ ...prev, busqueda: false }));
    }
  };

  // Abrir modal para asignar roles
  const abrirModalRoles = async (usuario) => {
    try {
      setLoading((prev) => ({ ...prev, modal: true }));
      setUsuarioSeleccionado(usuario);
      const roles = await getUsuarioRoles(usuario.id);
      setRolesAsignados(Array.isArray(roles) ? roles.map((r) => r.id) : []);
      setShowModal(true);
    } catch (err) {
      setError("Error al cargar los roles del usuario");
      setRolesAsignados([]);
    } finally {
      setLoading((prev) => ({ ...prev, modal: false }));
    }
  };

  // Marcar/desmarcar rol en el modal
  const handleAsignarRol = (rolId) => {
    setRolesAsignados((prev) =>
      prev.includes(rolId)
        ? prev.filter((id) => id !== rolId)
        : [...prev, rolId]
    );
  };

  // Guardar roles asignados al usuario
  const guardarRoles = async () => {
    if (!usuarioSeleccionado) return;
    try {
      setLoading((prev) => ({ ...prev, modal: true }));
      setError("");
      const response = await updateUsuarioRoles(
        usuarioSeleccionado.id,
        rolesAsignados
      );
      if (response.roles) {
        setUsuarios((prevUsuarios) =>
          Array.isArray(prevUsuarios)
            ? prevUsuarios.map((u) =>
                u.id === usuarioSeleccionado.id
                  ? { ...u, roles: response.roles }
                  : u
              )
            : []
        );
        if (usuarioEncontrado?.id === usuarioSeleccionado.id) {
          setUsuarioEncontrado({
            ...usuarioEncontrado,
            roles: response.roles,
          });
        }
      }
      setSuccess(
        `Roles actualizados para ${usuarioSeleccionado.nombre_completo}`
      );
      setShowModal(false);
    } catch (err) {
      setError(err.message || "Error al guardar los roles");
    } finally {
      setLoading((prev) => ({ ...prev, modal: false }));
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Gestión de Roles de Usuario</h2>
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

      {/* Buscador por DNI */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h4 className="mb-3">Buscar Usuario por DNI</h4>
          <div className="d-flex">
            <Form.Control
              type="text"
              placeholder="Ingrese DNI del usuario"
              value={busquedaDNI}
              onChange={(e) => setBusquedaDNI(e.target.value)}
              className="me-2"
            />
            <Button
              variant="primary"
              onClick={buscarUsuarioPorDNI}
              disabled={loading.busqueda}
            >
              {loading.busqueda ? (
                <>
                  <Spinner
                    as="span"
                    size="sm"
                    animation="border"
                    role="status"
                  />
                  <span className="ms-2">Buscando...</span>
                </>
              ) : (
                "Buscar"
              )}
            </Button>
          </div>

          {usuarioEncontrado && (
            <div className="mt-3 p-3 bg-light rounded">
              <h5>Usuario encontrado:</h5>
              <p>
                <strong>Nombre:</strong> {usuarioEncontrado.nombre_completo}
              </p>
              <p>
                <strong>DNI:</strong> {usuarioEncontrado.dni}
              </p>
              <p>
                <strong>Área:</strong>{" "}
                {usuarioEncontrado.area_laboral || "No especificada"}
              </p>
              <Button
                variant="outline-primary"
                onClick={() => abrirModalRoles(usuarioEncontrado)}
                disabled={loading.modal}
              >
                {loading.modal ? "Cargando..." : "Gestionar Roles"}
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Tabla de usuarios y roles */}
      <Card className="shadow-sm">
        <Card.Body>
          <h4 className="mb-3">Lista de Usuarios</h4>
          {loading.general ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Cargando datos...</p>
            </div>
          ) : (
            <div
              className="table-responsive"
              style={{ maxHeight: "30vh", overflowY: "auto" }}
            >
              <Table striped bordered hover className="mb-0">
                <thead>
                  <tr style={{ background: "#171E37", color: "white" }}>
                    <th style={{ position: "sticky", top: 0, background: "#171E37", color: "white" }}>ID</th>
                    <th style={{ position: "sticky", top: 0, background: "#171E37", color: "white" }}>Nombre</th>
                    <th style={{ position: "sticky", top: 0, background: "#171E37", color: "white" }}>DNI</th>
                    <th style={{ position: "sticky", top: 0, background: "#171E37", color: "white" }}>Área</th>
                    <th style={{ position: "sticky", top: 0, background: "#171E37", color: "white" }}>Roles</th>
                    <th style={{ position: "sticky", top: 0, background: "#171E37", color: "white" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(usuarios) && usuarios.length > 0) ? (
                    usuarios.map((usuario) => (
                      <tr key={usuario.id}>
                        <td>{usuario.id}</td>
                        <td>{usuario.nombre_completo}</td>
                        <td>{usuario.dni}</td>
                        <td>{usuario.area_laboral || "Sin asignar"}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {(Array.isArray(usuario.roles) && usuario.roles.length > 0) ? (
                              usuario.roles.map((rol) => (
                                <Badge key={`${usuario.id}-${rol.id}`} bg="info">
                                  {rol.nombre}
                                </Badge>
                              ))
                            ) : (
                              <Badge bg="secondary">Sin roles</Badge>
                            )}
                          </div>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => abrirModalRoles(usuario)}
                            disabled={loading.modal}
                          >
                            Asignar Roles
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal para asignar roles */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            Asignar Roles a {usuarioSeleccionado?.nombre_completo}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            <strong>DNI:</strong> {usuarioSeleccionado?.dni} |{" "}
            <strong>Área:</strong>{" "}
            {usuarioSeleccionado?.area_laboral || "No especificada"}
          </p>
          <h5>Roles Disponibles ({rolesDisponibles.length}):</h5>
          {(Array.isArray(rolesDisponibles) && rolesDisponibles.length > 0) ? (
            rolesDisponibles.map((rol) => (
              <div key={`rol-${rol.id}`} className="mb-2">
                <Form.Check
                  type="checkbox"
                  id={`rol-${rol.id}`}
                  label={
                    <span>
                      <strong>{rol.nombre}</strong>{" "}
                      <Badge bg={rol.activo ? "success" : "danger"}>
                        {rol.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </span>
                  }
                  checked={rolesAsignados.includes(rol.id)}
                  onChange={() => handleAsignarRol(rol.id)}
                  disabled={!rol.activo}
                />
              </div>
            ))
          ) : (
            <div>No hay roles disponibles.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={guardarRoles}
            disabled={loading.modal || !Array.isArray(rolesDisponibles) || rolesDisponibles.length === 0}
          >
            {loading.modal ? (
              <>
                <Spinner as="span" size="sm" animation="border" role="status" />
                <span className="ms-2">Guardando...</span>
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UsuarioRol;
