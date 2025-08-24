import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { RouterPrincipal } from "./routes/RouterPrincipal";
import { AuthProvider } from "./context/AuthContext"; // Asegúrate de importar esto


function App() {
  return (
    <AuthProvider>
      <RouterPrincipal />
    </AuthProvider>
  );
}

export default App;
