import { useAuth } from "../../context/AuthContext"; // Corregida la ruta (¡ojo: no es AuthContextt!)
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute - Protege rutas según los roles permitidos.
 *
 * @param {Object} props
 * @param {Array} props.rolesPermitidos - Array de roles permitidos ["Administrador", "Médico"]
 * @param {JSX.Element} props.children - Elemento a renderizar si tiene permiso
 *
 * Uso:
 * <ProtectedRoute rolesPermitidos={["Administrador"]}>
 *   <PanelAdmin />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ rolesPermitidos = [], children }) => {
  const { usuario } = useAuth();

  // Si no hay usuario logueado, redirige a login
  if (!usuario) {
    return <Navigate to="/inicio" replace />;
  }

  // Si el usuario no tiene ninguno de los roles permitidos
  if (
    rolesPermitidos.length > 0 &&
    (!usuario.roles ||
      !usuario.roles.some((rol) => rolesPermitidos.includes(rol)))
  ) {
    return <Navigate to="/inicio" replace />;
    // O muestra un mensaje bonito si prefieres:
    // return <div className="alert alert-warning m-5">No tienes permisos para acceder a esta sección.</div>;
  }

  // Acceso permitido
  return children;
};

export default ProtectedRoute;
