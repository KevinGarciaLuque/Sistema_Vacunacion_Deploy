import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import OlvidoContraseña from "../OlvidoContraseña";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const IniciarSesion = ({ onLoginSuccess, onClose }) => {
  const [credenciales, setCredenciales] = useState({ dni: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showRecuperar, setShowRecuperar] = useState(false);
  const { login } = useAuth();
 


  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredenciales((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const response = await api.post("/auth/login", credenciales); // ✅ sin /api
    const usuario = response.data.usuario;
    const token = response.data.token;

    login(usuario, token); // guarda en AuthContext y localStorage

    if (onLoginSuccess) {
      onLoginSuccess(usuario, token);
    }

    redirectByRole(usuario.roles);
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Error al iniciar sesión. Verifique sus credenciales."
    );
  } finally {
    setLoading(false);
  }
};


  const redirectByRole = (roles) => {
    if (!roles) {
      navigate("/inicio");
      return;
    }

    const parsedRoles = Array.isArray(roles)
      ? roles.map((r) => r.toLowerCase())
      : typeof roles === "string"
      ? roles.split(",").map((r) => r.trim().toLowerCase())
      : [];

    if (parsedRoles.includes("administrador")) {
      navigate("/admin/dashboard");
    } else if (parsedRoles.includes("usuario")) {
      navigate("/historial"); // ✅ redirige correctamente al historial del usuario normal
    } else {
      navigate("/inicio");
    }
  };

  return (
    <>
      <Container className="p-4">
        <Row className="justify-content-center">
          <Col xs={12} className="text-end">
            <button
              onClick={onClose}
              className="btn-close"
              aria-label="Close"
              disabled={loading}
            />
          </Col>
          <Col xs={12} md={10} lg={8}>
            <div className="text-center mb-4">
              <h2>Iniciar Sesión</h2>
              <p className="text-muted">Ingrese sus credenciales para continuar</p>
            </div>

            {error && (
              <Alert variant="danger" onClose={() => setError("")} dismissible>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>DNI</Form.Label>
                <Form.Control
                  type="text"
                  name="dni"
                  value={credenciales.dni}
                  onChange={handleChange}
                  placeholder="Ingrese su DNI"
                  required
                  disabled={loading}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={credenciales.password}
                  onChange={handleChange}
                  placeholder="Ingrese su contraseña"
                  required
                  disabled={loading}
                />
              </Form.Group>

              <div className="d-grid mb-3">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="py-2"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setShowRecuperar(true)}
                  className="text-decoration-none"
                >
                  ¿Olvidó su contraseña?
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>

      <OlvidoContraseña
        show={showRecuperar}
        handleClose={() => setShowRecuperar(false)}
      />
    </>
  );
};

export default IniciarSesion;
