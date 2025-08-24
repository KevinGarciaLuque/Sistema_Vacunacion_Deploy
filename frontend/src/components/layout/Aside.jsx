import React, { useState } from "react";
import "../styles/Aside.css";

export const Aside = () => {
  const [dni, setDni] = useState("");
  const [user, setUser] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false); // Estado para controlar la expansión

  // Simulación de búsqueda (aquí puedes hacer una petición a tu backend)
  const buscarUsuario = () => {
    // Aquí deberías hacer la consulta a la base de datos
    const usuariosMock = [
      { dni: "12345678", nombre: "Juan Pérez" },
      { dni: "87654321", nombre: "María González" },
    ];

    const encontrado = usuariosMock.find((u) => u.dni === dni);
    setUser(encontrado ? encontrado : { nombre: "Usuario no encontrado" });
  };

  return (
    <aside className={`aside-container ${isExpanded ? "expanded" : ""}`}>
      {/* Botón de la lupa para expandir/contraer */}
      <button className="search-icon" onClick={() => setIsExpanded(!isExpanded)}>
        🔍
      </button>

      {/* Contenido expandido */}
      {isExpanded && (
        <>
          {/* Botón de cerrar (X) 
          <button className="close-button" onClick={() => setIsExpanded(false)}>
            ×
          </button>
          */}

          {/* Buscador de Usuario por DNI */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar usuario por DNI..."
              value={dni}
              onChange={(e) => setDni(e.target.value)}
            />
            <button onClick={buscarUsuario}>Buscar</button>
          </div>

          {/* Mostrar resultado de la búsqueda */}
          {user && (
            <div className="user-result">
              <p>
                <strong>Resultado:</strong> {user.nombre}
              </p>
            </div>
          )}
        </>
      )}
    </aside>
  );
};