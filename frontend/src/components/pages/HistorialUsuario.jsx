import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Spinner,
  Alert,
  Row,
  Col,
  Button,
  Collapse,
} from "react-bootstrap";
import { FiDownload, FiXCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { generarCarnetSimplePDF } from "../../utils/generarCarnetSimplePDF";
import logoIzquierdo from "../../assets/img/logo_izquierdo.png";
import logoDerecho from "../../assets/img/logo_derecho.png";
import {
  FaIdCard,
  FaBirthdayCake,
  FaMapMarkerAlt,
  FaEnvelope,
  FaBriefcase,
  FaUser,
  FaPhone,
} from "react-icons/fa";

export default function HistorialUsuario({ onClose }) {
  const { usuario } = useAuth();
  const [vacunas, setVacunas] = useState([]);
  const [datosUsuario, setDatosUsuario] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [infoExpandida, setInfoExpandida] = useState(true);

  const calcularEdad = (fechaNac) => {
    if (!fechaNac) return "—";
    const cumple = new Date(fechaNac);
    const hoy = new Date();
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const m = hoy.getMonth() - cumple.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) edad--;
    return edad;
  };

  useEffect(() => {
    if (!usuario?.dni) {
      setError("No se encontró el DNI del usuario autenticado.");
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get(`/api/historial/${usuario.dni}`)
      .then((res) => {
        const user = res.data.usuario || {};
        user.edad = calcularEdad(user.fecha_nacimiento);
        setDatosUsuario(user);
        setVacunas(res.data.historial || []);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar el historial de vacunación.");
        setLoading(false);
      });
  }, [usuario]);

  const handleExport = async () => {
    await generarCarnetSimplePDF({
      historial: vacunas,
      usuario: datosUsuario,
      dni: usuario?.dni || "sin_dni",
    });
  };

  const procesarVacunasParaTabla = () => {
    const map = {};
    vacunas.forEach((v) => {
      const nombre = v.nombre_vacuna || "—";
      const fecha = v.fecha_aplicacion
        ? new Date(v.fecha_aplicacion).toLocaleDateString("es-ES")
        : "—";
      if (!map[nombre]) map[nombre] = [];
      map[nombre].push(fecha);
    });

    return Object.entries(map).map(([nombre, fechas]) => {
      const fechasOrdenadas = fechas
        .filter((f) => f !== "—")
        .sort((a, b) => {
          const [da, ma, ya] = a.split("/");
          const [db, mb, yb] = b.split("/");
          return new Date(`${ya}-${ma}-${da}`) - new Date(`${yb}-${mb}-${db}`);
        });
      const celdas = fechasOrdenadas.slice(0, 6);
      while (celdas.length < 6) celdas.push("");
      return [nombre, ...celdas];
    });
  };

  return (
    <div className="container py-3" style={{ maxWidth: 820 }}>
      <div className="d-flex gap-2 justify-content-end mb-3 print-hide">
        <Button variant="outline-success" size="sm" onClick={handleExport}>
          <FiDownload className="me-1" /> Exportar PDF
        </Button>
        {onClose && (
          <Button variant="secondary" size="sm" onClick={onClose}>
            <FiXCircle className="me-1" /> Cerrar
          </Button>
        )}
      </div>

      {/* Cabecera con logos */}
      <Card className="mb-3 shadow-sm border-0">
        <Card.Body>
          <Row className="align-items-center border-bottom pb-2 mb-3">
            <Col xs="auto">
              <img
                src={logoIzquierdo}
                alt="Logo Izquierdo"
                style={{ maxWidth: 80, borderRadius: 8 }}
              />
            </Col>
            <Col className="text-center">
              <h5 className="fw-bold mb-0">CARNET DE VACUNACIÓN</h5>
              <small className="text-muted">
                {new Date().toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </small>
            </Col>
            <Col xs="auto">
              <img
                src={logoDerecho}
                alt="Logo Derecho"
                style={{ maxWidth: 70, borderRadius: 8 }}
              />
            </Col>
          </Row>

          {/* Información del Paciente */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h3 className="mb-0">
              <FaUser className="me-2 text-primary" />              
              <span className="ms-2">{datosUsuario?.nombre_completo || "—"}</span>
            </h3>
            <Button
              variant="light"
              size="sm"
              onClick={() => setInfoExpandida(!infoExpandida)}
            >
              {infoExpandida ? "Ocultar ▲" : "Mostrar ▼"}
            </Button>
          </div>

          <Collapse in={infoExpandida}>
            <div>
              <Row>
                <Col md={6} className="mb-2">
                  <FaIdCard className="me-1 text-secondary" />
                  <strong>DNI:</strong> {datosUsuario?.dni || "—"}
                </Col>
                <Col md={6} className="mb-2">
                  <FaUser className="me-1 text-secondary" />
                  <strong>Nombre:</strong> {datosUsuario?.nombre_completo || "—"}
                </Col>
                <Col md={6} className="mb-2">
                  <FaBirthdayCake className="me-1 text-secondary" />
                  <strong>Fecha Nacimiento:</strong>{" "}
                  {datosUsuario?.fecha_nacimiento
                    ? new Date(datosUsuario.fecha_nacimiento).toLocaleDateString("es-ES")
                    : "—"}
                </Col>
                <Col md={6} className="mb-2">
                  <FaBirthdayCake className="me-1 text-secondary" />
                  <strong>Edad:</strong> {datosUsuario?.edad || "—"}
                </Col>
                <Col md={6} className="mb-2">
                  <FaMapMarkerAlt className="me-1 text-secondary" />
                  <strong>Dirección:</strong> {datosUsuario?.direccion || "—"}
                </Col>
                <Col md={6} className="mb-2">
                  <FaPhone className="me-1 text-secondary" />
                  <strong>Teléfono:</strong> {datosUsuario?.telefono || "—"}
                </Col>
                <Col md={6} className="mb-2">
                  <FaEnvelope className="me-1 text-secondary" />
                  <strong>Correo:</strong> {datosUsuario?.correo || "—"}
                </Col>
                <Col md={6} className="mb-2">
                  <FaBriefcase className="me-1 text-secondary" />
                  <strong>Área Laboral:</strong> {datosUsuario?.area_laboral || "—"}
                </Col>
                <Col md={6} className="mb-2">
                  <FaBriefcase className="me-1 text-secondary" />
                  <strong>Cargo:</strong> {datosUsuario?.cargo || "No especificado"}
                </Col>
              </Row>
            </div>
          </Collapse>
        </Card.Body>
      </Card>

      {/* Tabla de Historial de Vacunación */}
      <Card className="shadow-sm border-0">
  <Card.Body>
    <h6 className="fw-bold text-primary mb-3 text-center">
      Historial de Vacunación
    </h6>
    <div
      style={{
        maxHeight: "300px",
        overflowY: "auto",
        overflowX: "auto",
        position: "relative",
      }}
    >
      <Table
        bordered
        hover
        size="sm"
        className="table-striped text-center mb-0"
        style={{ minWidth: "600px" }}
      >
        <thead className="table-primary">
          <tr>
            <th
              style={{
                position: "sticky",
                left: 0,
                background: "#0d6efd",
                color: "white",
                zIndex: 2,
              }}
            >
              VACUNA
            </th>
            {(() => {
              const maxFechas = Math.max(
                ...Object.values(
                  vacunas.reduce((acc, curr) => {
                    const nombre = curr.nombre_vacuna || "—";
                    if (!acc[nombre]) acc[nombre] = 0;
                    acc[nombre]++;
                    return acc;
                  }, {})
                ),
                6 // mínimo 6 columnas
              );
              return Array.from({ length: maxFechas }, (_, i) => (
                <th key={i}>FECHA</th>
              ));
            })()}
          </tr>
        </thead>
        <tbody>
          {vacunas.length === 0 ? (
            <tr>
              <td colSpan={7}>No hay vacunas registradas.</td>
            </tr>
          ) : (
            Object.entries(
              vacunas.reduce((acc, curr) => {
                const nombre = curr.nombre_vacuna || "—";
                const fecha = curr.fecha_aplicacion
                  ? new Date(curr.fecha_aplicacion).toLocaleDateString("es-ES")
                  : "—";
                if (!acc[nombre]) acc[nombre] = [];
                acc[nombre].push(fecha);
                return acc;
              }, {})
            ).map(([nombre, fechas], idx) => {
              const fechasOrdenadas = fechas
                .filter((f) => f !== "—")
                .sort((a, b) => {
                  const [da, ma, ya] = a.split("/");
                  const [db, mb, yb] = b.split("/");
                  return (
                    new Date(`${ya}-${ma}-${da}`) -
                    new Date(`${yb}-${mb}-${db}`)
                  );
                });
              return (
                <tr key={idx}>
                  <td
                    style={{
                      position: "sticky",
                      left: 0,
                      background: "white",
                      zIndex: 1,
                      fontWeight: "bold",
                    }}
                  >
                    {nombre}
                  </td>
                  {fechasOrdenadas.map((f, i) => (
                    <td key={i}>{f}</td>
                  ))}
                  {Array(
                    Math.max(
                      0,
                      Math.max(
                        fechasOrdenadas.length,
                        Math.max(
                          ...Object.values(
                            vacunas.reduce((acc, curr) => {
                              const nombre = curr.nombre_vacuna || "—";
                              if (!acc[nombre]) acc[nombre] = 0;
                              acc[nombre]++;
                              return acc;
                            }, {})
                          ),
                          6
                        )
                      ) - fechasOrdenadas.length
                    )
                  )
                    .fill("")
                    .map((_, i) => (
                      <td key={i + fechasOrdenadas.length}></td>
                    ))}
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  </Card.Body>
</Card>


      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" />
          <div className="mt-2">Cargando...</div>
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}

      <style>
        {`
          @media print {
            .print-hide { display: none !important; }
          }
        `}
      </style>
    </div>
  );
}
