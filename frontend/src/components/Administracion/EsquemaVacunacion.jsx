import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Form, Row, Col, Button, Card, Spinner } from "react-bootstrap";
import { getVacunas } from "../../api/vacunas";
import { addEsquemaVacunacion } from "../../api/esquemas";

const EsquemaVacunacion = ({ onEsquemaCreado }) => {
  const [formData, setFormData] = useState({
    vacuna_id: "",
    dosis: [{ tipo_dosis: "Primera", edad_recomendada: "", grupo_riesgo: "" }],
  });
  const [loading, setLoading] = useState(false);
  const [vacunas, setVacunas] = useState([]);

  useEffect(() => {
    const fetchVacunas = async () => {
      try {
        const data = await getVacunas();
        setVacunas(data);
      } catch (error) {
        toast.error("Error al cargar vacunas disponibles");
      }
    };
    fetchVacunas();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDosisChange = (index, field, value) => {
    const updatedDosis = [...formData.dosis];
    updatedDosis[index][field] = value;
    setFormData({ ...formData, dosis: updatedDosis });
  };

  const addDosis = () => {
    setFormData({
      ...formData,
      dosis: [
        ...formData.dosis,
        { tipo_dosis: "Segunda", edad_recomendada: "", grupo_riesgo: "" },
      ],
    });
  };

  const removeDosis = (index) => {
    if (formData.dosis.length <= 1) return;
    const updatedDosis = formData.dosis.filter((_, i) => i !== index);
    setFormData({ ...formData, dosis: updatedDosis });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (
        !formData.vacuna_id ||
        formData.dosis.some((d) => !d.edad_recomendada || !d.tipo_dosis)
      ) {
        throw new Error("Complete todos los campos obligatorios");
      }

      const promises = formData.dosis.map((dosis) =>
        addEsquemaVacunacion({
          vacuna_id: formData.vacuna_id,
          edad_recomendada: dosis.edad_recomendada,
          grupo_riesgo: dosis.grupo_riesgo || null,
          tipo_dosis: dosis.tipo_dosis,
        })
      );

      const responses = await Promise.all(promises);
      const vacunaSeleccionada = vacunas.find(
        (v) => v.id == formData.vacuna_id
      );

      const esquemaCompleto = {
        id: responses[0].id,
        nombre: vacunaSeleccionada.nombre,
        fabricante: vacunaSeleccionada.fabricante,
        dosis_requeridas: formData.dosis.length,
        esquema: formData.dosis.map((d) => d.edad_recomendada).join(" - "),
        dosis: formData.dosis,
      };

      onEsquemaCreado(esquemaCompleto);
      toast.success("Esquema creado correctamente");

      setFormData({
        vacuna_id: "",
        dosis: [
          { tipo_dosis: "Primera", edad_recomendada: "", grupo_riesgo: "" },
        ],
      });
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg p-4 mb-4">
      <h2 className="mb-4">Crear Nuevo Esquema de Vacunación</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={2}>
            Vacuna*
          </Form.Label>
          <Col sm={10}>
            <Form.Select
              name="vacuna_id"
              value={formData.vacuna_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione una vacuna</option>
              {vacunas.map((vacuna) => (
                <option key={vacuna.id} value={vacuna.id}>
                  {vacuna.nombre} ({vacuna.fabricante})
                </option>
              ))}
            </Form.Select>
          </Col>
        </Form.Group>

        <h5 className="mt-4">Configurar Dosis</h5>
        {formData.dosis.map((dosis, index) => (
          <Row key={index} className="g-2 align-items-end mb-2">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Tipo de Dosis*</Form.Label>
                <Form.Select
                  value={dosis.tipo_dosis}
                  onChange={(e) =>
                    handleDosisChange(index, "tipo_dosis", e.target.value)
                  }
                  required
                >
                  <option value="Primera">Primera</option>
                  <option value="Segunda">Segunda</option>
                  <option value="Tercera">Tercera</option>
                  <option value="Refuerzo">Refuerzo</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Edad Recomendada*</Form.Label>
                <Form.Control
                  type="text"
                  value={dosis.edad_recomendada}
                  onChange={(e) =>
                    handleDosisChange(index, "edad_recomendada", e.target.value)
                  }
                  placeholder="Ej: 2 meses"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Grupo de Riesgo</Form.Label>
                <Form.Control
                  type="text"
                  value={dosis.grupo_riesgo}
                  onChange={(e) =>
                    handleDosisChange(index, "grupo_riesgo", e.target.value)
                  }
                  placeholder="Ej: Embarazadas, adultos mayores"
                />
              </Form.Group>
            </Col>
            <Col md={1}>
              {formData.dosis.length > 1 && (
                <Button
                  variant="outline-danger"
                  type="button"
                  onClick={() => removeDosis(index)}
                  className="mb-3"
                >
                  ×
                </Button>
              )}
            </Col>
          </Row>
        ))}

        <Button
          variant="outline-primary"
          type="button"
          onClick={addDosis}
          className="my-2"
        >
          + Agregar Dosis
        </Button>

        <div className="d-flex justify-content-end mt-4">
          <Button type="submit" variant="success" disabled={loading}>
            {loading ? <Spinner size="sm" className="me-2" /> : null}
            Guardar Esquema
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default EsquemaVacunacion;
