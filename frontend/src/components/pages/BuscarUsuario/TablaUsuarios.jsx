import React from "react";
import { Table, Alert, Spinner, Pagination, Badge } from "react-bootstrap";
import { FaCircle } from "react-icons/fa";

const TablaUsuarios = ({
  usuariosPagina,
  usuariosFiltrados = [],
  loadingUsuarios,
  indexPrimero,
  handleSeleccionUsuario,
  currentPage,
  totalPaginas,
  setCurrentPage,
  onActualizarUsuario // ✅ NUEVO
}) => {
  return (
    <>
      {loadingUsuarios ? (
        <div className="text-center my-4">
          <Spinner animation="border" />
          <p>Cargando pacientes...</p>
        </div>
      ) : (
        <>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <Table striped bordered hover responsive size="sm">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>DNI</th>
                  <th>Área</th>
             
                </tr>
              </thead>
              <tbody>
                {usuariosPagina.map((usuario, index) => (
                  <tr
                    key={usuario.id}
                    style={{
                      cursor: "pointer",
                      backgroundColor: usuario.activo ? "" : "#f8d7da" // rojo suave si inactivo
                    }}
                    onClick={() => handleSeleccionUsuario(usuario)}
                  >
                    <td>{indexPrimero + index + 1}</td>
                    <td>{usuario.nombre_completo}</td>
                    <td>{usuario.dni}</td>
                    <td>{usuario.area_laboral || "-"}</td>
                    
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {usuariosFiltrados.length === 0 && !loadingUsuarios && (
            <Alert variant="info" className="mt-3">
              No se encontraron pacientes con ese criterio de búsqueda
            </Alert>
          )}

          {totalPaginas > 1 && (
            <Pagination className="mt-3 justify-content-center">
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              />
              {Array.from({ length: totalPaginas }).map((_, idx) => (
                <Pagination.Item
                  key={idx + 1}
                  active={idx + 1 === currentPage}
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalPaginas}
                onClick={() => setCurrentPage(currentPage + 1)}
              />
            </Pagination>
          )}
        </>
      )}
    </>
  );
};

export default TablaUsuarios;
