import React from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import { Card, Nav } from "react-bootstrap";
import CarouselAdminManager from "../Administracion/CarouselAdminManager";
import SobreNosotrosAdmin from "../Administracion/SobreNosotrosAdmin";

const Configuracion = () => {
  return (
    <Card className="p-3 shadow">
      <h4 className="mb-3">⚙️ Configuración del Sistema</h4>

      <Nav variant="tabs" className="mb-3">
        <Nav.Item>
          <Nav.Link
            as={NavLink}
            to="carrousel"
            className={({ isActive }) => (isActive ? "active fw-bold" : "")}
          >
            Administrar Carrousel
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            as={NavLink}
            to="sobre-nosotros"
            className={({ isActive }) => (isActive ? "active fw-bold" : "")}
          >
            Configurar Sobre Nosotros
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <Routes>
        <Route path="carrousel" element={<CarouselAdminManager />} />
        <Route path="sobre-nosotros" element={<SobreNosotrosAdmin />} />
        {/* Ruta por defecto */}
        <Route path="*" element={<CarouselAdminManager />} />
      </Routes>
    </Card>
  );
};

export default Configuracion;
