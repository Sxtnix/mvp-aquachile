import { Link } from "react-router-dom";

export default function NoEncontradaPage() {
  return (
    <div className="text-center py-5">
      <p className="display-1 fw-semibold texto-marca">404</p>
      <h1 className="h3 mb-2">Página no encontrada</h1>
      <p className="text-secondary mb-4">
        La ruta que intentas visitar no existe en la aplicación.
      </p>
      <Link to="/" className="btn btn-marca">
        Volver al dashboard
      </Link>
    </div>
  );
}
