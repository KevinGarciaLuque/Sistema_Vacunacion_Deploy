import { useAuth } from "../../context/AuthContext";

const DebugUsuario = () => {
  const { usuario, token } = useAuth();
  console.log("Usuario desde contexto:", usuario);
  console.log("Token:", token);

  return (
    <div className="p-3">
      <h5>Debug Usuario:</h5>
      <pre>{JSON.stringify(usuario, null, 2)}</pre>
      <h5>Token:</h5>
      <pre>{token}</pre>
    </div>
  );
};

export default DebugUsuario;
