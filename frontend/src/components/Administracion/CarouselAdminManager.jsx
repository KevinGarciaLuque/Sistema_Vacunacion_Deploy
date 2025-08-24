import React, { useState, useCallback, useEffect } from "react";
import { Container, Row, Col, Button, Card, Image, Alert, Modal, Ratio } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud, FiTrash2, FiCheckCircle, FiXCircle } from "react-icons/fi";
import api from "../../api/axios";
import "../styles/CarruselAdmin.css";

const CarouselAdminManager = ({ onImagesUpdated, topMargin = "120px" }) => {
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState({ show: false, success: true, message: "" });

  const fetchImages = async () => {
    try {
      const { data } = await api.get("/api/carousel");
      setImages(data);
      if (onImagesUpdated) onImagesUpdated(data);
    } catch (error) {
      console.error(error);
      setMessage("❌ Error al cargar imágenes.");
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // CORREGIDO: Solo un método onDrop, usando campo "file"
  const onDrop = useCallback(async (acceptedFiles) => {
    const formData = new FormData();
    acceptedFiles.forEach((file) => formData.append("imagenes", file)); // ✅ NOMBRE CORRECTO
  
    try {
      const response = await api.post("/api/carousel/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      await fetchImages();
      setFeedbackModal({
        show: true,
        success: true,
        message: "✅ Imágenes subidas correctamente.",
      });
    } catch (error) {
      console.error("❌ Error subiendo imagen:", error);
      setFeedbackModal({
        show: true,
        success: false,
        message: "❌ Error al subir imágenes.",
      });
    }
  }, []);
  

  const confirmDelete = (imgUrl) => {
    setImageToDelete(imgUrl);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      await api.post("/api/carousel/delete", { url: imageToDelete });
      await fetchImages();
      setFeedbackModal({
        show: true,
        success: true,
        message: "✅ Imagen eliminada correctamente.",
      });
    } catch (error) {
      console.error(error);
      setFeedbackModal({
        show: true,
        success: false,
        message: "❌ Error al eliminar imagen.",
      });
    } finally {
      setShowConfirmModal(false);
      setImageToDelete(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  return (
    <Container className="my-4">
      <div style={{ marginTop: topMargin }}>
        <h3 className="text-center fw-bold mb-2">
          🖼️ Administrar Imágenes del Carrusel
        </h3>
        <div
          className="mx-auto mb-4"
          style={{
            height: "4px",
            width: "100px",
            background: "linear-gradient(90deg, #657eff 0%, #8b5cf6 100%)",
            borderRadius: "5px",
          }}
        ></div>
      </div>

      <div
        {...getRootProps()}
        className={`p-5 rounded-4 border text-center shadow-sm position-relative 
        ${isDragActive ? "bg-primary bg-opacity-10 border-primary" : "bg-light bg-opacity-50 border-0"}`}
        style={{
          cursor: "pointer",
          transition: "all 0.3s ease",
          borderStyle: "dashed",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <input {...getInputProps()} />
        <FiUploadCloud size={50} className="mb-2 text-primary" />
        {isDragActive ? (
          <p className="fw-semibold">Suelta las imágenes aquí...</p>
        ) : (
          <p className="fw-semibold text-secondary">
            Arrastra imágenes aquí o haz clic para seleccionar
          </p>
        )}
      </div>

      <h6 className="text-center mt-3 text-muted">
        Tamaño recomendado: 1280 x 675 px
      </h6>

      {message && (
        <Alert
          variant={message.startsWith("✅") ? "success" : "danger"}
          className="mt-3 text-center"
          dismissible
          onClose={() => setMessage(null)}
        >
          {message}
        </Alert>
      )}

      <Row className="mt-4 g-4">
        {images.length === 0 ? (
          <p className="text-center text-muted">No hay imágenes cargadas actualmente.</p>
        ) : (
          images.map((img, idx) => (
            <Col key={idx} xs={12} sm={6} md={4} lg={3}>
              <Card className="shadow-sm border-0 position-relative h-100">
                <div className="position-relative overflow-hidden rounded-3">
                  <Ratio aspectRatio="16x9">
                    <Image
                      src={img}
                      alt={`Slide ${idx + 1}`}
                      fluid
                      className="rounded-3"
                      style={{
                        objectFit: "contain",
                      }}
                    />
                  </Ratio>
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 m-2 rounded-circle shadow"
                    onClick={() => confirmDelete(img)}
                    title="Eliminar imagen"
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Modal Confirmación Eliminación */}
      <Modal centered show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Body className="text-center">
          <FiTrash2 size={48} className="text-danger mb-3" />
          <h5>¿Deseas eliminar esta imagen?</h5>
          <p className="text-muted">Esta acción no se puede deshacer.</p>
          <div className="d-flex justify-content-center mt-3">
            <Button variant="secondary" className="me-2" onClick={() => setShowConfirmModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirmed}>
              Eliminar
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal Feedback */}
      <Modal centered show={feedbackModal.show} onHide={() => setFeedbackModal({ ...feedbackModal, show: false })}>
        <Modal.Body className="text-center">
          {feedbackModal.success ? (
            <FiCheckCircle size={48} className="text-success mb-3" />
          ) : (
            <FiXCircle size={48} className="text-danger mb-3" />
          )}
          <h5>{feedbackModal.message}</h5>
          <div className="d-flex justify-content-center mt-3">
            <Button variant="primary" onClick={() => setFeedbackModal({ ...feedbackModal, show: false })}>
              Cerrar
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CarouselAdminManager;
