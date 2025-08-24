import React from "react";
import { InputGroup, Form, Button } from "react-bootstrap";
import { FaSearch, FaSyncAlt } from "react-icons/fa";

const FormularioBusqueda = ({ filtro, setFiltro, limpiarBusqueda, loading }) => {
  return (
    <InputGroup className="mb-3">
      <InputGroup.Text><FaSearch /></InputGroup.Text>
      <Form.Control
        placeholder="Buscar por DNI o Nombre"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />
      <Button variant="secondary" onClick={limpiarBusqueda} disabled={loading}>
        <FaSyncAlt /> Limpiar
      </Button>
    </InputGroup>
  );
};

export default FormularioBusqueda;
