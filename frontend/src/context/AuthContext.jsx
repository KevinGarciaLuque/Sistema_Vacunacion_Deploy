import { createContext, useContext, useState } from "react";

// Creamos el contexto
const AuthContext = createContext();

// Proveedor de autenticación global
export function AuthProvider({ children }) {
  // Estado inicial: intenta cargar del localStorage
  const [usuario, setUsuario] = useState(() => {
    try {
      const data = localStorage.getItem("user");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );

  // Login: recibe usuario y token, y los guarda
  const login = (user, token) => {
    setUsuario(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  };

  // Logout: limpia 
  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Valor expuesto en el contexto (¡incluye permisos!)
  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        permisos: usuario?.permisos || [], // <- acceso directo a permisos
        login,
        logout,
        isAuthenticated: !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para consumir el contexto fácilmente
export const useAuth = () => useContext(AuthContext);
