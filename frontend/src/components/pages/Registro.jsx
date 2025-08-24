import React, { useState } from "react";
import {
  FaUser,
  FaIdCard,
  FaBirthdayCake,
  FaHome,
  FaBriefcase,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaUserTie,
} from "react-icons/fa";
import { Modal, Button, Row, Col, Form, Spinner, InputGroup } from "react-bootstrap";
import { addUser } from "../../api";

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre_completo: "",
    dni: "",
    edad: "",
    fecha_nacimiento: "",
    direccion: "",
    area_laboral: "",
    cargo: "",
    telefono: "",
    correo: "",
    password: "",
    confirmPassword: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "fecha_nacimiento") {
      const edadCalculada = calcularEdad(value);
      setFormData({
        ...formData,
        fecha_nacimiento: value,
        edad: edadCalculada >= 0 && edadCalculada <= 120 ? edadCalculada.toString() : "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validatePassword = (password) => {
    const lengthValid = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return lengthValid && hasUppercase && hasNumber && hasSymbol;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const requiredFields = [
      "nombre_completo",
      "dni",
      "edad",
      "fecha_nacimiento",
      "telefono",
      "correo",
      "direccion",
      "area_laboral",
      "cargo",
      "password",
      "confirmPassword",
    ];

    if (requiredFields.some((field) => !formData[field])) {
      setErrorMessage("Todos los campos deben ser completados.");
      setIsSubmitting(false);
      return;
    }

    if (formData.dni.length !== 13) {
      setErrorMessage("El DNI debe tener exactamente 13 caracteres.");
      setIsSubmitting(false);
      return;
    }

    if (isNaN(formData.edad) || formData.edad <= 0 || formData.edad > 120) {
      setErrorMessage("La edad debe ser entre 1 y 120 años.");
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      setIsSubmitting(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      setErrorMessage(
        "La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, un número y un símbolo."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const { confirmPassword, ...userData } = formData;
      await addUser(userData);
      setShowModal(true);
      setFormData({
        nombre_completo: "",
        dni: "",
        edad: "",
        fecha_nacimiento: "",
        direccion: "",
        area_laboral: "",
        cargo: "",
        telefono: "",
        correo: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error || "Error al registrar. Inténtelo nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container ">
      <div className="bg-light rounded shadow p-4 mx-auto" style={{ maxWidth: "750px" }}>
        <h4 className="text-center mb-4 mt-4">
          <FaUser className="me-2" /> Registro de Usuario
        </h4>

        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Campos generales */}
            {[
              { label: "Nombre Completo*", icon: <FaUser />, name: "nombre_completo", type: "text" },
              { label: "DNI*", icon: <FaIdCard />, name: "dni", type: "text", maxLength: 13 },
              { label: "Fecha de Nacimiento*", icon: <FaBirthdayCake />, name: "fecha_nacimiento", type: "date" },
              { label: "Edad*", icon: null, name: "edad", type: "number" },
              { label: "Dirección*", icon: <FaHome />, name: "direccion", type: "text" },
              { label: "Área Laboral*", icon: <FaBriefcase />, name: "area_laboral", type: "text" },
              { label: "Cargo*", icon: <FaUserTie />, name: "cargo", type: "text" },
              { label: "Teléfono*", icon: <FaPhone />, name: "telefono", type: "tel" },
              { label: "Correo Electrónico*", icon: <FaEnvelope />, name: "correo", type: "email" },
            ].map((field, idx) => (
              <Col xs={12} md={6} className="mb-2" key={idx}>
                <Form.Label>
                  {field.icon && <span className="me-1">{field.icon}</span>} {field.label}
                </Form.Label>
                <Form.Control
                  type={field.type}
                  name={field.name}
                  maxLength={field.maxLength}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                />
              </Col>
            ))}

            {/* Contraseña */}           
            <Col xs={12} md={6} className="mb-2">
              <Form.Label><FaLock className="me-1" /> Contraseña*</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Ingrese contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
            </Col>

            {/* Confirmar Contraseña */}
            <Col xs={12} md={6} className="mb-2">
              <Form.Label><FaLock className="me-1" /> Confirmar Contraseña*</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirme contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
            </Col>
          </Row>

          <Form.Text className="text-muted d-block mt-2">
            La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, un número y un símbolo.
          </Form.Text>

          {errorMessage && (
            <div className="alert alert-danger text-center mt-3">
              {errorMessage}
            </div>
          )}

          <div className="d-flex justify-content-center mt-3">
            <Button
              type="submit"
              variant="success"
              disabled={isSubmitting}
              style={{ width: "100%", maxWidth: "250px" }}
            >
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Registrando...
                </>
              ) : (
                "Registrar"
              )}
            </Button>
          </div>
        </Form>
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Body className="text-center">
          <FaCheckCircle className="text-success mb-3" size={50} />
          <h5>¡Registro Exitoso!</h5>
          <p>El usuario ha sido registrado correctamente.</p>
          <Button variant="success" onClick={() => setShowModal(false)}>
            Aceptar
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Registro;
