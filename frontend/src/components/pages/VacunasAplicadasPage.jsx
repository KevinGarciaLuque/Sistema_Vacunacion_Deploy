import React, { useState } from 'react';
import { Button, Form, Card, Table, Spinner } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import moment from 'moment';
import api from '../../api/axios';

const VacunasAplicadasPage = () => {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDatos = async (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) {
      toast.error('Seleccione el rango de fechas');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/api/reportes/vacunas-aplicadas', {
        params: { desde: fechaInicio, hasta: fechaFin },
      });
      setDatos(data);
      if (data.length === 0) {
        toast.info('No se encontraron registros en este rango de fechas');
      }
    } catch (error) {
      console.error('❌ Error al obtener datos:', error);
      toast.error('Error al obtener datos de vacunas aplicadas');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    fetchDatos(desde, hasta);
  };

  const handleHoy = () => {
    const hoy = moment().format('YYYY-MM-DD');
    setDesde(hoy);
    setHasta(hoy);
    fetchDatos(hoy, hoy);
  };

  const exportExcel = () => {
    if (datos.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(
      datos.map(item => ({
        Usuario: item.nombre_completo,
        Vacuna: item.vacuna,
        'Fecha Aplicación': moment(item.fecha_aplicacion).format('DD/MM/YYYY'),
        Dosis: item.dosis,
        Lote: item.lote || '-', // ✅ aseguramos mostrar el lote
        Responsable: item.responsable || '-',
        'Vía de Administración': item.via_administracion || '-',
        'Sitio de Aplicación': item.sitio_aplicacion || '-',
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'VacunasAplicadas');
    XLSX.writeFile(workbook, `Vacunas_Aplicadas_${desde}_a_${hasta}.xlsx`);
  };

  return (
    <Card className="p-3 shadow">
      <h5>Reporte de Vacunas Aplicadas</h5>
      <Form className="d-flex gap-2 align-items-end mb-3 flex-wrap">
        <Form.Group>
          <Form.Label>Desde</Form.Label>
          <Form.Control type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Hasta</Form.Label>
          <Form.Control type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </Form.Group>
        <Button variant="primary" onClick={handleBuscar}>Buscar</Button>
        <Button variant="info" onClick={handleHoy}>Reportes de Hoy</Button>
        <Button variant="success" onClick={exportExcel}>Exportar Excel</Button>
      </Form>

      {loading ? (
        <div className="text-center my-3">
          <Spinner animation="border" />
        </div>
      ) : (
        <div
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            border: '1px solid #dee2e6',
            borderRadius: '5px',
          }}
        >
          <Table
            striped
            bordered
            hover
            responsive
            className="mb-0"
          >
            <thead style={{
              position: 'sticky',
              top: '0',
              backgroundColor: '#212529',
              color: 'white',
              zIndex: '1'
            }}>
              <tr>
                <th>Usuario</th>
                <th>Vacuna</th>
                <th>Fecha Aplicación</th>
                <th>Dosis</th>
                <th>Lote</th> {/* ✅ Lote en el encabezado */}
                <th>Responsable</th>
                <th>Vía</th>
                <th>Sitio</th>
              </tr>
            </thead>
            <tbody>
              {datos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">No hay datos para mostrar</td>
                </tr>
              ) : (
                datos.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nombre_completo}</td>
                    <td>{item.vacuna}</td>
                    <td>{moment(item.fecha_aplicacion).format('DD/MM/YYYY')}</td>
                    <td>{item.dosis}</td>
                    <td>{item.lote || '-'}</td> {/* ✅ mostrar lote */}
                    <td>{item.responsable || '-'}</td>
                    <td>{item.via_administracion || '-'}</td>
                    <td>{item.sitio_aplicacion || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}
    </Card>
  );
};

export default VacunasAplicadasPage;
