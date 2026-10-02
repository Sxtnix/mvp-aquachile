import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { PERFILES } from "../data/datosFicticios.js";
import { useApp } from "../context/AppContext.jsx";

const enlaces = [
  { ruta: "/", etiqueta: "Dashboard" },
  { ruta: "/candidatos", etiqueta: "Candidatos" },
  { ruta: "/solicitudes", etiqueta: "Solicitudes" },
];

export default function Layout() {
  const { perfil, perfilActivo, setPerfilActivo } = useApp();
  const [abierto, setAbierto] = useState(false);

  const cambiarPerfil = (clave) => {
    setPerfilActivo(clave);
    setAbierto(false);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg fondo-marca navbar-dark sticky-top">
        <div className="container">
          <Link className="navbar-brand fw-semibold" to="/">
            Evaluación Psicolaboral
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            aria-controls="navPrincipal"
            aria-expanded={abierto}
            aria-label="Abrir menú"
            onClick={() => setAbierto((valor) => !valor)}
          >
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
                    {enlace.etiqueta}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-2 pb-3 pb-lg-0">
              <span className="navbar-text small text-white-50 d-none d-lg-inline">
                {perfil.nombre} · {perfil.rol}
              </span>

              <div
                className="btn-group btn-group-sm"
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
                    onClick={() => cambiarPerfil(clave)}
                  >
                    {clave === "analista" ? "Analista" : "Evaluador"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="container contenido-principal pt-4">
        <Outlet />
      </main>

      <footer className="border-top bg-white py-3">
        <div className="container small text-secondary">
          Datos ficticios · Proyecto académico Full Stack II · AquaChile
        </div>
      </footer>
    </>
  );
}
