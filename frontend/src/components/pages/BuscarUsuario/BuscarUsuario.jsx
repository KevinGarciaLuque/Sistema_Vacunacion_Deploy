import React, { useState, useEffect } from "react";
import { Card, Alert, Modal } from "react-bootstrap";
import FormularioBusqueda from "./FormularioBusqueda";
import TablaUsuarios from "./TablaUsuarios";
import HistorialVacunacion from "../../Historial/HistorialVacunacion";
import {
  getUsuariosConRoles,
  deleteUser,
  updateUser,
  getUsuarioPorId,
} from "../../../api/usuarios";

const BuscarUsuario = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarModalHistorial, setMostrarModalHistorial] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const usuariosPorPagina = 10;

  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Carga todos los usuarios para la tabla
  const cargarUsuarios = async () => {
    setLoadingUsuarios(true);
    setError("");
    try {
      const data = await getUsuariosConRoles();
      setUsuarios(data);
    } catch (err) {
      setError("Error al cargar usuarios. Por favor, intente nuevamente.");
      console.error("Error al cargar usuarios:", err);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  // Filtro de usuarios por nombre o DNI
  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombre_completo?.toLowerCase().includes(filtro.toLowerCase()) ||
      u.dni?.includes(filtro)
  );

  const indexUltimo = currentPage * usuariosPorPagina;
  const indexPrimero = indexUltimo - usuariosPorPagina;
  const usuariosPagina = usuariosFiltrados.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  const limpiarBusqueda = () => {
    setFiltro("");
    setCurrentPage(1);
    setUsuarioSeleccionado(null);
  };

  // Cuando seleccionas usuario de la tabla, carga TODOS los campos actualizados del backend
  const handleSeleccionUsuario = async (usuario) => {
    try {
      const datosCompletos = await getUsuarioPorId(usuario.id);
      setUsuarioSeleccionado(datosCompletos);
      setMostrarModalHistorial(true);
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      setError("Error al cargar los datos del usuario");
    }
  };

  // --- FUNCIONALIDAD CRUCIAL PARA QUE EL USUARIO SE ACTUALICE EN EL MODAL ---
  // Cuando editas usuario dentro de HistorialVacunacion.jsx, este método es pasado vía props
  // para actualizar el usuario y refrescar la lista sin recargar todo.
  const handleUsuarioActualizado = async (id) => {
    try {
      // Refetch solo el usuario actualizado
      const actualizado = await getUsuarioPorId(id);
      setUsuarioSeleccionado(actualizado);

      // Refresca también la lista general si hace falta
      await cargarUsuarios();
    } catch (err) {
      setError("Error al actualizar datos después de la edición.");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Búsqueda de Usuario</h2>

      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <FormularioBusqueda
            filtro={filtro}
            setFiltro={setFiltro}
            limpiarBusqueda={limpiarBusqueda}
            loading={loadingUsuarios}
          />

          <TablaUsuarios
            usuariosPagina={usuariosPagina}
            usuariosFiltrados={usuariosFiltrados}
            loadingUsuarios={loadingUsuarios}
            indexPrimero={indexPrimero}
            handleSeleccionUsuario={handleSeleccionUsuario}
            currentPage={currentPage}
            totalPaginas={totalPaginas}
            setCurrentPage={setCurrentPage}
          />
        </Card.Body>
      </Card>

      {/* Modal con HistorialVacunacion (y desde ahí editar usuario) */}
      <Modal
        show={mostrarModalHistorial}
        onHide={() => setMostrarModalHistorial(false)}
        size="xl"
        centered
        fullscreen="md-down"
      >
        <Modal.Header closeButton>
          <Modal.Title>Gestión de Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {usuarioSeleccionado && (
            <HistorialVacunacion
              dni={usuarioSeleccionado.dni}
              usuario={usuarioSeleccionado}
              onClose={() => setMostrarModalHistorial(false)}
              recargarUsuarios={cargarUsuarios}
              onUsuarioActualizado={handleUsuarioActualizado} // <-- Pasa esta función a HistorialVacunacion.jsx
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default BuscarUsuario;
