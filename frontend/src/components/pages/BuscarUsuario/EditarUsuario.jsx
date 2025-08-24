import React, { useEffect } from "react";
import { Form, Button, Alert, Spinner, Row, Col } from "react-bootstrap";
import { FaUserTie } from "react-icons/fa";

const formateaFecha = (fecha) => {
  if (!fecha) return "";
  return fecha.split("T")[0];
};

const EditarUsuario = ({
  formularioEdicion,
  setFormularioEdicion,
  guardarEdicion,
  loadingEdicion,
  cancelarEdicion,
  error,
}) => {
  // Normaliza la fecha solo al cargar los datos de usuario
  useEffect(() => {
    if (formularioEdicion && formularioEdicion.fecha_nacimiento) {
      const fechaPlan = formateaFecha(formularioEdicion.fecha_nacimiento);
      if (formularioEdicion.fecha_nacimiento !== fechaPlan) {
        setFormularioEdicion((prev) => ({
          ...prev,
          fecha_nacimiento: fechaPlan,
        }));
      }
    }
    // eslint-disable-next-line
  }, [formularioEdicion?.id]);

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "";
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad >= 0 && edad <= 120 ? edad.toString() : "";
  };

  if (
    !formularioEdicion ||
    typeof formularioEdicion !== "object" ||
    Object.keys(formularioEdicion).length === 0
  ) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <div className="mt-2">Cargando datos del usuario...</div>
      </div>
    );
  }

  // Asegura el campo cargo
  if (typeof formularioEdicion.cargo === "undefined") {
    formularioEdicion.cargo = "";
  }

  // Guardar: deja la gestión del modal de éxito al padre
  const handleGuardar = async () => {
    if (
      !formularioEdicion ||
      !formularioEdicion.nombre_completo ||
      !formularioEdicion.dni
    ) {
      alert("Nombre y DNI son obligatorios.");
      return;
    }
    await guardarEdicion();
  };

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre Completo *</Form.Label>
              <Form.Control
                autoFocus
                value={formularioEdicion.nombre_completo || ""}
                onChange={(e) =>
                  setFormularioEdicion({
                    ...formularioEdicion,
                    nombre_completo: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>DNI *</Form.Label>
              <Form.Control
                value={formularioEdicion.dni || ""}
                onChange={(e) =>
                  setFormularioEdicion({
                    ...formularioEdicion,
                    dni: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Teléfono *</Form.Label>
              <Form.Control
                value={formularioEdicion.telefono || ""}
                onChange={(e) =>
                  setFormularioEdicion({
                    ...formularioEdicion,
                    telefono: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Correo Electrónico *</Form.Label>
              <Form.Control
                type="email"
                value={formularioEdicion.correo || ""}
                onChange={(e) =>
                  setFormularioEdicion({
                    ...formularioEdicion,
                    correo: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Edad</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ej: 30"
                value={formularioEdicion.edad || ""}
                onChange={(e) =>
                  setFormularioEdicion({
                    ...formularioEdicion,
                    edad: e.target.value,
                  })
                }
                min={0}
                max={120}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha de Nacimiento</Form.Label>
              <Form.Control
                type="date"
                value={formularioEdicion.fecha_nacimiento || ""}
                onChange={(e) => {
                  const nuevaFecha = e.target.value;
                  const edadCalculada = calcularEdad(nuevaFecha);
                  setFormularioEdicion({
                    ...formularioEdicion,
                    fecha_nacimiento: nuevaFecha,
                    edad: edadCalculada,
                  });
                }}
                pattern="\d{4}-\d{2}-\d{2}"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                placeholder="Opcional"
                value={formularioEdicion.direccion || ""}
                onChange={(e) =>
                  setFormularioEdicion({
                    ...formularioEdicion,
                    direccion: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Área Laboral</Form.Label>
              <Form.Control
                placeholder="Ej: Enfermería"
                value={formularioEdicion.area_laboral || ""}
                onChange={(e) =>
                  setFormularioEdicion({
                    ...formularioEdicion,
                    area_laboral: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FaUserTie className="me-1" /> Cargo
              </Form.Label>
              <Form.Control
                placeholder="Ej: Enfermero(a)"
                value={formularioEdicion.cargo || ""}
                onChange={(e) =>
                  setFormularioEdicion({
                    ...formularioEdicion,
                    cargo: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button
            variant="success"
            onClick={handleGuardar}
            disabled={loadingEdicion}
          >
            {loadingEdicion ? (
              <>
                <Spinner as="span" size="sm" animation="border" /> Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={cancelarEdicion}
            disabled={loadingEdicion}
          >
            Cancelar
          </Button>
        </div>
      </Form>
    </>
  );
};

export default EditarUsuario;
