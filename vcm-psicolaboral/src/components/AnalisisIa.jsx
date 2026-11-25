import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";

const iconoEstado = {
  cumple: { clase: "bi-check-circle-fill text-success", texto: "Cumple" },
  parcial: { clase: "bi-exclamation-circle-fill text-warning", texto: "Parcial" },
  no: { clase: "bi-x-circle-fill text-danger", texto: "Sin evidencia" },
};

export default function AnalisisIa({ solicitud }) {
  const {
    analizarIa,
    revisarIa,
    iaEstado,
    usaApi,
    puede,
    perfil,
    notificacion,
    limpiarNotificacion,
  } = useApp();
  const [cargando, setCargando] = useState(false);
  const [revisando, setRevisando] = useState(false);
  const [error, setError] = useState("");
  const analisis = solicitud?.analisis;

  const puedeAnalizar =
    usaApi &&
    Boolean(solicitud.postulacion?.archivo) &&
    (puede("editarEvaluacion") || puede("crearCandidato"));

  const generar = async () => {
    setError("");
    setCargando(true);
    try {
      await analizarIa(solicitud.id);
    } catch (fallo) {
      setError(fallo.message || "No fue posible generar el análisis.");
    } finally {
      setCargando(false);
    }
  };

  const revisar = async () => {
    setError("");
    setRevisando(true);
    try {
      await revisarIa(solicitud.id);
    } catch (fallo) {
      setError(fallo.message || "No fue posible registrar la revisión.");
    } finally {
      setRevisando(false);
    }
  };

  return (
    <section className="card tarjeta-vc mb-3 analisis-ia">
      <div className="card-body">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-3">
          <div>
            <h2 className="seccion-titulo mb-1">
              <i className="bi bi-stars" aria-hidden="true" />
              Apoyo de IA sobre el currículum
            </h2>
            <p className="small text-secondary mb-0">
              Proveedor Groq · Modelo {iaEstado?.modelo || "no informado"}.
              Este análisis es orientativo y no decide la contratación.
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {puedeAnalizar ? (
              <button
                type="button"
                className="btn btn-sm btn-marca"
                onClick={generar}
                disabled={cargando || !iaEstado?.configurada}
                title={
                  iaEstado?.configurada
                    ? "Analiza el CV con Groq"
                    : "Configura GROQ_API_KEY en el backend"
                }
              >
                <i className="bi bi-magic me-1" aria-hidden="true" />
                {cargando
                  ? "Analizando…"
                  : analisis
                    ? "Volver a analizar"
                    : "Analizar CV con IA"}
              </button>
            ) : null}
            {analisis && analisis.pendienteRevision ? (
              <button
                type="button"
                className="btn btn-sm btn-outline-marca"
                onClick={revisar}
                disabled={revisando}
              >
                <i className="bi bi-person-check me-1" aria-hidden="true" />
                {revisando ? "Registrando…" : "Marcar revisión humana"}
              </button>
            ) : null}
          </div>
        </div>

        {!iaEstado?.configurada ? (
          <div className="alert alert-warning small mt-3 mb-0">
            <i className="bi bi-key me-1" aria-hidden="true" />
            La IA no está configurada. Agrega <code>GROQ_API_KEY</code> en
            <code> backend/.env</code> y reinicia el backend para habilitarla.
          </div>
        ) : null}

        {notificacion ? (
          <div className="alert alert-success small mt-3 d-flex justify-content-between align-items-center gap-2">
            <span>
              <i className="bi bi-check2-circle me-1" aria-hidden="true" />
              {notificacion}
            </span>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar aviso"
              onClick={limpiarNotificacion}
            />
          </div>
        ) : null}

        {error ? (
          <div className="alert alert-danger small mt-3 mb-0" role="alert">
            <i className="bi bi-exclamation-circle me-1" aria-hidden="true" />
            {error}
          </div>
        ) : null}

        {!analisis ? (
          <div className="estado-vacio mt-3">
            <i className="bi bi-file-earmark-bar-graph" aria-hidden="true" />
            <div>
              <p className="fw-semibold mb-1">Sin análisis de IA todavía</p>
              <p className="small text-secondary mb-0">
                {solicitud.postulacion?.archivo
                  ? "Puedes analizar el currículum cuando quieras. El resultado quedará pendiente de revisión humana."
                  : "Esta solicitud no tiene un currículum adjunto para analizar."}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3 mb-3">
              <div
                className="puntaje-ia"
                style={{ "--puntaje": `${analisis.puntaje || 0}%` }}
                aria-label={`Puntaje orientativo ${analisis.puntaje} de 100`}
              >
                <span>{analisis.puntaje}</span>
                <small>/100</small>
              </div>
              <div>
                <p className="fw-semibold mb-1">{analisis.resumen}</p>
                <span
                  className={`badge-vc ${
                    analisis.pendienteRevision
                      ? "estado-pendiente"
                      : "estado-finalizada"
                  }`}
                >
                  <i
                    className={`bi ${
                      analisis.pendienteRevision
                        ? "bi-hourglass-split"
                        : "bi-person-check"
                    }`}
                    aria-hidden="true"
                  />
                  {analisis.pendienteRevision
                    ? "Pendiente de revisión humana"
                    : `Revisado por ${analisis.revisadoPor || perfil.nombre}`}
                </span>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-lg-6">
                <h3 className="h6 text-uppercase text-secondary">
                  Cumplimiento de requisitos
                </h3>
                <ul className="lista-requisitos mb-0">
                  {(analisis.requisitos || []).map((requisito) => {
                    const icono =
                      iconoEstado[requisito.estado] || iconoEstado.no;
                    return (
                      <li key={requisito.requisito}>
                        <i className={`bi ${icono.clase}`} aria-hidden="true" />
                        <span>
                          <strong>{requisito.requisito}</strong>
                          <small className="d-block text-secondary">
                            {icono.texto} · {requisito.detalle}
                          </small>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="col-12 col-lg-6">
                <h3 className="h6 text-uppercase text-secondary">
                  Preguntas sugeridas
                </h3>
                <ol className="lista-preguntas mb-0">
                  {(analisis.preguntas || []).map((item) => (
                    <li key={item.pregunta}>
                      <span>{item.pregunta}</span>
                      <small className="d-block text-secondary">
                        Objetivo: {item.objetivo}
                      </small>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-12 col-md-6">
                <h3 className="h6 text-uppercase text-secondary">Formación</h3>
                <p className="small mb-0">{analisis.formacion || "Sin dato"}</p>
              </div>
              <div className="col-12 col-md-6">
                <h3 className="h6 text-uppercase text-secondary">Experiencia</h3>
                <p className="small mb-0">
                  {analisis.experiencia || "Sin dato"}
                </p>
              </div>
            </div>

            {analisis.faltantes?.length ? (
              <div className="alert alert-secondary small mt-3 mb-0">
                <strong>
                  <i className="bi bi-question-circle me-1" aria-hidden="true" />
                  Datos faltantes:
                </strong>{" "}
                {analisis.faltantes.join(" · ")}
              </div>
            ) : null}

            {analisis.limitaciones ? (
              <p className="small text-secondary mt-3 mb-0">
                <i className="bi bi-info-circle me-1" aria-hidden="true" />
                Limitaciones: {analisis.limitaciones}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
