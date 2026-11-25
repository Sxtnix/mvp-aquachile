import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function RutaProtegida({ children }) {
  const { usaApi, autenticado, cargandoSesion } = useApp();
  const ubicacion = useLocation();

  if (!usaApi) return children;

  if (cargandoSesion) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5 text-secondary gap-3">
        <div className="spinner-border text-primary" role="status" aria-label="Cargando sesión" />
        <p className="mb-0">Recuperando tu sesión…</p>
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }

  return children;
}
