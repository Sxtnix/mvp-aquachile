import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import logo from "../assets/logo-aquachile.png";
import { PERFILES } from "../data/catalogos.js";
import { useApp } from "../context/AppContext.jsx";

const enlaces = [
  { ruta: "/", etiqueta: "Dashboard", icono: "bi-speedometer2" },
  { ruta: "/candidatos", etiqueta: "Candidatos", icono: "bi-people" },
  { ruta: "/solicitudes", etiqueta: "Solicitudes", icono: "bi-clipboard2-check" },
  { ruta: "/ofertas", etiqueta: "Ofertas", icono: "bi-megaphone" },
  { ruta: "/postulaciones", etiqueta: "Postulaciones", icono: "bi-folder2-open" },
];

export default function Layout() {
  const {
    perfil,
    perfilActivo,
    dispatch,
    usaApi,
    usuario,
    logout,
  } = useApp();
  const [abierto, setAbierto] = useState(false);

  const cambiarPerfil = (clave) => {
    dispatch({ type: "cambiar-perfil", perfil: clave });
    setAbierto(false);
  };

  const cerrarSesion = async () => {
    setAbierto(false);
    await logout();
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-vc navbar-dark sticky-top">
        <div className="container">
          <Link
            className="navbar-brand"
            to="/"
            aria-label="AquaChile, ir al dashboard"
          >
            <img src={logo} alt="" className="marca-logo" aria-hidden="true" />
            <span className="marca-texto">
              <span className="fw-semibold">AquaChile</span>
              <small>Evaluación Psicolaboral</small>
            </span>
          </Link>

          <button
            className="navbar-toggler navbar-toggler-logo"
            type="button"
            aria-controls="navPrincipal"
            aria-expanded={abierto}
            aria-label="Abrir menú"
            onClick={() => setAbierto((valor) => !valor)}
          >
            <img
              src={logo}
              alt=""
              className="navbar-toggler-marca"
              aria-hidden="true"
            />
            <span className="navbar-toggler-icon" />
          </button>

          <div
            className={`navbar-collapse collapse ${abierto ? "show" : ""}`}
            id="navPrincipal"
          >
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {enlaces.map((enlace) => (
                <li className="nav-item" key={enlace.ruta}>
                  <NavLink
                    to={enlace.ruta}
                    end={enlace.ruta === "/"}
                    onClick={() => setAbierto(false)}
                    className={({ isActive }) =>
                      `nav-link${isActive ? " active" : ""}`
                    }
                  >
                    <i className={`bi ${enlace.icono}`} aria-hidden="true" />
                    {enlace.etiqueta}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="d-flex flex-column align-items-lg-end gap-2 pb-3 pb-lg-0">
              <span className="navbar-text small text-white-50 d-none d-lg-inline">
                <i className="bi bi-person-badge me-1" aria-hidden="true" />
                {perfil.nombre} · {perfil.rol}
              </span>

              {usaApi && usuario ? (
                <div className="d-flex align-items-center gap-2 sesion-usuario">
                  <span className="badge-vc sesion-rol">
                    <i className="bi bi-shield-check" aria-hidden="true" />
                    {usuario.rol}
                  </span>
                  <span className="small text-white-50 d-none d-sm-inline">
                    {usuario.email}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-light"
                    onClick={cerrarSesion}
                  >
                    <i className="bi bi-box-arrow-right me-1" aria-hidden="true" />
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <div
                  className="btn-group btn-group-sm perfil-selector"
                  role="group"
                  aria-label="Seleccionar perfil"
                >
                  {Object.entries(PERFILES).map(([clave, dato]) => (
                    <button
                      key={clave}
                      type="button"
                      className={`btn ${
                        perfilActivo === clave
                          ? "btn-light"
                          : "btn-outline-light"
                      }`}
                      aria-pressed={perfilActivo === clave}
                      onClick={() => cambiarPerfil(clave)}
                    >
                      {dato.etiqueta}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container contenido-principal pt-4">
        <Outlet />
      </main>

      <footer className="pie-vc py-3 mt-auto">
        <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 small text-secondary">
          <span>
            <i className="bi bi-mortarboard me-1" aria-hidden="true" />
            Proyecto académico Full Stack II · AquaChile
          </span>
          <div className="d-flex flex-wrap align-items-center gap-3">
            <Link to="/postular" className="link-secondary text-decoration-none">
              <i className="bi bi-box-arrow-up-right me-1" aria-hidden="true" />
              Portal de postulaciones
            </Link>
            <span>
              <i className="bi bi-shield-check me-1" aria-hidden="true" />
              {usaApi
                ? "Datos persistidos en el backend local"
                : "Datos ficticios y anonimizados"}
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
