import { Link, Outlet } from "react-router-dom";
import logo from "../assets/logo-aquachile.png";

export default function PortalLayout() {
  return (
    <>
      <nav className="navbar navbar-vc navbar-dark">
        <div className="container">
          <Link
            className="navbar-brand"
            to="/postular"
            aria-label="AquaChile, ir al portal de postulaciones"
          >
            <img src={logo} alt="" className="marca-logo" aria-hidden="true" />
            <span className="marca-texto">
              <span className="fw-semibold">Trabaja en AquaChile</span>
              <small>Portal de postulaciones</small>
            </span>
          </Link>

          <Link to="/login" className="btn btn-sm btn-outline-light d-none d-sm-inline-flex">
            <i className="bi bi-box-arrow-in-right me-1" aria-hidden="true" />
            Acceso equipo
          </Link>
        </div>
      </nav>

      <main className="container contenido-principal pt-4">
        <Outlet />
      </main>

      <footer className="pie-vc py-3 mt-auto">
        <div className="container d-flex flex-column flex-sm-row justify-content-between gap-1 small text-secondary">
          <span>
            <i className="bi bi-water me-1" aria-hidden="true" />
            AquaChile · Portal de postulaciones
          </span>
          <span>
            <i className="bi bi-shield-check me-1" aria-hidden="true" />
            Tus datos se usan solo para este proceso
          </span>
        </div>
      </footer>
    </>
  );
}
