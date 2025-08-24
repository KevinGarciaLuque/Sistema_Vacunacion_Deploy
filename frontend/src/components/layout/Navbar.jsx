// Navbar.jsx

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Navbar as BsNavbar,
  Nav,
  Container,
  Button,
  Image,
  Dropdown,
  Modal,
} from "react-bootstrap";
import {
  FiHome,
  FiSettings,
  FiCalendar,
  FiMail,
  FiUser,
  FiLogIn,
  FiChevronDown,
  FiShield,
} from "react-icons/fi";
import IniciarSesion from "./IniciarSesion";
import { useAuth } from "../../context/AuthContext";
import "../styles/Navbar.css";
import logo_izquierdo from "../../assets/logo_izquierdo.png";

export const Navbar = () => {
  const [expanded, setExpanded] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { usuario: user, login, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
 

  const isActive = (path) => location.pathname === path;

  const userRoles = Array.isArray(user?.roles)
    ? user.roles
    : typeof user?.roles === "string"
      ? user.roles.split(",").map((r) => r.trim()).filter(Boolean)
      : [];

  const esUsuarioNormal =
    userRoles.includes("Usuario") || userRoles.includes("usuario_normal");

  const esAdmin =
    userRoles.includes("Administrador") || userRoles.includes("admin");

  const navItems = [
    { path: "/inicio", name: "Inicio", icon: <FiHome className="nav-icon" /> },
    {
      path: "/sobre-nosotros",
      name: "Sobre Nosotros",
      icon: <FiCalendar className="nav-icon" />,
    },
    ...(esAdmin
      ? [
        {
          path: "/administracion",
          name: "Administración",
          icon: <FiSettings className="nav-icon" />,
        },
      ]
      : []),
    ...(esUsuarioNormal
      ? [
        {
          path: "/historial",
          name: "Mi Historial",
          icon: <FiShield className="nav-icon" />,
        },
      ]
      : []),
    {/*{
      path: "/contacto",
      name: "Contacto",
      icon: <FiMail className="nav-icon" />,
    },*/}
  ];

  const BorderAll = {
    borderRadius: "12px",
    border: "2px solid #ccc",
  };

  const handleLoginSuccess = (userData, token) => {
    login(userData, token);
    setShowLoginModal(false);
  
    setExpanded(false); // 👈 Esto recoge el menú al iniciar sesión
  
    const roles = Array.isArray(userData.roles)
      ? userData.roles
      : typeof userData.roles === "string"
        ? userData.roles.split(",").map((r) => r.trim()).filter(Boolean)
        : [];
  
    if (roles.includes("Administrador")) {
      navigate("/admin/dashboard");
    } else if (roles.includes("Usuario") || roles.includes("usuario_normal")) {
      navigate("/historial");
    } else {
      navigate("/inicio");
    }
  };
  

  const handleLogout = () => {
    logout();
    navigate("/inicio");
  };

  return (
    <>
      <BsNavbar
        bg="dark"
        variant="dark"
        expand="lg"
        fixed="top"
        className="navbar-custom shadow"
        expanded={expanded}
      >
        <Container fluid="xxl">
          <BsNavbar.Brand
            as={Link}
            to="/inicio"
            className="d-flex align-items-center brand-container"
            onClick={() => setExpanded(false)}
          >
            <Image
              src={logo_izquierdo}
              alt="Logo"
              height="80"
              className="me-2 brand-logo"
              style={BorderAll}
            />
            <h5 className="brand-text mx-4">VACUNACIÓN HMEP</h5>
          </BsNavbar.Brand>
      

          <BsNavbar.Toggle
            aria-controls="main-navbar"
            onClick={() => setExpanded(!expanded)}
            className="navbar-toggle"
            />

      <BsNavbar.Collapse id="main-navbar" className="justify-content-between">
        <Nav className="mx-auto mx-lg-0">
          {navItems.map((item, idx) => (
            <Nav.Link
              key={item.path || idx} // ✅ Clave única para cada elemento
              as={Link}
              to={item.path}
              active={isActive(item.path)}
              className={`nav-link-custom ${isActive(item.path) ? "active" : ""}`}
              onClick={() => setExpanded(false)}
            >
              {item.icon}
              {item.name}
              {isActive(item.path) && (
                <span className="nav-active-indicator"></span>
              )}
            </Nav.Link>
          ))}

    {user && (
      <Dropdown className="d-lg-none mobile-dropdown">
        <Dropdown.Toggle variant="dark" className="nav-link-custom">
          <FiUser className="nav-icon" />
          {user.nombre_completo || "Usuario"}
          <FiChevronDown className="ms-1" />
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-menu-dark">
          {!esUsuarioNormal && (
            <>
            <Dropdown.Item
                as={Link}
                to="/perfil"
                onClick={() => setExpanded(false)}
              >
                Perfil
              </Dropdown.Item>
              <Dropdown.Item
                as={Link}
                to="/configuracion"
                onClick={() => setExpanded(false)}
              >
                Configuración
              </Dropdown.Item>
              <Dropdown.Divider />
            </>
          )}
          <Dropdown.Item onClick={handleLogout}>
            Cerrar sesión
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    )}
  </Nav>

  <div className="d-flex gap-2 auth-buttons">
    {!user ? (
      <Button
        variant="success"
        size="sm"
        className="btn-login"
        onClick={() => setShowLoginModal(true)}
      >
        <FiLogIn className="me-1" />
        Iniciar sesión
      </Button>
    ) : (
      <Dropdown className="d-none d-lg-block">
        <Dropdown.Toggle variant="dark" className="user-dropdown">
          <FiUser className="me-1" />
          <span className="d-none d-xl-inline">
            {user.nombre_completo || "Usuario"}
          </span>
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-menu-dark">
          {!esUsuarioNormal && (
            <>
             {/** <Dropdown.Item
                as={Link}
                to="/perfil"
                onClick={() => setExpanded(false)}
              >
                Perfil
              </Dropdown.Item>
              */} 
              <Dropdown.Item
                as={Link}
                to="/configuracion"
                onClick={() => setExpanded(false)}
              >
                Configuración
              </Dropdown.Item>
              <Dropdown.Divider />
            </>
          )}
          <Dropdown.Item onClick={handleLogout}>
            Cerrar sesión
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    )}
  </div>
</BsNavbar.Collapse>

        </Container>
      </BsNavbar>

      {/* Modal de Inicio de Sesión */}
      <Modal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Body className="p-0">
          <IniciarSesion
            onLoginSuccess={handleLoginSuccess}
            onClose={() => setShowLoginModal(false)}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};
