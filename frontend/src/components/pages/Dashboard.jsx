import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Button } from "react-bootstrap";
import axios from "../../api/axios";
import { FiUser, FiShield, FiCalendar, FiTrendingUp, FiDownload } from "react-icons/fi";
import dayjs from "dayjs";
import Chart from "react-apexcharts";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [datos, setDatos] = useState(null);
  const [vacunasReporte, setVacunasReporte] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fechas de consulta por rango personalizado
  
  const primerDiaAnio = dayjs().startOf("year").format("YYYY-MM-DD");
  const [desde, setDesde] = useState(primerDiaAnio);
  const [hasta, setHasta] = useState(dayjs().format("YYYY-MM-DD"));
  

  // Año para el gráfico mensual (lo calcula a partir de 'desde')
  const anio = dayjs(desde).year();

  // Progreso mensual en el rango
  const [progresoMensual, setProgresoMensual] = useState(null);

  const obtenerDatos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/reportes/dashboard?desde=${desde}&hasta=${hasta}`);
      setDatos(response.data);

      const vacunasResponse = await axios.get(`/api/reportes/vacunas-aplicadas?desde=${desde}&hasta=${hasta}`);
      setVacunasReporte(vacunasResponse.data);
    } catch (error) {
      console.error("❌ Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerProgresoMensual = async () => {
    try {
      const { data } = await axios.get(`/api/reportes/progreso-mensual?desde=${desde}&hasta=${hasta}`);
      setProgresoMensual(data);
    } catch (error) {
      console.error("❌ Error cargando progreso mensual:", error);
    }
  };

  // Al hacer clic en el botón "Consultar Rango"
  const handleConsultar = () => {
    obtenerDatos();
    obtenerProgresoMensual();
  };

  // Al cargar, consulta datos del mes actual
  useEffect(() => {
    obtenerDatos();
    obtenerProgresoMensual();
    // eslint-disable-next-line
  }, []);

  // Meses en español
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  // Cálculo de los meses dentro del rango
  const mesDesde = dayjs(desde).month(); // 0-indexado
  const mesHasta = dayjs(hasta).month();

  // Inicializar arrays de datos con ceros
  const datosVacunaciones = Array(12).fill(0);
  const datosRegistros = Array(12).fill(0);
  const datosVacunasHoy = Array(12).fill(0);

  if (progresoMensual) {
    progresoMensual.vacunas.forEach((v) => {
      datosVacunaciones[v.mes - 1] = v.total;
    });
    progresoMensual.usuarios.forEach((u) => {
      datosRegistros[u.mes - 1] = u.total;
    });
    // Vacunas aplicadas HOY, solo para el mes actual y año seleccionado
    const esAnioActual = anio === new Date().getFullYear();
    const mesActual = new Date().getMonth();
    if (esAnioActual && mesActual >= mesDesde && mesActual <= mesHasta) {
      datosVacunasHoy[mesActual] = progresoMensual.vacunasHoy;
    }
  }

  // Filtrar arrays para solo mostrar meses seleccionados
  const chartDataVacunaciones = datosVacunaciones.slice(mesDesde, mesHasta + 1);
  const chartDataRegistros = datosRegistros.slice(mesDesde, mesHasta + 1);
  const chartDataVacunasHoy = datosVacunasHoy.slice(mesDesde, mesHasta + 1);
  const chartMeses = meses.slice(mesDesde, mesHasta + 1);

  // Configuración gráfica de progreso mensual
  const chartOptions = {
    chart: { type: "area", toolbar: { show: false } },
    colors: ["#4e73df", "#1cc88a", "#36b9cc"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" },
    xaxis: { categories: chartMeses },
    tooltip: { theme: "dark" },
  };

  const chartSeries = [
    { name: "Vacunaciones", data: chartDataVacunaciones },
    { name: "Registros", data: chartDataRegistros },
    { name: "Vacunas Hoy", data: chartDataVacunasHoy },
  ];

  // Preparar datos para gráfico circular
  const conteoVacunas = {};
  vacunasReporte.forEach((v) => {
    conteoVacunas[v.vacuna] = (conteoVacunas[v.vacuna] || 0) + 1;
  });

  const pieOptions = {
    labels: Object.keys(conteoVacunas),
    colors: ["#0d6efd", "#198754", "#ffc107", "#dc3545", "#6610f2", "#fd7e14"],
    legend: { position: "bottom" },
    tooltip: { y: { formatter: (val) => `${val} dosis` } },
  };

  const pieSeries = Object.values(conteoVacunas);

  // Variantes de animación para las tarjetas (hover)
  const cardVariants = {
    rest: { scale: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
    hover: {
      scale: 1.06,
      boxShadow: "0 6px 32px 2px rgba(0,0,0,0.10)",
      transition: { duration: 0.22, type: "spring", stiffness: 260, damping: 22 }
    }
  };

  if (loading || !datos) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Dashboard General</h2>
        <div className="d-flex align-items-center gap-3 flex-wrap mb-3">
          <div>
            <label className="me-2 fw-semibold text-secondary">Desde:</label>
            <input
              type="date"
              value={desde}
              max={hasta}
              onChange={e => setDesde(e.target.value)}
              className="form-control d-inline-block"
              style={{ width: 160 }}
            />
          </div>
          <div>
            <label className="me-2 fw-semibold text-secondary">Hasta:</label>
            <input
              type="date"
              value={hasta}
              min={desde}
              max={dayjs().format("YYYY-MM-DD")}
              onChange={e => setHasta(e.target.value)}
              className="form-control d-inline-block"
              style={{ width: 160 }}
            />
          </div>
          <Button
            variant="primary"
            className="ms-2"
            onClick={handleConsultar}
          >
            <FiDownload className="me-2" /> Consultar Rango
          </Button>
        </div>
      </div>

      <Row className="mb-4 g-3">
        <Col md={3}>
          <motion.div
            initial="rest"
            whileHover="hover"
            animate="rest"
            variants={cardVariants}
          >
            <Card className="shadow-sm h-100" style={{ cursor: "pointer" }}>
              <Card.Body className="text-center">
                <FiUser size={28} className="text-primary mb-2" />
                <h6 className="text-muted">Total de Usuarios</h6>
                <h4 className="fw-bold">{datos.usuarios}</h4>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col md={3}>
          <motion.div initial="rest" whileHover="hover" animate="rest" variants={cardVariants}>
            <Card className="shadow-sm h-100" style={{ cursor: "pointer" }}>
              <Card.Body className="text-center">
                <FiShield size={28} className="text-success mb-2" />
                <h6 className="text-muted">Total de Vacunas</h6>
                <h4 className="fw-bold">{datos.vacunas}</h4>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col md={3}>
          <motion.div initial="rest" whileHover="hover" animate="rest" variants={cardVariants}>
            <Card className="shadow-sm h-100" style={{ cursor: "pointer" }}>
              <Card.Body className="text-center">
                <FiCalendar size={28} className="text-info mb-2" />
                <h6 className="text-muted">Vacunas de Hoy</h6>
                <h4 className="fw-bold">{datos.vacunas_hoy}</h4>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col md={3}>
          <motion.div initial="rest" whileHover="hover" animate="rest" variants={cardVariants}>
            <Card className="shadow-sm h-100" style={{ cursor: "pointer" }}>
              <Card.Body className="text-center">
                <FiTrendingUp size={28} className="text-warning mb-2" />
                <h6 className="text-muted">Crecimiento</h6>
                <h4 className="fw-bold">{datos.crecimiento}%</h4>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Row className="mb-4 g-3">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h6 className="m-0 text-primary">
                Progreso Mensual ({anio})
              </h6>
            </Card.Header>
            <Card.Body>
              <Chart options={chartOptions} series={chartSeries} type="area" height={320} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h6 className="m-0 text-primary">Distribución de Vacunas Aplicadas</h6>
            </Card.Header>
            <Card.Body className="d-flex justify-content-center align-items-center">
              {pieSeries.length > 0 ? (
                <Chart options={pieOptions} series={pieSeries} type="donut" width="100%" height="320" />
              ) : (
                <div className="text-center text-muted">No hay datos suficientes para graficar.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0 text-primary">Detalle de Vacunas Aplicadas</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: 280, overflowY: "auto" }}>
              {vacunasReporte.length === 0 ? (
                <div className="text-center text-muted">
                  No hay vacunas aplicadas en el rango seleccionado.
                </div>
              ) : (
                <table className="table table-hover table-sm align-middle mb-0">
                  <thead>
                    <tr style={{
                      position: 'sticky',
                      top: -20,
                      backgroundColor: '#f8f9fa',
                      zIndex: 10,
                      borderBottom: '2px solid #dee2e6'
                    }}>
                      <th>Usuario</th>
                      <th>Vacuna</th>
                      <th>Fecha</th>
                      <th>Dosis</th>
                      <th>Lote</th>
                      <th>Responsable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vacunasReporte.map((v, idx) => (
                      <tr key={idx}>
                        <td>{v.nombre_completo}</td>
                        <td>{v.vacuna}</td>
                        <td>{dayjs(v.fecha_aplicacion).format("DD/MM/YYYY")}</td>
                        <td>{v.dosis}</td>
                        <td>{v.lote || "-"}</td>
                        <td>{v.responsable || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
