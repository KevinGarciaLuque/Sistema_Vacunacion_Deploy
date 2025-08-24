import React, { useState, useEffect } from "react";
import { Alert } from "react-bootstrap";
import { FiClock } from "react-icons/fi";
import { useDebounce } from "use-debounce";
import { toast } from "react-toastify";
import { fetchBitacora } from "../../../api/bitacora";
import FiltrosBitacora from "./FiltrosBitacora";
import TablaBitacora from "./TablaBitacora";

const Bitacora = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState({
    fechaDesde: "",
    fechaHasta: "",
    usuario: "",
    accion: "",
  });
  const [debouncedUsuario] = useDebounce(filtros.usuario, 500);
  const [debouncedAccion] = useDebounce(filtros.accion, 500);

  useEffect(() => {
    cargarRegistros();
  }, [debouncedUsuario, debouncedAccion, filtros.fechaDesde, filtros.fechaHasta]);

  const cargarRegistros = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        usuario: debouncedUsuario,
        accion: debouncedAccion,
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta,
      };
      const data = await fetchBitacora(params);
      setRegistros(data.registros || []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Error al cargar los registros de bitácora";
      setError(errorMessage);
      setRegistros([]);
      toast.error(errorMessage, { position: "top-right", autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: "",
      fechaHasta: "",
      usuario: "",
      accion: "",
    });
  };

  const formatearFecha = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleString();
    } catch {
      return "Fecha inválida";
    }
  };

  return (
    <div className="bitacora-container">
      <h2 className="mb-4">
        <FiClock className="me-2" />
        Bitácora de Actividades
      </h2>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <FiltrosBitacora
        filtros={filtros}
        handleFiltroChange={handleFiltroChange}
        aplicarFiltros={aplicarFiltros}
        limpiarFiltros={limpiarFiltros}
        loading={loading}
      />

      <TablaBitacora
        registros={registros}
        loading={loading}
        formatearFecha={formatearFecha}
        error={error}
      />
    </div>
  );
};

export default Bitacora;
