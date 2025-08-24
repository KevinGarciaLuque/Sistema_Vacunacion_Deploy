import React, { useState } from "react";
import axios from "axios";
import HistorialVacunacion from "../Administracion/HistorialVacunacion";
import AplicacionVacunas from "../Administracion/AplicacionVacunas";
import {
  FaSearch,
  FaTrash,
  FaSyringe,
  FaEye,
  FaPrint,
  FaEdit,
  FaTimes,
  FaSave,
} from "react-icons/fa";
import {
  Modal,
  Button,
  Form,
  Alert,
  Spinner,
  Row,
  Col,
  Card,
  Table,
} from "react-bootstrap";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return "N/A";
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
  };
  return new Date(dateString).toLocaleDateString("es-ES", options);
};

const BuscarUsuario = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState("");
  const [mostrarModalVacuna, setMostrarModalVacuna] = useState(false);
  const [modalHistorialOpen, setModalHistorialOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Por favor, ingrese un DNI válido.");
      setUsuario(null);
      return;
    }

    setLoading(true);
    try {
      const historialResponse = await axios.get(
        `${API_URL}/api/historial/${searchTerm}`
      );

      const { usuario: userData, historial } = historialResponse.data;
      setUsuario({ ...userData, historial });
      setEditedUser(userData);
      setError("");
    } catch (error) {
      console.error("Error al buscar usuario:", error);
      setError(
        error.response?.status === 404
          ? "Usuario no encontrado, ó DNI inválido"
          : "Error al buscar usuario. Por favor intente nuevamente."
      );
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };
  

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handlePrintHistorial = () => {
    if (!usuario) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Historial de Vacunación - ${
            usuario.nombre_completo || ""
          }</title>
          <style>
            body { font-family: Arial; margin: 20px; color: #333; }
            h1, h2 { color: #2c3e50; }
            .user-info { margin-bottom: 25px; border-bottom: 1px solid #eee; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Historial de Vacunación</h1>
            <p>Generado el: ${formatDate(new Date())}</p>
          </div>
          
          <div class="user-info">
            <h2>Datos del Usuario</h2>
            <p><strong>Nombre:</strong> ${usuario.nombre_completo || "N/A"}</p>
            <p><strong>DNI:</strong> ${usuario.dni || "N/A"}</p>
            ${
              usuario.edad
                ? `<p><strong>Edad:</strong> ${usuario.edad}</p>`
                : ""
            }
            ${
              usuario.fecha_nacimiento
                ? `<p><strong>Nacimiento:</strong> ${formatDate(
                    usuario.fecha_nacimiento
                  )}</p>`
                : ""
            }
            ${
              usuario.area_laboral
                ? `<p><strong>Área:</strong> ${usuario.area_laboral}</p>`
                : ""
            }
            ${
              usuario.direccion
                ? `<p><strong>Dirección:</strong> ${usuario.direccion}</p>`
                : ""
            }
            ${
              usuario.telefono
                ? `<p><strong>Teléfono:</strong> ${usuario.telefono}</p>`
                : ""
            }
            ${
              usuario.correo
                ? `<p><strong>Correo:</strong> ${usuario.correo}</p>`
                : ""
            }
          </div>
          
          <h2>Historial de Vacunación</h2>
          <table>
            <thead>
              <tr>
                <th>Vacuna</th>
                <th>Fecha</th>
                <th>Próxima</th>
                <th>Dosis</th>
                <th>Estado</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              ${
                usuario.historial.length > 0
                  ? usuario.historial
                      .map(
                        (reg) => `
                  <tr>
                    <td>${reg.nombre_vacuna || "N/A"}</td>
                    <td>${formatDate(reg.fecha_aplicacion)}</td>
                    <td>${formatDate(reg.proxima_dosis)}</td>
                    <td>${reg.dosis || "N/A"}</td>
                    <td>${reg.estado || "N/A"}</td>
                    <td>${reg.responsable || "N/A"}</td>
                  </tr>
                `
                      )
                      .join("")
                  : '<tr><td colspan="6" class="text-center">No hay registros de vacunación</td></tr>'
              }
            </tbody>
          </table>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    if (
      !editedUser.nombre_completo?.trim() ||
      !editedUser.telefono?.trim() ||
      !editedUser.correo?.trim()
    ) {
      alert(
        "Por favor complete todos los campos obligatorios: nombre, teléfono y correo"
      );
      return;
    }

    try {
      setLoading(true);
      const userData = {
        nombre_completo: editedUser.nombre_completo.trim(),
        dni: editedUser.dni.trim(),
        edad: editedUser.edad ? parseInt(editedUser.edad) : null,
        fecha_nacimiento: editedUser.fecha_nacimiento
          ? new Date(editedUser.fecha_nacimiento).toISOString().split("T")[0]
          : null,
        area_laboral: editedUser.area_laboral?.trim(),
        telefono: editedUser.telefono.trim(),
        correo: editedUser.correo.trim().toLowerCase(),
        direccion: editedUser.direccion?.trim() || "",
      };

      const response = await axios.put(
        `${API_URL}/api/usuarios/${usuario.dni}`,
        userData,
        { headers: { "Content-Type": "application/json" } }
      );

      setUsuario((prev) => ({
        ...prev,
        ...response.data,
        historial: prev.historial,
      }));
      setEditMode(false);
      alert("✅ Usuario actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert(
        `❌ Error al actualizar el usuario: ${
          error.response?.data?.error || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedUser(usuario);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async () => {
    if (!usuario) return;

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/api/usuarios/${usuario.id}`);
      alert("✅ Usuario eliminado correctamente");
      setUsuario(null);
      setSearchTerm("");
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert(
        `❌ Error al eliminar el usuario: ${
          error.response?.data?.error || error.message
        }`
      );
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="container mt-4">
      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="h4 mb-4">Buscar por DNI</h2>

          <div className="d-flex gap-2 mb-4">
            <Form.Control
              type="text"
              placeholder="Ingrese el DNI del usuario"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-grow-1"
            />
            <Button variant="primary" onClick={handleSearch} disabled={loading}>
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Buscando...
                </>
              ) : (
                <>
                  <FaSearch className="me-2" /> Buscar
                </>
              )}
            </Button>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          {usuario && (
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h4 mb-0">{usuario.nombre_completo}</h2>
                <div className="d-flex gap-2">
                  {!editMode ? (
                    <>
                      <Button
                        variant="info"
                        onClick={() => setModalHistorialOpen(true)}
                      >
                        <FaEye className="me-2" /> Historial
                      </Button>
                      <Button
                        variant="success"
                        onClick={() => setMostrarModalVacuna(true)}
                      >
                        <FaSyringe className="me-2" /> Aplicar Vacuna
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handlePrintHistorial}
                      >
                        <FaPrint className="me-2" /> Imprimir
                      </Button>
                      <Button variant="warning" onClick={handleEdit}>
                        <FaEdit className="me-2" /> Editar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <FaTrash className="me-2" /> Eliminar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="success" onClick={handleSave}>
                        <FaSave className="me-2" /> Guardar
                      </Button>
                      <Button variant="secondary" onClick={handleCancelEdit}>
                        <FaTimes className="me-2" /> Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Row className="g-3">
                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>DNI:</Form.Label>
                    {editMode ? (
                      <Form.Control
                        type="text"
                        name="dni"
                        value={editedUser.dni || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <Form.Control
                        plaintext
                        readOnly
                        defaultValue={usuario.dni}
                      />
                    )}
                  </Form.Group>
                </Col>

                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Edad:</Form.Label>
                    {editMode ? (
                      <Form.Control
                        type="number"
                        name="edad"
                        value={editedUser.edad || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <Form.Control
                        plaintext
                        readOnly
                        defaultValue={usuario.edad}
                      />
                    )}
                  </Form.Group>
                </Col>

                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Fecha Nacimiento:</Form.Label>
                    {editMode ? (
                      <Form.Control
                        type="date"
                        name="fecha_nacimiento"
                        value={
                          editedUser.fecha_nacimiento
                            ? editedUser.fecha_nacimiento.split("T")[0]
                            : ""
                        }
                        onChange={handleInputChange}
                      />
                    ) : (
                      <Form.Control
                        plaintext
                        readOnly
                        defaultValue={formatDate(usuario.fecha_nacimiento)}
                      />
                    )}
                  </Form.Group>
                </Col>

                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Área Laboral:</Form.Label>
                    {editMode ? (
                      <Form.Control
                        type="text"
                        name="area_laboral"
                        value={editedUser.area_laboral || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <Form.Control
                        plaintext
                        readOnly
                        defaultValue={usuario.area_laboral}
                      />
                    )}
                  </Form.Group>
                </Col>

                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Teléfono:</Form.Label>
                    {editMode ? (
                      <Form.Control
                        type="tel"
                        name="telefono"
                        value={editedUser.telefono || ""}
                        onChange={handleInputChange}
                        required
                      />
                    ) : (
                      <Form.Control
                        plaintext
                        readOnly
                        defaultValue={usuario.telefono}
                      />
                    )}
                  </Form.Group>
                </Col>

                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Correo:</Form.Label>
                    {editMode ? (
                      <Form.Control
                        type="email"
                        name="correo"
                        value={editedUser.correo || ""}
                        onChange={handleInputChange}
                        required
                      />
                    ) : (
                      <Form.Control
                        plaintext
                        readOnly
                        defaultValue={usuario.correo}
                      />
                    )}
                  </Form.Group>
                </Col>

                {editMode && (
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Nombre Completo:</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre_completo"
                        value={editedUser.nombre_completo || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal para aplicar vacuna */}
      <Modal
        show={mostrarModalVacuna}
        onHide={() => setMostrarModalVacuna(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Aplicar Vacuna</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {usuario && (
            <AplicacionVacunas
              usuario_id={usuario.id}
              onClose={() => {
                setMostrarModalVacuna(false);
                handleSearch(); // Refrescar datos después de aplicar vacuna
              }}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Modal para ver historial completo */}
      <Modal
        show={modalHistorialOpen}
        onHide={() => setModalHistorialOpen(false)}
        size="xl"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Historial de Vacunación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {usuario && (
            <HistorialVacunacion
            dni={usuario.dni}
            onClose={() => setModalHistorialOpen(false)}
            usuario={usuario}
          />
          )}
        </Modal.Body>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro que deseas eliminar al usuario{" "}
            <strong>{usuario?.nombre_completo}</strong> (DNI: {usuario?.dni})?
          </p>
          <p className="text-danger">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Eliminando...
              </>
            ) : (
              "Sí, Eliminar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BuscarUsuario;
