import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import logo from "../assets/logo-aquachile.png";

export default function LoginPage() {
  const { login, autenticado, cargandoSesion, usaApi } = useApp();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!usaApi) {
    return <Navigate to="/" replace />;
  }

  if (usaApi && autenticado) {
    return <Navigate to="/" replace />;
  }

  const enviar = async (evento) => {
    evento.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await login(email.trim(), password);
      navegar(ubicacion.state?.desde || "/", { replace: true });
    } catch (fallo) {
      setError(fallo.message || "No fue posible iniciar sesión.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login-fondo">
      <div className="container py-5">
        <div className="row justify-content-center align-items-stretch g-4">
          <div className="col-12 col-lg-5">
            <section className="login-marca h-100">
              <img
                src={logo}
                alt="AquaChile"
                className="login-logo mb-4"
              />
              <h1 className="h3 text-white mb-2">
                Reclutamiento y Evaluación Psicolaboral
              </h1>
              <p className="text-white-50 mb-4">
                Plataforma interna para gestionar candidatos, ofertas,
                postulaciones y evaluaciones con apoyo de IA y revisión humana.
              </p>
              <ul className="login-beneficios">
                <li>
                  <i className="bi bi-shield-lock" aria-hidden="true" />
                  Sesión segura con JWT y roles
                </li>
                <li>
                  <i className="bi bi-folder2-open" aria-hidden="true" />
                  Currículums privados y trazables
                </li>
                <li>
                  <i className="bi bi-stars" aria-hidden="true" />
                  Análisis de IA como apoyo, nunca como decisión
                </li>
              </ul>
              <a href="/postular" className="btn btn-outline-light mt-4">
                <i className="bi bi-box-arrow-up-right me-1" aria-hidden="true" />
                Ir al portal de postulaciones
              </a>
            </section>
          </div>

          <div className="col-12 col-lg-5">
            <section className="card tarjeta-vc h-100">
              <div className="card-body p-4 p-lg-5">
                <span className="eyebrow">
                  <i className="bi bi-person-lock" aria-hidden="true" />
                  Acceso equipo interno
                </span>
                <h2 className="h4 mb-1">Inicia sesión</h2>
                <p className="text-secondary small mb-4">
                  Usa tu cuenta institucional de AquaChile.
                </p>

                <form onSubmit={enviar} noValidate>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="login-email">
                      Correo electrónico
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(evento) => setEmail(evento.target.value)}
                      autoComplete="username"
                      placeholder="analista@aquachile.cl"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="login-password">
                      Contraseña
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(evento) => setPassword(evento.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {error ? (
                    <div className="alert alert-danger small py-2" role="alert">
                      <i className="bi bi-exclamation-circle me-1" aria-hidden="true" />
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    className="btn btn-marca w-100"
                    disabled={enviando || cargandoSesion}
                  >
                    {enviando ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                        Ingresando…
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-1" aria-hidden="true" />
                        Ingresar
                      </>
                    )}
                  </button>
                </form>

                <div className="alert alert-info small mt-4 mb-0">
                  <p className="fw-semibold mb-1">
                    <i className="bi bi-info-circle me-1" aria-hidden="true" />
                    Cuentas demo
                  </p>
                  <p className="mb-1">
                    <strong>Analista:</strong> analista@aquachile.cl
                  </p>
                  <p className="mb-1">
                    <strong>Evaluador:</strong> evaluador@aquachile.cl
                  </p>
                  <p className="mb-1">
                    <strong>Jefatura:</strong> jefatura@aquachile.cl
                  </p>
                  <p className="mb-0">
                    Contraseña: <code>AquaChile2026!</code>
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
