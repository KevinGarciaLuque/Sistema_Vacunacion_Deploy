import React, { useState } from "react";
import { Table, Button, Spinner, Modal, Form } from "react-bootstrap";
import {
  FaChevronDown,
  FaChevronUp,
  FaSyringe,
  FaExpand,
  FaCompress,
  FaEdit,
  FaTrash,
  FaTrashAlt,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import {
  updateHistorialVacunacion,
  deleteHistorialVacunacion,
  addHistorialVacunacion,
} from "../../api/historial";
import { toast } from "react-toastify";

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("es-ES") : "—";

export default function TablaVacunas({ historial, onAplicarVacuna }) {
  const [expandidas, setExpandidas] = useState({});
  const [expandidoGlobal, setExpandidoGlobal] = useState(false);
  const [loadingAplicando, setLoadingAplicando] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [vacunaEdit, setVacunaEdit] = useState(null);
  const [editData, setEditData] = useState({
    fecha_aplicacion: "",
    responsable: "",
  });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    vacuna: null,
    action: "",
  });

  const agrupadas = historial.reduce((acc, r) => {
    acc[r.nombre_vacuna] = [...(acc[r.nombre_vacuna] || []), r];
    return acc;
  }, {});

  const toggle = (nombre) => {
    setExpandidas((prev) => ({ ...prev, [nombre]: !prev[nombre] }));
  };

  const toggleGlobal = () => {
    expandidoGlobal
      ? setExpandidas({})
      : setExpandidas(
          Object.fromEntries(Object.keys(agrupadas).map((k) => [k, true]))
        );
    setExpandidoGlobal(!expandidoGlobal);
  };

  const aplicarVacunaDirecto = (vacuna) => {
    setConfirmModal({
      show: true,
      vacuna,
      action: "aplicar",
    });
  };

  const handleAplicarConfirmado = async (vacuna) => {
    setLoadingAplicando(vacuna.id);
    try {
      await addHistorialVacunacion({
        usuario_id: vacuna.usuario_id,
        vacuna_id: vacuna.vacuna_id,
        dosis: vacuna.dosis || "Refuerzo",
        fecha_aplicacion: new Date().toISOString().split("T")[0],
        estado: "Aplicada",
        via_administracion: "intramuscular",
        sitio_aplicacion: "brazo_izquierdo",
        responsable: "Sistema",
      });
      toast.success("Vacuna aplicada correctamente");
      if (onAplicarVacuna) onAplicarVacuna();
    } catch (error) {
      toast.error(
        error.response?.data?.error || error.message || "Error al aplicar vacuna"
      );
    } finally {
      setLoadingAplicando(null);
      setConfirmModal({ show: false, vacuna: null, action: "" });
    }
  };

  const openEditModal = (vacuna) => {
    setVacunaEdit(vacuna);
    setEditData({
      fecha_aplicacion: vacuna.fecha_aplicacion?.split("T")[0] || "",
      responsable: vacuna.responsable || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateVacuna = async () => {
    if (!vacunaEdit) return;
    setLoadingEdit(true);
    try {
      await updateHistorialVacunacion(vacunaEdit.id, editData);
      toast.success("Vacuna actualizada correctamente");
      setShowEditModal(false);
      if (onAplicarVacuna) onAplicarVacuna();
    } catch (error) {
      toast.error("Error al actualizar vacuna");
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleDeleteVacuna = (vacuna) => {
    setConfirmModal({
      show: true,
      vacuna,
      action: "eliminar",
    });
  };

  const handleDeleteConfirmado = async (vacuna) => {
    try {
      await deleteHistorialVacunacion(vacuna.id);
      toast.success("Vacuna eliminada correctamente");
      if (onAplicarVacuna) onAplicarVacuna(); // ✅ actualiza automáticamente la tabla
    } catch (error) {
      toast.error("Error al eliminar vacuna");
    } finally {
      setConfirmModal({ show: false, vacuna: null, action: "" });
    }
  };

  return (
    <>
      <div className="d-flex justify-content-end mb-2">
        <Button
          size="sm"
          variant={expandidoGlobal ? "secondary" : "primary"}
          onClick={toggleGlobal}
        >
          {expandidoGlobal ? (
            <>
              <FaCompress /> Colapsar todo
            </>
          ) : (
            <>
              <FaExpand /> Expandir todo
            </>
          )}
        </Button>
      </div>

      <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
        <Table bordered hover className="align-middle mb-0">
          <thead className="table-light" style={{ position: "sticky", top: 0 }}>
            <tr>
              <th>Dosis</th>
              <th>Vacuna</th>
              <th>Fabricante</th>
              <th>Fecha Aplicación</th>
              <th>Responsable</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(agrupadas).map(([nombre, registros]) => (
              <React.Fragment key={nombre}>
                <tr
                  onClick={() => toggle(nombre)}
                  style={{ cursor: "pointer", background: "#e9f1f7" }}
                >
                  <td colSpan={6} className="fw-bold">
                    {nombre} {expandidas[nombre] ? <FaChevronUp /> : <FaChevronDown />}
                  </td>
                </tr>
                {expandidas[nombre] &&
                  registros.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.dosis || "-"}</td>
                      <td>{r.nombre_vacuna || "-"}</td>
                      <td>{r.fabricante || "-"}</td>
                      <td>{formatDate(r.fecha_aplicacion)}</td>
                      <td>{r.responsable || "-"}</td>
                      <td>
                        {r.fecha_aplicacion ? (
                          <>
                            <Button
                              variant="warning"
                              size="sm"
                              className="me-1"
                              onClick={() => openEditModal(r)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteVacuna(r)}
                            >
                              <FaTrash />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => aplicarVacunaDirecto(r)}
                            disabled={loadingAplicando === r.id}
                          >
                            {loadingAplicando === r.id ? (
                              <Spinner size="sm" animation="border" className="me-1" />
                            ) : (
                              <FaSyringe className="me-1" />
                            )}
                            Aplicar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Modal Editar Vacuna */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Vacuna Aplicada</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Aplicación</Form.Label>
              <Form.Control
                type="date"
                value={editData.fecha_aplicacion}
                onChange={(e) =>
                  setEditData({ ...editData, fecha_aplicacion: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Responsable</Form.Label>
              <Form.Control
                type="text"
                value={editData.responsable}
                onChange={(e) =>
                  setEditData({ ...editData, responsable: e.target.value })
                }
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateVacuna}
                disabled={loadingEdit}
              >
                {loadingEdit ? (
                  <Spinner size="sm" animation="border" />
                ) : (
                  "Guardar"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de Confirmación con ícono */}
      <Modal
        show={confirmModal.show}
        onHide={() => setConfirmModal({ show: false, vacuna: null, action: "" })}
        centered
      >
        <Modal.Body className="text-center p-4">
          {confirmModal.action === "aplicar" ? (
            <>
              <FaCheckCircle size={60} className="text-success mb-3" />
              <h5>¿Está seguro de aplicar la vacuna <strong>{confirmModal.vacuna?.nombre_vacuna}</strong>?</h5>
              <div className="d-flex justify-content-center gap-2 mt-3">
                <Button
                  variant="secondary"
                  onClick={() => setConfirmModal({ show: false, vacuna: null, action: "" })}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleAplicarConfirmado(confirmModal.vacuna)}
                >
                  Confirmar
                </Button>
              </div>
            </>
          ) : (
            <>
              <FaTrashAlt size={60} className="text-danger mb-3" />
              <h5>¿Está seguro de eliminar esta vacuna aplicada?</h5>
              <div className="d-flex justify-content-center gap-2 mt-3">
                <Button
                  variant="secondary"
                  onClick={() => setConfirmModal({ show: false, vacuna: null, action: "" })}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteConfirmado(confirmModal.vacuna)}
                >
                  Eliminar
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
