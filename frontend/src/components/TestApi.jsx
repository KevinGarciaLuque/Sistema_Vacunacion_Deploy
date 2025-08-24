import React, { useEffect, useState } from "react";
import axios from "axios";

const TestApi = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = import.meta.env.VITE_API_URL + "/usuarios"; // ajusta la ruta según tu backend
    console.log("📡 Probando conexión a:", url);

    axios
      .get(url)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error("❌ Error al conectar con backend:", err);
        setError(err.message);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Prueba conexión con Backend</h2>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
};

export default TestApi;
