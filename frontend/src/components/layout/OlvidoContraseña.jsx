import React, { useState } from "react";
import {
  Modal,
  Form,
  Button,
  Alert,
  Spinner,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const OlvidoContraseña = ({ show, handleClose }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [pasoActual, setPasoActual] = useState(1);
  const [codigo, setCodigo] = useState("");
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");

  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/auth/olvido-contrasena`, { email });
      setSuccess(`Se ha enviado un código de verificación a ${email}`);
      setPasoActual(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error al solicitar recuperación de contraseña. Verifique el email."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    setError("");

    if (!codigo) {
      setError("Por favor ingrese el código de verificación");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/verificar-codigo`, {
        email,
        codigo,
      });
      setSuccess("Código verificado correctamente");
      setPasoActual(3);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Código inválido o expirado. Intente nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestablecerContraseña = async (e) => {
    e.preventDefault();
    setError("");

    if (nuevaContraseña !== confirmarContraseña) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (nuevaContraseña.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/restablecer-contrasena`, {
        email,
        codigo,
        nuevaContraseña,
      });
      setSuccess(
        "Contraseña restablecida correctamente. Ya puede iniciar sesión."
      );
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error al restablecer la contraseña. Intente nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setCodigo("");
    setNuevaContraseña("");
    setConfirmarContraseña("");
    setError("");
    setSuccess("");
    setPasoActual(1);
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        handleClose();
        resetForm();
      }}
      centered
      size="lg"
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title className="w-100 text-center">
          Recuperar Contraseña
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          {error && (
            <Alert variant="danger" onClose={() => setError("")} dismissible>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" onClose={() => setSuccess("")} dismissible>
              {success}
            </Alert>
          )}

          {pasoActual === 1 && (
            <Form onSubmit={handleSolicitarCodigo}>
              <Form.Group className="mb-4">
                <Form.Label>Email registrado</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingrese su email"
                  required
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Le enviaremos un código de verificación a este email.
                </Form.Text>
              </Form.Group>

              <div className="d-grid gap-2">
                <Button variant="primary" type="submit" disabled={loading}>
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
                      Enviando código...
                    </>
                  ) : (
                    "Continuar"
                  )}
                </Button>
              </div>
            </Form>
          )}

          {pasoActual === 2 && (
            <Form onSubmit={handleVerificarCodigo}>
              <Form.Group className="mb-3">
                <Form.Label>Código de verificación</Form.Label>
                <Form.Control
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Ingrese el código recibido"
                  required
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Revise su bandeja de entrada o spam.
                </Form.Text>
              </Form.Group>

              <div className="d-grid gap-2 mb-3">
                <Button variant="primary" type="submit" disabled={loading}>
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
                      Verificando...
                    </>
                  ) : (
                    "Verificar Código"
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => {
                    setPasoActual(1);
                    setSuccess("");
                  }}
                >
                  Volver atrás
                </Button>
              </div>
            </Form>
          )}

          {pasoActual === 3 && (
            <Form onSubmit={handleRestablecerContraseña}>
              <Form.Group className="mb-3">
                <Form.Label>Nueva contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={nuevaContraseña}
                  onChange={(e) => setNuevaContraseña(e.target.value)}
                  placeholder="Ingrese nueva contraseña"
                  required
                  disabled={loading}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Confirmar contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmarContraseña}
                  onChange={(e) => setConfirmarContraseña(e.target.value)}
                  placeholder="Confirme la nueva contraseña"
                  required
                  disabled={loading}
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button variant="primary" type="submit" disabled={loading}>
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
                      Actualizando...
                    </>
                  ) : (
                    "Restablecer Contraseña"
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Container>
      </Modal.Body>
    </Modal>
  );
};

export default OlvidoContraseña;
