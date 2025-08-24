import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { RouterPrincipal } from "./routes/RouterPrincipal";
import { AuthProvider } from "./context/AuthContext";
import TestApi from "./components/TestApi"; // 👈 Importamos el componente de prueba

function App() {
  return (
    <AuthProvider>
      {/* 🚀 Componente de prueba de conexión */}
      <TestApi /> 

      {/* Rutas principales de tu sistema */}
      <RouterPrincipal />
    </AuthProvider>
  );
}

export default App;
