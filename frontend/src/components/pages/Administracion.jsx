// Administracion.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, ListGroup, Button } from "react-bootstrap";
import {
  FiUser,
  FiSearch,
  FiShield,
  FiFileText,
  FiClipboard,
  FiUsers,
  FiActivity,
  FiHome,
  FiLock,
  FiChevronLeft,
  FiMenu,
  FiTarget,
} from "react-icons/fi";

// Componentes de páginas (mismo nivel que este archivo)
import Registro from "./Registro";
import BuscarUsuario from "./BuscarUsuario/BuscarUsuario";
import Dashboard from "./Dashboard";

// Componentes administrativos (suben un nivel y luego bajan a Administracion)
import AplicacionVacunas from "../Administracion/AplicacionVacunas";
import HistorialVacunacion from "../Historial/HistorialVacunacion";
import VacunasAplicadasPage from "../pages/VacunasAplicadasPage";
// en tu <Routes>

import ControlVacunas from "../Administracion/ControlVacunas";

import UsuarioRol from "../Administracion/UsuarioRol";
import Roles from "../Administracion/Roles";
import Bitacora from "../Administracion/Bitacora/Bitacora";

// Estilos y contexto
import "../styles/administracion.css";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  { key: "Dashboard", icon: <FiHome size={18} />, label: "Dashboard" },
  { key: "VacunasAplicadas", icon: <FiShield size={18} />, label: "Reportes de Vacunas" },
  { key: "Registro", icon: <FiUser size={18} />, label: "Registro" },
  { key: "ControlVacuna", icon: <FiClipboard size={18} />, label: "Control de Vacuna" },
  { key: "BuscarUsuario", icon: <FiSearch size={18} />, label: "Buscar Usuario" },  


  { key: "UsuarioRol", icon: <FiLock size={18} />, label: "Gestión de Roles" },
  { key: "Roles", icon: <FiUsers size={18} />, label: "Roles" },
  { key: "Bitacora", icon: <FiActivity size={18} />, label: "Bitácora" },

];

const Administracion = () => {
  const { usuario } = useAuth();
  const [activeModule, setActiveModule] = useState("Dashboard");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  let allowedModules = [];
  if (usuario && Array.isArray(usuario.roles)) {
    if (usuario.roles.includes("Administrador")) {
      allowedModules = menuItems;
    } else if (usuario.roles.includes("Médico") || usuario.roles.includes("Enfermero")) {
      allowedModules = menuItems.filter(
        (item) => !["UsuarioRol", "Roles", "Bitacora", "ControlVacuna"].includes(item.key)
      );
    } else if (usuario.roles.includes("usuario")) {
      allowedModules = menuItems.filter((item) =>
        ["Dashboard", "Registro", "BuscarUsuario", "AplicacionVacunas", "HistorialVacunacion"].includes(item.key)
      );
    } else {
      allowedModules = menuItems.filter((item) => item.key === "Dashboard");
    }
  } else {
    allowedModules = [];
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const handleModuleChange = (moduleKey) => {
    setActiveModule(moduleKey);
    if (isMobile && moduleKey !== "Dashboard") {
      setShowSidebar(false);
    }
  };

  const renderContent = () => {
    switch (activeModule) {
      case "Registro": return <Registro />;
      case "BuscarUsuario": return <BuscarUsuario />;
      case "AplicacionVacunas": return <AplicacionVacunas />;
      case "HistorialVacunacion": return <HistorialVacunacion dni={usuario?.dni || ""} />;
      case "ControlVacuna": return <ControlVacunas />;
      case "UsuarioRol": return <UsuarioRol />;
      case "Roles": return <Roles />;
      case "Bitacora": return <Bitacora />;
      default: return <Dashboard />;
      case "VacunasAplicadas": return <VacunasAplicadasPage />;

    }
  };

  if (!usuario) return null;

  return (
    <Container fluid className="py-4 bg-light admin-container">
      <Row className="position-relative">
        {showSidebar && (
          <Col lg={3} className="mb-4 admin-sidebar">
            <Card className="border-0 shadow-sm h-100" style={{ background: "linear-gradient(135deg, #2c3e50 0%, #1a1a2e 100%)", borderRadius: "15px" }}>
              <Card.Header className="border-0 pb-0 bg-transparent d-flex justify-content-between align-items-center">
                <h5 className="text-white mb-0 p-3">Panel de Administración</h5>
                <Button variant="link" className="text-white p-0 me-2" onClick={toggleSidebar} aria-label="Ocultar panel">
                  <FiChevronLeft size={20} />
                </Button>
              </Card.Header>
              <ListGroup variant="flush" className="border-0">
                {allowedModules.map((item) => (
                  <ListGroup.Item
                    key={item.key}
                    action
                    active={activeModule === item.key}
                    onClick={() => handleModuleChange(item.key)}
                    className="border-0 rounded-0 bg-transparent text-gray-200 d-flex align-items-center gap-3 px-4 py-3"
                    style={{
                      fontWeight: "500",
                      borderLeft: activeModule === item.key ? "3px solid #657eff" : "none",
                      background: activeModule === item.key
                        ? "linear-gradient(90deg, rgba(101,126,255,0.2) 0%, rgba(101,126,255,0) 100%)"
                        : "transparent",
                      color: activeModule === item.key ? "#657eff" : "#b8c2cc",
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Col>
        )}

        <Col lg={showSidebar ? 9 : 12} className="main-content mt-4">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "15px" }}>
            <Card.Header className="bg-white border-0 position-relative px-2 " style={{ overflow: "hidden" }}>
              <div className="d-flex align-items-center" style={{
                transform: !showSidebar ? "translateX(0)" : "translateX(-5px)",
                transition: "transform .6s ease-in-out 0.3s",
                width: "fit-content",
              }}>
                {!showSidebar && (
                  <Button variant="light" onClick={toggleSidebar} className="me-3" style={{
                    opacity: !showSidebar ? 1 : 0,
                    transition: "opacity 0.2s ease-in-out 0.1s",
                    backgroundColor: "#4e73df",
                    borderColor: "#4e73df",
                    color: "white",
                  }}>
                    <FiMenu size={20} />
                  </Button>
                )}
                <span className="text-dark fw-bold">
                  {allowedModules.find((item) => item.key === activeModule)?.label || "Dashboard"}
                </span>
              </div>
            </Card.Header>

            <Card.Body className="p-0 bg-white" style={{ borderRadius: "15px" }}>
              {renderContent()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Administracion;
