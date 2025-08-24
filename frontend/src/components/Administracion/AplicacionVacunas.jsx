import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Row, Col, Card } from "react-bootstrap";
import { getVacunas, restarStockVacuna } from "../../api/vacunas";
import { addHistorialVacunacion, getHistorialPorUsuario } from "../../api/historial";
import { useAuth } from "../../context/AuthContext";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const AplicacionVacunas = ({ usuario_id, onClose }) => {
  const { usuario } = useAuth();

  const [vacunaId, setVacunaId] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [responsable, setResponsable] = useState("");
  const [vacunas, setVacunas] = useState([]);
  const [dosis, setDosis] = useState("1");
  const [viaAdministracion, setViaAdministracion] = useState("intramuscular");
  const [sitioAplicacion, setSitioAplicacion] = useState("brazo_izquierdo");
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });

  useEffect(() => {
    const fetchVacunas = async () => {
      try {
        const data = await getVacunas();
        const ordenadas = data.filter((v) => v.activa).sort((a, b) => b.id - a.id);
        setVacunas(ordenadas);
      } catch {
        setErrorModal({ show: true, message: "Error al cargar las vacunas." });
      }
    };

    const fetchHistorial = async () => {
      try {
        const data = await getHistorialPorUsuario(usuario_id);
        setHistorial(data);
      } catch {
        setErrorModal({ show: true, message: "Error al cargar el historial de vacunación." });
      }
    };

    fetchVacunas();
    fetchHistorial();
  }, [usuario_id]);

  useEffect(() => {
    if (!vacunaId) {
      setResponsable("");
      return;
    }
    const vacunaSeleccionada = vacunas.find((v) => v.id === parseInt(vacunaId));
    setResponsable(vacunaSeleccionada?.responsable || "");
  }, [vacunaId, vacunas]);

  const handleAplicarVacuna = async () => {
    if (!usuario_id || !vacunaId || !fecha || !responsable) {
      setErrorModal({ show: true, message: "Complete todos los campos antes de registrar la vacuna." });
      return;
    }

    // ✅ Mapeo de refuerzos antes de enviar
    const refuerzoMap = {
      "refuerzo_1": "7",
      "refuerzo_2": "8",
      "refuerzo_3": "9",
      "refuerzo_4": "10",
      "refuerzo_5": "11",
      "refuerzo_6": "12",
      "refuerzo_7": "14",

    };
    const dosisMapped = refuerzoMap[dosis] || dosis;

    const existeDosis = historial.find(
      (h) => h.vacuna_id === parseInt(vacunaId) && h.dosis.toString() === dosisMapped
    );

    if (
      ["1", "2", "3", "4", "5", "6", "refuerzo_1", "refuerzo_2", "refuerzo_3", "refuerzo_4", "refuerzo_5", "refuerzo_6", "refuerzo_7"].includes(dosis) &&
      existeDosis
    ) {
      setErrorModal({
        show: true,
        message: `El usuario ya tiene registrada esta vacuna con la dosis ${dosis} (fecha: ${new Date(
          existeDosis.fecha_aplicacion
        ).toLocaleDateString()}). No se puede registrar de nuevo.`,
      });
      return;
    }

    setLoading(true);
    try {
      const vacunaSeleccionada = vacunas.find((v) => v.id === parseInt(vacunaId));
      if (vacunaSeleccionada.stock_disponible <= 0) {
        setErrorModal({ show: true, message: "No hay stock disponible para esta vacuna." });
        setLoading(false);
        return;
      }

      let proximaDosis = null;
      if (vacunaSeleccionada?.intervalo_dias && fecha) {
        const fechaAplicacion = new Date(fecha);
        fechaAplicacion.setDate(fechaAplicacion.getDate() + vacunaSeleccionada.intervalo_dias);
        proximaDosis = fechaAplicacion.toISOString().split("T")[0];
      }

      const lote = vacunaSeleccionada?.lote || "SIN_LOTE";

      await addHistorialVacunacion({
        usuario_id,
        vacuna_id: vacunaId,
        dosis: dosisMapped, // ✅ ahora se envía como número
        fecha_aplicacion: fecha,
        proxima_dosis: proximaDosis,
        estado: "Aplicada",
        via_administracion: viaAdministracion,
        sitio_aplicacion: sitioAplicacion,
        responsable,
        lote,
      });

      await restarStockVacuna(vacunaId);

      setShowSuccessModal(true);
    } catch (error) {
      setErrorModal({
        show: true,
        message: error.response?.data?.error || "Error al registrar la vacuna.",
      });
    } finally {
      setLoading(false);
    }
  };

  const vacunaSeleccionada = vacunas.find((v) => v.id === parseInt(vacunaId));

  return (
    <>
      <Modal.Body>
        {/* Tarjeta flotante de stock */}
        {vacunaSeleccionada && (
          <div style={{
            position: 'absolute',
            top: '-10px',
            right: '40px',
            zIndex: 10,
            width: '200px'
          }}>
            <Card bg="info" text="black" className="shadow rounded">
              <Card.Body className="p-2 text-center">
                <small className="fw-bold">
                  Stock de {vacunaSeleccionada.nombre}
                </small>
                <h4 className="mb-0">
                  {vacunaSeleccionada.stock_disponible ?? 0}
                </h4>
                <small>disponibles</small>
                <div>
                  <small className="fw-bold">Lote:</small>{" "}
                  {vacunaSeleccionada.lote || "SIN_LOTE"}
                </div>
              </Card.Body>
            </Card>
          </div>
        )}

        <div className="py-3 mx-4">
          <h4 className="mb-4">Aplicar Nueva Vacuna</h4>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Vacuna *</Form.Label>
                <Form.Select
                  value={vacunaId}
                  onChange={(e) => setVacunaId(e.target.value)}
                  disabled={loading}
                  size="sm"
                >
                  <option value="">Seleccione una vacuna</option>
                  {vacunas.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Fecha de Aplicación *</Form.Label>
                <Form.Control
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  disabled={loading}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Dosis *</Form.Label>
                <Form.Select
                  value={dosis}
                  onChange={(e) => setDosis(e.target.value)}
                  disabled={loading}
                >
                  <option value="1">1ª dosis</option>
                  <option value="2">2ª dosis</option>
                  <option value="3">3ª dosis</option>
                  <option value="4">4ª dosis</option>
                  <option value="5">5ª dosis</option>
                  <option value="6">6ª dosis</option>
                  <option value="refuerzo_1">Refuerzo 1</option>
                  <option value="refuerzo_2">Refuerzo 2</option>
                  <option value="refuerzo_3">Refuerzo 3</option>
                  <option value="refuerzo_4">Refuerzo 4</option>
                  <option value="refuerzo_5">Refuerzo 5</option>
                  <option value="refuerzo_6">Refuerzo 6</option>
                  <option value="refuerzo_7">Refuerzo 7</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Vía de Administración</Form.Label>
                <Form.Select
                  value={viaAdministracion}
                  onChange={(e) => setViaAdministracion(e.target.value)}
                  disabled={loading}
                >
                  <option value="intramuscular">Intramuscular</option>
                  <option value="subcutanea">Subcutánea</option>
                  <option value="oral">Oral</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Sitio de Aplicación</Form.Label>
                <Form.Select
                  value={sitioAplicacion}
                  onChange={(e) => setSitioAplicacion(e.target.value)}
                  disabled={loading}
                >
                  <option value="brazo_izquierdo">Brazo izquierdo</option>
                  <option value="brazo_derecho">Brazo derecho</option>
                  <option value="muslo_izquierdo">Muslo izquierdo</option>
                  <option value="muslo_derecho">Muslo derecho</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Responsable *</Form.Label>
                <Form.Control
                  className="w-50"
                  type="text"
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  disabled={loading}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => onClose(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleAplicarVacuna} disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Registrando...
                </>
              ) : (
                "Registrar Vacuna"
              )}
            </Button>
          </div>
        </div>
      </Modal.Body>

      {/* Modal de Éxito */}
      <Modal show={showSuccessModal} onHide={() => { setShowSuccessModal(false); onClose(true); }} centered>
        <Modal.Body className="text-center p-4">
          <FaCheckCircle size={60} className="text-success mb-3" />
          <h4>Vacuna aplicada correctamente</h4>
          <Button variant="success" onClick={() => { setShowSuccessModal(false); onClose(true); }}>
            Aceptar
          </Button>
        </Modal.Body>
      </Modal>

      {/* Modal de Error */}
      <Modal show={errorModal.show} onHide={() => setErrorModal({ show: false, message: "" })} centered>
        <Modal.Body className="text-center p-4">
          <FaExclamationTriangle size={60} className="text-warning mb-3" />
          <h5>{errorModal.message}</h5>
          <Button variant="warning" onClick={() => setErrorModal({ show: false, message: "" })}>
            Cerrar
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AplicacionVacunas;
