import React, { useEffect, useState, useRef } from "react";
import { fetchHistorialVacunacion } from "../../api/historial";
import { 
  FaTimes, 
  FaPrint, 
  FaChevronDown, 
  FaChevronUp,
  FaUser,
  FaIdCard,
  FaBirthdayCake,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBriefcase,
  FaUserNurse,
  FaSyringe,
  FaCalendarAlt,
  FaCalendarCheck,
  FaCheckCircle,
  FaExclamationCircle,
  FaFilePdf
} from "react-icons/fa";
import {
  Button,
  Modal,
  Container,
  Row,
  Col,
  Spinner,
  Table,
  Alert,
  Badge,
  Card,
  Dropdown
} from "react-bootstrap";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const HistorialVacunacion = ({ dni, onClose, usuario }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vacunasExpandidas, setVacunasExpandidas] = useState({});
  const [showPrintModal, setShowPrintModal] = useState(false);
  const pdfRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      if (!dni) return;
      setLoading(true);
      setError(null);
      try {
        const historialArray = await fetchHistorialVacunacion(dni);
        const historialOrdenado = historialArray.sort((a, b) =>
          a.nombre_vacuna.localeCompare(b.nombre_vacuna)
        );
        setHistorial(historialOrdenado);
        
        toast.success(`Historial cargado correctamente`, {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message || "Error al cargar el historial";
        setError(errorMsg);
        toast.error(errorMsg, {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dni]);

  const toggleVacuna = (nombreVacuna) => {
    setVacunasExpandidas(prev => ({
      ...prev,
      [nombreVacuna]: !prev[nombreVacuna]
    }));
  };

  const expandirTodas = () => {
    const todasExpandidas = {};
    Object.keys(vacunasAgrupadas).forEach(vacuna => {
      todasExpandidas[vacuna] = true;
    });
    setVacunasExpandidas(todasExpandidas);
  };

  const colapsarTodas = () => {
    setVacunasExpandidas({});
  };

  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const printHistorial = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(generatePrintContent());
    printWindow.document.close();
    setShowPrintModal(false);
    toast.success("Preparando documento para impresión...", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const downloadPDF = async () => {
    toast.info("Generando PDF, por favor espere...", {
      position: "top-right",
      autoClose: 3000,
    });

    try {
      // Opción 1: Usar html2canvas para capturar el componente (menos preciso pero más rápido)
      // await downloadPDFWithCanvas();
      
      // Opción 2: Generar PDF directamente con contenido estructurado (mejor calidad)
      generateStructuredPDF();
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast.error("Error al generar el PDF", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const downloadPDFWithCanvas = async () => {
    const input = pdfRef.current;
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = canvas.height * imgWidth / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`historial_vacunacion_${dni}.pdf`);
    
    toast.success("PDF generado correctamente", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const generateStructuredPDF = () => {
    const pdf = new jsPDF('p', 'pt', 'a4');
    const margin = 40;
    let yPos = margin;
    
    // Estilos
    pdf.setFont('helvetica');
    
    // Encabezado
    pdf.setFontSize(20);
    pdf.setTextColor(44, 62, 80);
    pdf.text('Historial de Vacunación', margin, yPos);
    yPos += 30;
    
    pdf.setFontSize(12);
    pdf.setTextColor(85, 85, 85);
    pdf.text('Sistema de Gestión de Vacunación', margin, yPos);
    yPos += 40;
    
    // Línea divisoria
    pdf.setDrawColor(44, 62, 80);
    pdf.setLineWidth(1);
    pdf.line(margin, yPos, pdf.internal.pageSize.width - margin, yPos);
    yPos += 30;
    
    // Datos del paciente
    pdf.setFontSize(14);
    pdf.setTextColor(44, 62, 80);
    pdf.text('Datos del Paciente', margin, yPos);
    yPos += 30;
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    
    // Función para agregar texto con etiqueta
    const addText = (label, value, y) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${label}:`, margin, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value || 'N/A', margin + 80, y);
      return y + 20;
    };
    
    yPos = addText('Nombre Completo', usuario.nombre_completo, yPos);
    yPos = addText('DNI', usuario.dni, yPos);
    if (usuario.edad) yPos = addText('Edad', usuario.edad.toString(), yPos);
    if (usuario.fecha_nacimiento) yPos = addText('Fecha Nacimiento', formatDate(usuario.fecha_nacimiento), yPos);
    if (usuario.area_laboral) yPos = addText('Área Laboral', usuario.area_laboral, yPos);
    if (usuario.telefono) yPos = addText('Teléfono', usuario.telefono, yPos);
    if (usuario.correo) yPos = addText('Correo Electrónico', usuario.correo, yPos);
    if (usuario.direccion) yPos = addText('Dirección', usuario.direccion, yPos);
    
    yPos += 20;
    
    // Historial de vacunas
    pdf.setFontSize(14);
    pdf.setTextColor(44, 62, 80);
    pdf.text('Registro de Vacunas', margin, yPos);
    yPos += 30;
    
    // Configurar tabla
    const headers = ['Vacuna', 'Fecha Aplicación', 'Próxima Dosis', 'Dosis', 'Estado', 'Responsable'];
    const rows = historial.map(reg => [
      reg.nombre_vacuna || 'N/A',
      formatDate(reg.fecha_aplicacion),
      formatDate(reg.proxima_dosis),
      reg.dosis || 'N/A',
      reg.estado || 'N/A',
      reg.responsable || 'No especificado'
    ]);
    
    // Opciones de la tabla
    const options = {
      startY: yPos,
      headStyles: {
        fillColor: [248, 249, 250],
        textColor: [44, 62, 80],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 249, 249]
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' }
      },
      margin: { left: margin / 1.33 } // Convertir pt a px aproximado
    };
    
    // Agregar tabla al PDF
    pdf.autoTable({
      head: [headers],
      body: rows,
      ...options
    });
    
    // Pie de página
    const pageCount = pdf.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      pdf.text(
        `Página ${i} de ${pageCount} | Generado el ${new Date().toLocaleDateString('es-ES')}`, 
        pdf.internal.pageSize.width - margin, 
        pdf.internal.pageSize.height - 20,
        { align: 'right' }
      );
    }
    
    // Guardar PDF
    pdf.save(`historial_vacunacion_${dni}.pdf`);
    
    toast.success("PDF generado correctamente", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const generatePrintContent = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Historial de Vacunación - ${usuario.nombre_completo || ""}</title>
          <style>
            body { font-family: Arial; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2c3e50; padding-bottom: 20px; }
            h1 { color: #2c3e50; margin-bottom: 5px; }
            .subtitle { color: #555; margin-bottom: 20px; }
            .user-info { margin-bottom: 30px; }
            .user-info-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
              gap: 15px; 
              margin-top: 15px;
            }
            .info-item { margin-bottom: 8px; }
            .info-label { font-weight: bold; color: #2c3e50; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: 600; }
            .vacuna-header { background-color: #e9ecef; font-weight: bold; }
            .footer { margin-top: 30px; text-align: right; font-size: 0.9em; color: #666; }
            .badge { 
              display: inline-block;
              padding: 3px 8px;
              border-radius: 4px;
              font-size: 0.85em;
              font-weight: bold;
            }
            .badge-success { background-color: #d4edda; color: #155724; }
            .badge-warning { background-color: #fff3cd; color: #856404; }
            .badge-info { background-color: #d1ecf1; color: #0c5460; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Historial de Vacunación</h1>
            <div class="subtitle">Sistema de Gestión de Vacunación</div>
          </div>
          
          <div class="user-info">
            <h2>Datos del Paciente</h2>
            <div class="user-info-grid">
              <div class="info-item">
                <span class="info-label">Nombre Completo:</span> ${usuario.nombre_completo || "N/A"}
              </div>
              <div class="info-item">
                <span class="info-label">DNI:</span> ${usuario.dni || "N/A"}
              </div>
              ${usuario.edad ? `
                <div class="info-item">
                  <span class="info-label">Edad:</span> ${usuario.edad}
                </div>
              ` : ''}
              ${usuario.fecha_nacimiento ? `
                <div class="info-item">
                  <span class="info-label">Fecha de Nacimiento:</span> ${formatDate(usuario.fecha_nacimiento)}
                </div>
              ` : ''}
              ${usuario.area_laboral ? `
                <div class="info-item">
                  <span class="info-label">Área Laboral:</span> ${usuario.area_laboral}
                </div>
              ` : ''}
              ${usuario.direccion ? `
                <div class="info-item">
                  <span class="info-label">Dirección:</span> ${usuario.direccion}
                </div>
              ` : ''}
              ${usuario.telefono ? `
                <div class="info-item">
                  <span class="info-label">Teléfono:</span> ${usuario.telefono}
                </div>
              ` : ''}
              ${usuario.correo ? `
                <div class="info-item">
                  <span class="info-label">Correo Electrónico:</span> ${usuario.correo}
                </div>
              ` : ''}
            </div>
          </div>
          
          <h2>Registro de Vacunas</h2>
          <table>
            <thead>
              <tr>
                <th>Vacuna</th>
                <th>Fecha Aplicación</th>
                <th>Próxima Dosis</th>
                <th>Dosis</th>
                <th>Estado</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              ${historial.length > 0
                ? historial.map((registro) => {
                    const estadoClass = registro.estado?.toLowerCase() === 'completo' 
                      ? 'badge-success' 
                      : registro.estado?.toLowerCase() === 'pendiente' 
                        ? 'badge-warning' 
                        : 'badge-info';
                    return `
                      <tr>
                        <td>${registro.nombre_vacuna || "N/A"}</td>
                        <td>${formatDate(registro.fecha_aplication)}</td>
                        <td>${formatDate(registro.proxima_dosis)}</td>
                        <td><span class="badge badge-info">${registro.dosis || "N/A"}</span></td>
                        <td><span class="badge ${estadoClass}">${registro.estado || "N/A"}</span></td>
                        <td>${registro.responsable || "No especificado"}</td>
                      </tr>
                    `;
                  }).join("")
                : '<tr><td colspan="6" class="text-center">No hay registros de vacunación</td></tr>'
              }
            </tbody>
          </table>
          <div class="footer">
            Generado el ${new Date().toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} | Sistema de Vacunación
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          </script>
        </body>
      </html>
    `;
  };

  const getEstadoBadge = (estado) => {
    switch(estado?.toLowerCase()) {
      case 'completo':
        return <Badge bg="success" className="d-flex align-items-center gap-1">
          <FaCheckCircle /> Completo
        </Badge>;
      case 'pendiente':
        return <Badge bg="warning" className="d-flex align-items-center gap-1">
          <FaExclamationCircle /> Pendiente
        </Badge>;
      default:
        return <Badge bg="secondary">{estado || "N/A"}</Badge>;
    }
  };

  const vacunasAgrupadas = historial.reduce((acc, registro) => {
    if (!acc[registro.nombre_vacuna]) {
      acc[registro.nombre_vacuna] = [];
    }
    acc[registro.nombre_vacuna].push(registro);
    return acc;
  }, {});

  if (loading)
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <div className="mt-3">Cargando historial...</div>
      </Container>
    );

  if (error)
    return (
      <Container className="my-4">
        <Alert variant="danger" className="d-flex align-items-center gap-2">
          <FaExclamationCircle /> {error}
        </Alert>
      </Container>
    );

  return (
    <Container fluid className="py-3 px-4" ref={pdfRef}>
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          <Row className="mb-4 align-items-center">
            <Col xs={12} md={8}>
              <div className="d-flex align-items-center gap-3">
                <FaSyringe size={28} className="text-primary" />
                <div>
                  <h3 className="mb-0 text-primary">Historial de Vacunación</h3>
                  <small className="text-muted">Documento: {dni}</small>
                </div>
              </div>
            </Col>
            <Col
              xs={12}
              md={4}
              className="d-flex justify-content-md-end gap-2 mt-3 mt-md-0"
            >
              <Button 
                variant="outline-primary" 
                onClick={expandirTodas}
                size="sm"
              >
                <FaChevronDown className="me-1" /> Expandir
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={colapsarTodas}
                size="sm"
              >
                <FaChevronUp className="me-1" /> Colapsar
              </Button>
              
              <Dropdown>
                <Dropdown.Toggle variant="primary" className="d-flex align-items-center">
                  <FaFilePdf className="me-2" /> Exportar
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={printHistorial}>
                    <FaPrint className="me-2" /> Imprimir
                  </Dropdown.Item>
                  <Dropdown.Item onClick={downloadPDF}>
                    <FaFilePdf className="me-2" /> Descargar PDF
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              
              <Button 
                variant="outline-danger" 
                onClick={onClose}
                className="d-flex align-items-center"
              >
                <FaTimes className="me-2" /> Cerrar
              </Button>
            </Col>
          </Row>

          {/* Sección de datos del usuario */}
          {usuario && (
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <h5 className="mb-3 text-primary">
                  <FaUser className="me-2" /> Información del Paciente
                </h5>
                <Row>
                  <Col md={6} lg={4} className="mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <FaIdCard className="text-muted" />
                      <div>
                        <small className="text-muted">DNI</small>
                        <div className="fw-bold">{usuario.dni || "N/A"}</div>
                      </div>
                    </div>
                  </Col>
                  <Col md={6} lg={4} className="mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <FaUser className="text-muted" />
                      <div>
                        <small className="text-muted">Nombre Completo</small>
                        <div className="fw-bold">{usuario.nombre_completo || "N/A"}</div>
                      </div>
                    </div>
                  </Col>
                  {usuario.edad && (
                    <Col md={6} lg={4} className="mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <FaBirthdayCake className="text-muted" />
                        <div>
                          <small className="text-muted">Edad</small>
                          <div className="fw-bold">{usuario.edad}</div>
                        </div>
                      </div>
                    </Col>
                  )}
                  {usuario.fecha_nacimiento && (
                    <Col md={6} lg={4} className="mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <FaCalendarAlt className="text-muted" />
                        <div>
                          <small className="text-muted">Fecha Nacimiento</small>
                          <div className="fw-bold">{formatDate(usuario.fecha_nacimiento)}</div>
                        </div>
                      </div>
                    </Col>
                  )}
                  {usuario.telefono && (
                    <Col md={6} lg={4} className="mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <FaPhone className="text-muted" />
                        <div>
                          <small className="text-muted">Teléfono</small>
                          <div className="fw-bold">{usuario.telefono}</div>
                        </div>
                      </div>
                    </Col>
                  )}
                  {usuario.correo && (
                    <Col md={6} lg={4} className="mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <FaEnvelope className="text-muted" />
                        <div>
                          <small className="text-muted">Correo</small>
                          <div className="fw-bold">{usuario.correo}</div>
                        </div>
                      </div>
                    </Col>
                  )}
                  {usuario.direccion && (
                    <Col md={6} lg={4} className="mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <FaMapMarkerAlt className="text-muted" />
                        <div>
                          <small className="text-muted">Dirección</small>
                          <div className="fw-bold">{usuario.direccion}</div>
                        </div>
                      </div>
                    </Col>
                  )}
                  {usuario.area_laboral && (
                    <Col md={6} lg={4} className="mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <FaBriefcase className="text-muted" />
                        <div>
                          <small className="text-muted">Área Laboral</small>
                          <div className="fw-bold">{usuario.area_laboral}</div>
                        </div>
                      </div>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          )}

          <Row>
            <Col xs={12}>
              <div className="table-responsive">
                <Table bordered hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '25%' }}>Vacuna</th>
                      <th className="text-center">
                        <FaCalendarAlt className="me-2" /> Aplicación
                      </th>
                      <th className="text-center">
                        <FaCalendarCheck className="me-2" /> Próxima
                      </th>
                      <th className="text-center">Dosis</th>
                      <th className="text-center">Estado</th>
                      <th className="text-center">
                        <FaUserNurse className="me-2" /> Responsable
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(vacunasAgrupadas).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <div className="text-muted">
                            No hay registros de vacunación para este usuario.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      Object.keys(vacunasAgrupadas).map((nombreVacuna) => (
                        <React.Fragment key={nombreVacuna}>
                          <tr
                            className="bg-primary bg-opacity-10 cursor-pointer"
                            onClick={() => toggleVacuna(nombreVacuna)}
                          >
                            <td colSpan="6" className="fw-bold">
                              <div className="d-flex justify-content-between align-items-center">
                                <span>{nombreVacuna}</span>
                                {vacunasExpandidas[nombreVacuna] ? (
                                  <FaChevronUp />
                                ) : (
                                  <FaChevronDown />
                                )}
                              </div>
                            </td>
                          </tr>
                          {vacunasExpandidas[nombreVacuna] &&
                            vacunasAgrupadas[nombreVacuna].map(
                              (registro, index) => (
                                <tr key={index}>
                                  <td className="ps-4">
                                    <small className="text-muted">{registro.nombre_vacuna}</small>
                                  </td>
                                  <td className="text-center">
                                    {formatDate(registro.fecha_aplicacion)}
                                  </td>
                                  <td className="text-center">
                                    {formatDate(registro.proxima_dosis)}
                                  </td>
                                  <td className="text-center">
                                    <Badge bg="info">{registro.dosis}</Badge>
                                  </td>
                                  <td className="text-center">
                                    {getEstadoBadge(registro.estado)}
                                  </td>
                                  <td className="text-center">
                                    {registro.responsable || <span className="text-muted">No especificado</span>}
                                  </td>
                                </tr>
                              )
                            )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Modal para imprimir */}
      <Modal
        show={showPrintModal}
        onHide={() => setShowPrintModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaPrint /> Imprimir Historial
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <div className="text-center">
            <FaPrint size={48} className="text-primary mb-3" />
            <h5>¿Desea imprimir el historial de vacunación?</h5>
            <p className="text-muted">Se abrirá una nueva ventana para la impresión</p>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowPrintModal(false)}
            className="d-flex align-items-center gap-2"
          >
            <FaTimes /> Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={printHistorial}
            className="d-flex align-items-center gap-2"
          >
            <FaPrint /> Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HistorialVacunacion;