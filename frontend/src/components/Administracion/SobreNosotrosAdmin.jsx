import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
  Image,
  Modal,
} from "react-bootstrap";
import { toast } from "react-toastify";
import {
  getSobreNosotros,
  updateSobreNosotros,
  addSeccion,
  updateSeccion,
  deleteSeccion,
  uploadImagen,
} from "../../api/sobreNosotros";
import { FaTrash, FaSave, FaPlus, FaListOl } from "react-icons/fa";

const SobreNosotrosAdmin = () => {
  const [contenido, setContenido] = useState({
    titulo: "",
    subtitulo: "",
    ctaTitulo: "",
    ctaDescripcion: "",
    secciones: [],
  });
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ show: false, title: "", message: "", onConfirm: null });

  const fetchContenido = async () => {
    setLoading(true);
    try {
      const data = await getSobreNosotros();
      setContenido(data);
    } catch (err) {
      console.error("❌ Error cargando Sobre Nosotros:", err);
      setError("Error al cargar la información.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContenido();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContenido((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await updateSobreNosotros(contenido);
      setModal({
        show: true,
        title: "✅ Información guardada",
        message: "La información general ha sido actualizada correctamente.",
        onConfirm: null,
      });
      fetchContenido();
    } catch (err) {
      console.error("❌ Error al guardar:", err);
      toast.error("Error al guardar.");
    } finally {
      setGuardando(false);
    }
  };

  const handleAgregarSeccion = async () => {
    const nuevaSeccion = {
      titulo: "Nuevo título",
      descripcion: "Descripción de prueba.",
      imagen: "",
      imagenPosicion: "left",
      puntos: ["Punto 1", "Punto 2", "Punto 3"],
    };
    try {
      await addSeccion(nuevaSeccion);
      setModal({
        show: true,
        title: "✅ Sección agregada",
        message: "La nueva sección se ha agregado correctamente.",
        onConfirm: null,
      });
      fetchContenido();
    } catch (err) {
      console.error("❌ Error al agregar sección:", err);
      toast.error("Error al agregar sección.");
    }
  };

  const handleActualizarSeccion = async (idx) => {
    const seccion = contenido.secciones[idx];
    try {
      await updateSeccion(idx, seccion);
      setModal({
        show: true,
        title: "✅ Sección actualizada",
        message: `La sección "${seccion.titulo}" ha sido actualizada correctamente.`,
        onConfirm: null,
      });
      fetchContenido();
    } catch (err) {
      console.error("❌ Error al actualizar sección:", err);
      toast.error("Error al actualizar sección.");
    }
  };

  const handleEliminarSeccion = (idx) => {
    const seccion = contenido.secciones[idx];
    setModal({
      show: true,
      title: "❌ Confirmar eliminación",
      message: `¿Estás seguro de eliminar la sección "${seccion.titulo}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          await deleteSeccion(idx);
          toast.success(`✅ Sección "${seccion.titulo}" eliminada correctamente.`);
          fetchContenido();
        } catch (err) {
          console.error("❌ Error al eliminar sección:", err);
          toast.error("Error al eliminar sección.");
        } finally {
          setModal({ show: false, title: "", message: "", onConfirm: null });
        }
      },
    });
  };

  const handleImageUpload = async (idx, file) => {
    try {
      toast.info("Subiendo imagen...");
      const url = await uploadImagen(file);
      const finalUrl = url.startsWith("http")
        ? url
        : `${import.meta.env.VITE_API_URL || "http://localhost:3000"}${url.startsWith("/") ? "" : "/"}${url}`;
      const updatedSecciones = [...contenido.secciones];
      updatedSecciones[idx].imagen = finalUrl;
      setContenido((prev) => ({ ...prev, secciones: updatedSecciones }));
      await updateSeccion(idx, updatedSecciones[idx]);
      toast.success("✅ Imagen subida correctamente.");
      fetchContenido();
    } catch (err) {
      console.error("❌ Error subiendo imagen:", err);
      toast.error("Error al subir imagen.");
    }
  };

  return (
    <div className="container" style={{ maxWidth: "850px" }}>
      <Card className="p-4 shadow-sm">
        <h5 className="mb-4 text-primary fw-bold">⚙️ Configuración - Sobre Nosotros</h5>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Cargando información...</p>
          </div>
        ) : (
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Título Principal</Form.Label>
                <Form.Control
                  type="text"
                  name="titulo"
                  value={contenido.titulo}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md={6}>
                <Form.Label>Subtítulo</Form.Label>
                <Form.Control
                  type="text"
                  name="subtitulo"
                  value={contenido.subtitulo}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md={6}>
                <Form.Label>Título CTA</Form.Label>
                <Form.Control
                  type="text"
                  name="ctaTitulo"
                  value={contenido.ctaTitulo}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md={6}>
                <Form.Label>Descripción CTA</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="ctaDescripcion"
                  value={contenido.ctaDescripcion}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>

            <div className="mt-4 d-flex gap-2">
              <Button variant="primary" onClick={handleGuardar} disabled={guardando}>
                {guardando ? "Guardando..." : "💾 Guardar Información"}
              </Button>
              <Button variant="secondary" onClick={handleAgregarSeccion}>
                <FaPlus className="me-1" /> Agregar Sección
              </Button>
            </div>

            <hr className="my-4" />
            <h6 className="fw-bold text-secondary">📌 Secciones</h6>

            {contenido.secciones.map((sec, idx) => (
              <Card
                key={idx}
                className="p-3 mb-4 shadow-sm border"
                style={{ background: "#f9fafb", borderLeft: "5px solid #0d6efd" }}
              >
                <div className="mb-2 text-primary fw-semibold d-flex align-items-center">
                  <FaListOl className="me-2" /> Sección {idx + 1}: <span className="ms-1">{sec.titulo || "Sin título"}</span>
                </div>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label>Título</Form.Label>
                    <Form.Control
                      value={sec.titulo}
                      onChange={(e) => {
                        const updated = [...contenido.secciones];
                        updated[idx].titulo = e.target.value;
                        setContenido((prev) => ({ ...prev, secciones: updated }));
                      }}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Posición Imagen</Form.Label>
                    <Form.Select
                      value={sec.imagenPosicion}
                      onChange={(e) => {
                        const updated = [...contenido.secciones];
                        updated[idx].imagenPosicion = e.target.value;
                        setContenido((prev) => ({ ...prev, secciones: updated }));
                      }}
                    >
                      <option value="left">Izquierda</option>
                      <option value="right">Derecha</option>
                    </Form.Select>
                  </Col>
                  <Col md={12}>
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={sec.descripcion}
                      onChange={(e) => {
                        const updated = [...contenido.secciones];
                        updated[idx].descripcion = e.target.value;
                        setContenido((prev) => ({ ...prev, secciones: updated }));
                      }}
                    />
                  </Col>
                  <Col md={12}>
                    <Form.Label>Puntos</Form.Label>
                    {sec.puntos.map((punto, i) => (
                      <Form.Control
                        key={i}
                        className="mb-2"
                        value={punto}
                        onChange={(e) => {
                          const updated = [...contenido.secciones];
                          updated[idx].puntos[i] = e.target.value;
                          setContenido((prev) => ({ ...prev, secciones: updated }));
                        }}
                      />
                    ))}
                  </Col>
                  <Col md={12}>
                    <Form.Label>Imagen</Form.Label>
                    <div className="d-flex align-items-center gap-3">
                      {sec.imagen ? (
                        <Image src={sec.imagen} rounded height={80} />
                      ) : (
                        <span className="text-muted">Sin imagen</span>
                      )}
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files[0]) handleImageUpload(idx, e.target.files[0]);
                        }}
                      />
                    </div>
                  </Col>
                </Row>
                <div className="mt-3 d-flex gap-2 justify-content-end">
                  <Button variant="success" size="sm" onClick={() => handleActualizarSeccion(idx)}>
                    <FaSave className="me-1" /> Guardar
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleEliminarSeccion(idx)}>
                    <FaTrash className="me-1" /> Eliminar
                  </Button>
                </div>
              </Card>
            ))}
          </Form>
        )}

        {/* Modal Reutilizable */}
        <Modal
          show={modal.show}
          onHide={() => setModal({ show: false, title: "", message: "", onConfirm: null })}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{modal.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{modal.message}</Modal.Body>
          <Modal.Footer>
            {modal.onConfirm ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setModal({ show: false, title: "", message: "", onConfirm: null })}
                >
                  Cancelar
                </Button>
                <Button variant="danger" onClick={modal.onConfirm}>
                  Confirmar
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                onClick={() => setModal({ show: false, title: "", message: "", onConfirm: null })}
              >
                Cerrar
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </Card>
    </div>
  );
};

export default SobreNosotrosAdmin;
