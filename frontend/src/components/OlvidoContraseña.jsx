import React, { useState } from "react";
import {
  Modal,
  Form,
  Button,
  Alert,
  Spinner,
  Container,
} from "react-bootstrap";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { InputGroup, FormControl } from "react-bootstrap";



const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const OlvidoContraseña = ({ show, handleClose }) => {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [pasoActual, setPasoActual] = useState(1);
  const [mostrarNueva, setMostrarNueva] = useState(false);
const [mostrarConfirmar, setMostrarConfirmar] = useState(false);


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState({
    show: false,
    message: "",
  });

  const resetForm = () => {
    setEmail("");
    setCodigo("");
    setNuevaContraseña("");
    setConfirmarContraseña("");
    setPasoActual(1);
    setError("");
  };

  const validarContraseña = (password) => {
    const longitudValida = password.length >= 8;
    const mayuscula = /[A-Z]/.test(password);
    const numero = /\d/.test(password);
    const caracterEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!longitudValida) return "La contraseña debe tener al menos 8 caracteres.";
    if (!mayuscula) return "La contraseña debe contener al menos una letra mayúscula.";
    if (!numero) return "La contraseña debe contener al menos un número.";
    if (!caracterEspecial) return "La contraseña debe contener al menos un carácter especial.";

    return "";
  };

const handleSolicitarCodigo = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    await api.post("/auth/olvido-contrasena", { email }); // ✅ ya no lleva /api
    setSuccessModal({
      show: true,
      message: `Se ha enviado un código de verificación a ${email}.`,
    });
    setPasoActual(2);
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Error al solicitar recuperación de contraseña. Verifique el correo."
    );
  } finally {
    setLoading(false);
  }
};


 const handleVerificarCodigo = async (e) => {
   e.preventDefault();
   setError("");

   if (!codigo) {
     setError("Por favor ingrese el código de verificación.");
     return;
   }

   setLoading(true);
   try {
     await api.post("/auth/verificar-codigo", { email, codigo }); // ✅ sin /api
     setSuccessModal({
       show: true,
       message: "Código verificado correctamente.",
     });
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

   const validacion = validarContraseña(nuevaContraseña);
   if (validacion) {
     setError(validacion);
     return;
   }

   if (nuevaContraseña !== confirmarContraseña) {
     setError("Las contraseñas no coinciden.");
     return;
   }

   setLoading(true);
   try {
     await api.post("/auth/restablecer-contrasena", {
       // ✅ sin /api
       email,
       codigo,
       nuevaContraseña,
     });
     setSuccessModal({
       show: true,
       message:
         "Contraseña restablecida correctamente. Ya puede iniciar sesión.",
     });
     setTimeout(() => {
       handleClose();
       resetForm();
     }, 2500);
   } catch (err) {
     setError(
       err.response?.data?.message ||
         "Error al restablecer la contraseña. Intente nuevamente."
     );
   } finally {
     setLoading(false);
   }
 };


  return (
    <>
      {/* Modal de confirmación profesional */}
      <Modal
        show={successModal.show}
        onHide={() => setSuccessModal({ show: false, message: "" })}
        centered
      >
        <Modal.Body className="text-center p-4">
          <FaCheckCircle size={50} className="text-success mb-3" />
          <h5>{successModal.message}</h5>
          <Button
            variant="success"
            className="mt-3"
            onClick={() => setSuccessModal({ show: false, message: "" })}
          >
            Aceptar
          </Button>
        </Modal.Body>
      </Modal>

      <Modal
        show={show}
        onHide={() => {
          handleClose();
          resetForm();
        }}
        centered
        size="md"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">Recuperar Contraseña</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            {pasoActual === 1 && (
              <Form onSubmit={handleSolicitarCodigo}>
                <Form.Group className="mb-3">
                  <Form.Label>Correo registrado</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ingrese su correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">
                    Se enviará un código de verificación a este correo.
                  </Form.Text>
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Código"
                  )}
                </Button>
              </Form>
            )}

            {pasoActual === 2 && (
              <Form onSubmit={handleVerificarCodigo}>
                <Form.Group className="mb-3">
                  <Form.Label>Código de verificación</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingrese el código recibido"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">
                    Revise su bandeja de entrada o spam.
                  </Form.Text>
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100 mb-2" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Verificando...
                    </>
                  ) : (
                    "Verificar Código"
                  )}
                </Button>
                <Button
                  variant="link"
                  className="w-100"
                  onClick={() => {
                    setPasoActual(1);
                    setCodigo("");
                  }}
                >
                  Volver atrás
                </Button>
              </Form>
            )}

            {pasoActual === 3 && (
             <Form onSubmit={handleRestablecerContraseña}>
             <Form.Group className="mb-3">
               <Form.Label>Nueva contraseña</Form.Label>
               <InputGroup>
                 <FormControl
                   type={mostrarNueva ? "text" : "password"}
                   placeholder="Ingrese nueva contraseña"
                   value={nuevaContraseña}
                   onChange={(e) => setNuevaContraseña(e.target.value)}
                   required
                   disabled={loading}
                 />
                 <Button
                   variant="outline-secondary"
                   onClick={() => setMostrarNueva(!mostrarNueva)}
                   disabled={loading}
                   tabIndex={-1}
                 >
                   {mostrarNueva ? <FaEyeSlash /> : <FaEye />}
                 </Button>
               </InputGroup>
             </Form.Group>
           
             <Form.Group className="mb-4">
               <Form.Label>Confirmar contraseña</Form.Label>
               <InputGroup>
                 <FormControl
                   type={mostrarConfirmar ? "text" : "password"}
                   placeholder="Confirme la nueva contraseña"
                   value={confirmarContraseña}
                   onChange={(e) => setConfirmarContraseña(e.target.value)}
                   required
                   disabled={loading}
                 />
                 <Button
                   variant="outline-secondary"
                   onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                   disabled={loading}
                   tabIndex={-1}
                 >
                   {mostrarConfirmar ? <FaEyeSlash /> : <FaEye />}
                 </Button>
               </InputGroup>
             </Form.Group>
           
             <Form.Text className="text-muted mb-2 d-block">
               Debe tener al menos 8 caracteres, incluir una mayúscula, un número y un símbolo.
             </Form.Text>
           
             <Button type="submit" variant="primary" className="w-100 mt-2" disabled={loading}>
               {loading ? (
                 <>
                   <Spinner animation="border" size="sm" className="me-2" />
                   Actualizando...
                 </>
               ) : (
                 "Restablecer Contraseña"
               )}
             </Button>
           </Form>
           
            )}
          </Container>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default OlvidoContraseña;
