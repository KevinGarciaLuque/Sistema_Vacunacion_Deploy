import React, { useEffect, useState } from "react";
import { fetchUsuarioPorDni, deleteUser, updateUser } from "../../api/usuarios";
import { Container, Spinner, Alert, Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaCheckCircle } from "react-icons/fa";
import HistorialHeader from "./HistorialHeader";
import DatosPaciente from "./DatosPaciente";
import TablaVacunas from "./TablaVacunas";
import EditarUsuario from "../pages/BuscarUsuario/EditarUsuario";
import { fetchHistorialVacunacion } from "../../api/historial";

const HistorialVacunacion = ({
  dni,
  onClose,
  usuario: usuarioProp,
  recargarUsuarios,
}) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(usuarioProp || null);
  const [mostrarVacunar, setMostrarVacunar] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [loadingEdicion, setLoadingEdicion] = useState(false);
  const [formularioEdicion, setFormularioEdicion] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const cargarHistorial = async () => {
    if (!dni) return;
    setLoading(true);
    setError(null);
    try {
      const historialArray = await fetchHistorialVacunacion(dni);
      const historialOrdenado = historialArray.sort((a, b) =>
        a.nombre_vacuna.localeCompare(b.nombre_vacuna)
      );
      setHistorial(historialOrdenado);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Error al cargar el historial"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
    // eslint-disable-next-line
  }, [dni]);

  useEffect(() => {
    const cargarUsuario = async () => {
      if (!usuarioProp || !usuarioProp.fecha_nacimiento) {
        try {
          const usuarioCompleto = await fetchUsuarioPorDni(dni);
          setUsuario(usuarioCompleto);
        } catch (err) {
          console.error("Error cargando usuario completo:", err);
        }
      } else {
        setUsuario(usuarioProp);
      }
    };
    cargarUsuario();
    // eslint-disable-next-line
  }, [usuarioProp, dni]);

  const actualizarUsuarioLocal = (usuarioActualizado) => {
    setUsuario(usuarioActualizado);
  };

  // ------ SIEMPRE incluye cargo ------
  const handleEditar = () => {
    if (!usuario) return;
    setFormularioEdicion({
      nombre_completo: usuario.nombre_completo || "",
      dni: usuario.dni || "",
      edad: usuario.edad || "",
      fecha_nacimiento: usuario.fecha_nacimiento?.split(" ")[0] || "",
      direccion: usuario.direccion || "",
      area_laboral: usuario.area_laboral || "",
      cargo: usuario.cargo || "",
      telefono: usuario.telefono || "",
      correo: usuario.correo || "",
      activo: usuario.activo ?? 1,
    });
    setMostrarEditar(true);
  };

  const guardarEdicion = async () => {
    setLoadingEdicion(true);
    try {
      if (
        !formularioEdicion.nombre_completo ||
        !formularioEdicion.dni ||
        !formularioEdicion.telefono ||
        !formularioEdicion.correo
      ) {
        toast.error("Complete todos los campos obligatorios");
        setLoadingEdicion(false);
        return;
      }
      const datosActualizados = {
        ...formularioEdicion,
        fecha_nacimiento: formularioEdicion.fecha_nacimiento?.includes(" ")
          ? formularioEdicion.fecha_nacimiento
          : `${formularioEdicion.fecha_nacimiento} 00:00:00`,
      };
      const usuarioActualizado = await updateUser(usuario.id, datosActualizados);
      setUsuario({
        ...usuarioActualizado,
        fecha_nacimiento: usuarioActualizado.fecha_nacimiento?.split(" ")[0],
      });
      setMostrarEditar(false);
      setShowSuccessModal(true); // ← MODAL DE ÉXITO CONTROLADO
      if (recargarUsuarios) recargarUsuarios();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Error al actualizar usuario"
      );
    } finally {
      setLoadingEdicion(false);
    }
  };

  const eliminarUsuario = async () => {
    try {
      await deleteUser(usuario.id);
      toast.success("Usuario eliminado correctamente");
      onClose();
      if (recargarUsuarios) recargarUsuarios();
    } catch (error) {
      toast.error(error.message || "Error al eliminar usuario");
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <div className="mt-3">Cargando historial...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <>
      <Container fluid className="py-3 px-4">
        <HistorialHeader
          dni={dni}
          onClose={onClose}
          historial={historial}
          usuario={usuario}
          onEditar={handleEditar}
          onEliminar={eliminarUsuario}
          onRecargar={cargarHistorial}
          actualizarUsuario={actualizarUsuarioLocal}
        />
        <DatosPaciente usuario={usuario} />
        <TablaVacunas
          historial={historial}
          onAplicarVacuna={setMostrarVacunar}
        />
      </Container>

      {/* MODAL EDITAR USUARIO */}
      <Modal
        show={mostrarEditar}
        onHide={() => setMostrarEditar(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formularioEdicion && (
            <EditarUsuario
              formularioEdicion={formularioEdicion}
              setFormularioEdicion={setFormularioEdicion}
              guardarEdicion={guardarEdicion}
              loadingEdicion={loadingEdicion}
              cancelarEdicion={() => setMostrarEditar(false)}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* MODAL DE ÉXITO: SOLO SE CIERRA CON "ACEPTAR" */}
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        centered
      >
        <Modal.Body className="text-center p-4">
          <FaCheckCircle size={60} className="text-success mb-3" />
          <h5>¡Usuario actualizado correctamente!</h5>
          <Button variant="success" onClick={() => setShowSuccessModal(false)}>
            Aceptar
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default HistorialVacunacion;
