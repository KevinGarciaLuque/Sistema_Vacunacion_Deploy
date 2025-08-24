import React, { useState, useEffect } from "react";
import { Button, Spinner, Modal, Dropdown, ButtonGroup } from "react-bootstrap";
import { FaPowerOff, FaSyringe, FaEdit, FaSync, FaFilePdf } from "react-icons/fa";
import { toast } from "react-toastify";
import { toggleUserActive } from "../../api/usuarios";
import AplicacionVacunas from "../Administracion/AplicacionVacunas";
import { generarCarnetPDF } from "./utilsPDF";
import { generarCarnetSimplePDF } from "./carnet";

export default function HistorialHeader({
  dni,
  onClose,
  historial,
  usuario: usuarioProp,
  onEditar,        // ← solo recibe el handler del padre
  onEliminar,
  onRecargar,
  actualizarUsuario,
}) {
  // Siempre sincroniza con el prop
  const [usuario, setUsuario] = useState(usuarioProp);
  const [showVacunarModal, setShowVacunarModal] = useState(false);
  const [showConfirmEstadoModal, setShowConfirmEstadoModal] = useState(false);
  const [showConfirmEliminarModal, setShowConfirmEliminarModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUsuario(usuarioProp);
  }, [usuarioProp]);

  const handleToggleEstado = async () => {
    setLoading(true);
    try {
      const nuevoActivo = usuario.activo ? 0 : 1;
      await toggleUserActive(usuario.id, nuevoActivo);
      const usuarioActualizado = { ...usuario, activo: nuevoActivo };
      setUsuario(usuarioActualizado);
      actualizarUsuario(usuarioActualizado);
      toast.success(`✅ Usuario ${nuevoActivo ? "activado" : "inactivado"} correctamente`);
    } catch {
      toast.error("❌ Error al cambiar el estado del usuario");
    } finally {
      setLoading(false);
      setShowConfirmEstadoModal(false);
    }
  };

  const handlePDFSimple = () => {
    generarCarnetSimplePDF({ historial, usuario, dni });
    toast.success("✅ Carnet simple generado correctamente");
  };

  const handlePDFCompleto = () => {
    generarCarnetPDF({ historial, usuario, dni });
    toast.success("✅ Carnet completo generado correctamente");
  };

  return (
    <>
      <div className={`px-4 pt-1 pb-1 ${loading ? "blur-background" : ""}`}>
        <div className="d-flex flex-wrap gap-2 mt-3">
          <Button
            variant="success"
            size="sm"
            onClick={() => setShowVacunarModal(true)}
            disabled={!usuario?.activo || loading}
          >
            <FaSyringe className="me-1" /> Vacunar
          </Button>

          {/* BOTÓN EDITAR: SOLO LLAMA AL PADRE */}
          <Button
            variant="warning"
            size="sm"
            onClick={onEditar}
            disabled={loading}
          >
            <FaEdit className="me-1" /> Editar
          </Button>

          <Button
            variant={usuario?.activo ? "secondary" : "success"}
            size="sm"
            onClick={() => setShowConfirmEstadoModal(true)}
            disabled={loading}
          >
            <FaPowerOff className="me-1" />
            {usuario?.activo ? "Inactivar" : "Activar"}
          </Button>

          <Button
            variant="info"
            size="sm"
            onClick={onRecargar}
            disabled={loading}
          >
            <FaSync className="me-1" /> Recargar
          </Button>

          <div className="ms-auto d-flex flex-wrap gap-2">
            <Dropdown as={ButtonGroup}>
              <Button variant="primary" size="sm" onClick={handlePDFSimple}>
                <FaFilePdf className="me-1" /> Descargar PDF
              </Button>
              <Dropdown.Toggle split variant="primary" />
              <Dropdown.Menu>
                <Dropdown.Item
                  variant="primary"
                  size="sm"
                  onClick={handlePDFCompleto}
                >
                  <h6
                    style={{
                      color: "#0d6efd",
                      fontWeight: "600",
                      margin: 0,
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    📄 Descargar Carnet Completo
                  </h6>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Modal Aplicar Vacuna */}
      <Modal
        show={showVacunarModal}
        onHide={() => setShowVacunarModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Aplicar Vacuna</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AplicacionVacunas
            usuario_id={usuario?.id}
            onClose={() => {
              setShowVacunarModal(false);
              toast.success("✅ Vacuna aplicada correctamente");
              if (onRecargar) onRecargar();
            }}
          />
        </Modal.Body>
      </Modal>

      {/* Modal Confirmación Activar/Inactivar */}
      <Modal
        show={showConfirmEstadoModal}
        onHide={() => setShowConfirmEstadoModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{usuario?.activo ? "Inactivar Usuario" : "Activar Usuario"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro que desea {usuario?.activo ? "inactivar" : "activar"} este usuario?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmEstadoModal(false)}>
            Cancelar
          </Button>
          <Button
            variant={usuario?.activo ? "danger" : "success"}
            onClick={handleToggleEstado}
          >
            {usuario?.activo ? "Inactivar" : "Activar"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 
      // Modal Confirmación Eliminar Usuario
      // Elimínalo si no lo ocupas.
      <Modal
        show={showConfirmEliminarModal}
        onHide={() => setShowConfirmEliminarModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro que desea eliminar este usuario? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmEliminarModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onEliminar();
              setShowConfirmEliminarModal(false);
            }}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
      */}

      <style>
        {`
          .blur-background { filter: blur(2px); pointer-events: none; user-select: none; }
        `}
      </style>
    </>
  );
}
