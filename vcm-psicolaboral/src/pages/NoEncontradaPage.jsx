import { Link } from "react-router-dom";

export default function NoEncontradaPage() {
  return (
    <div className="text-center py-5">
      <div className="d-flex justify-content-center mb-3">
        <span className="avatar-iniciales" aria-hidden="true">
          <i className="bi bi-compass" />
        </span>
      </div>
      <p className="display-1 fw-bold texto-marca mb-0">404</p>
      <h1 className="h3 mb-2">Página no encontrada</h1>
      <p className="text-secondary mb-4">
        La ruta que intentas visitar no existe en la aplicación.
      </p>
      <Link to="/" className="btn btn-marca">
        <i className="bi bi-house-door me-1" aria-hidden="true" />
        Volver al dashboard
      </Link>
    </div>
  );
}
