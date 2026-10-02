import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import BadgeEstado from "../components/BadgeEstado.jsx";
import {
  ESTADOS_SOLICITUD,
  RESULTADOS_EVALUACION,
} from "../data/datosFicticios.js";

export default function SolicitudDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    solicitudes,
    obtenerCandidato,
    evaluacionDe,
    cambiarEstadoSolicitud,
    guardarEvaluacion,
    puede,
    verTodasLasSolicitudes,
    perfil,
  } = useApp();

  const solicitud = solicitudes.find((item) => item.id === Number(id));

  const [datos, setDatos] = useState(() => {
    const existente = solicitud ? evaluacionDe(solicitud.id) : undefined;
    return {
      fechaEvaluacion: existente?.fechaEvaluacion || "",
      observaciones: existente?.observaciones || "",
      resultado: existente?.resultado || "",
    };
  });
  const [guardado, setGuardado] = useState(false);
  const [intento, setIntento] = useState(false);

  if (!solicitud) {
    return (
      <div className="alert alert-warning">
        La solicitud solicitada no existe.
        <div className="mt-2">
          <Link to="/solicitudes" className="btn btn-sm btn-outline-secondary">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  const candidato = obtenerCandidato(solicitud.candidatoId);
  const asignada = solicitud.responsable === perfil.nombre;
  const sinAsignar = !verTodasLasSolicitudes && !asignada;
  const evaluacion = evaluacionDe(solicitud.id);
  const puedeEditar = puede("editarEvaluacion") && !sinAsignar;

  const cambiar = (campo) => (evento) => {
    setGuardado(false);
    setDatos((actual) => ({ ...actual, [campo]: evento.target.value }));
  };

  const enviar = (evento) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    setIntento(true);

    if (!formulario.checkValidity()) return;

    const intencion =
      evento.nativeEvent.submitter?.value === "finalizar"
        ? "finalizar"
        : "guardar";

    guardarEvaluacion(solicitud.id, datos);

    if (intencion === "finalizar") {
      cambiarEstadoSolicitud(solicitud.id, "Finalizada");
    } else if (solicitud.estado === "Pendiente") {
      cambiarEstadoSolicitud(solicitud.id, "En proceso");
    }

    setGuardado(true);
    setIntento(false);
  };

  const cambiarEstado = (estado) => {
    cambiarEstadoSolicitud(solicitud.id, estado);
    setGuardado(false);
  };

  return (
    <>
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/solicitudes">Solicitudes</Link>
          </li>
          <li className="breadcrumb-item active">
            Solicitud #{solicitud.id}
          </li>
        </ol>
      </nav>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
        <div>
          <h1 className="h3 mb-1">{candidato?.nombre}</h1>
          <p className="text-secondary mb-0">
            {solicitud.cargo} · Familia {solicitud.familia}
          </p>
        </div>
        <div>
          <BadgeEstado estado={solicitud.estado} />
        </div>
      </div>

      {sinAsignar ? (
        <div className="alert alert-warning">
          Esta solicitud está asignada a {solicitud.responsable}. No puedes
          editar su evaluación.
        </div>
      ) : null}

      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h6 text-uppercase text-secondary">Solicitud</h2>
              <dl className="row mb-0">
                <dt className="col-sm-5">Fecha solicitud</dt>
                <dd className="col-sm-7">{solicitud.fechaSolicitud}</dd>

                <dt className="col-sm-5">Responsable</dt>
                <dd className="col-sm-7">{solicitud.responsable}</dd>

                <dt className="col-sm-5">Correo</dt>
                <dd className="col-sm-7 text-break">{candidato?.correo}</dd>

                <dt className="col-sm-5">Teléfono</dt>
                <dd className="col-sm-7">{candidato?.telefono}</dd>
              </dl>

              {puede("cambiarEstado") && !sinAsignar ? (
                <div className="mt-3 pt-3 border-top">
                  <p className="small text-secondary mb-2">Cambiar estado</p>
                  <div className="d-flex flex-wrap gap-2">
                    {ESTADOS_SOLICITUD.map((estado) => (
                      <button
                        key={estado}
                        type="button"
                        className={`btn btn-sm ${
                          solicitud.estado === estado
                            ? "btn-marca"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => cambiarEstado(estado)}
                      >
                        {estado}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
                <h2 className="h6 text-uppercase text-secondary mb-0">
                  Evaluación psicolaboral
                </h2>
                <div>
                  {evaluacion ? (
                    <span className="badge text-bg-success">Registrada</span>
                  ) : (
                    <span className="badge text-bg-secondary">
                      Sin registrar
                    </span>
                  )}
                </div>
              </div>

              {guardado ? (
                <div className="alert alert-success py-2">
                  Evaluación guardada correctamente.
                </div>
              ) : null}

              <form
                className={`row g-3 ${intento ? "was-validated" : ""}`}
                noValidate
                onSubmit={enviar}
              >
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="fechaEvaluacion">
                    Fecha de evaluación
                  </label>
                  <input
                    id="fechaEvaluacion"
                    name="fechaEvaluacion"
                    type="date"
                    className="form-control"
                    value={datos.fechaEvaluacion}
                    onChange={cambiar("fechaEvaluacion")}
                    disabled={!puedeEditar}
                    required
                  />
                  <div className="invalid-feedback">
                    Indica la fecha de evaluación.
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="resultado">
                    Resultado
                  </label>
                  <select
                    id="resultado"
                    name="resultado"
                    className="form-select"
                    value={datos.resultado}
                    onChange={cambiar("resultado")}
                    disabled={!puedeEditar}
                    required
                  >
                    <option value="">Seleccione un resultado</option>
                    {RESULTADOS_EVALUACION.map((opcion) => (
                      <option key={opcion}>{opcion}</option>
                    ))}
                  </select>
                  <div className="invalid-feedback">
                    Selecciona el resultado.
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="observaciones">
                    Observaciones
                  </label>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    className="form-control"
                    rows={5}
                    placeholder="Hallazgos, comportamientos observables, recomendaciones..."
                    value={datos.observaciones}
                    onChange={cambiar("observaciones")}
                    disabled={!puedeEditar}
                    required
                    minLength={10}
                  />
                  <div className="invalid-feedback">
                    Describe la evaluación (mínimo 10 caracteres).
                  </div>
                </div>

                {puedeEditar ? (
                  <div className="col-12 d-flex flex-column flex-sm-row gap-2">
                    <button
                      type="submit"
                      name="intencion"
                      value="guardar"
                      className="btn btn-marca"
                    >
                      Guardar evaluación
                    </button>
                    <button
                      type="submit"
                      name="intencion"
                      value="finalizar"
                      className="btn btn-success"
                    >
                      Guardar y finalizar
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate("/solicitudes")}
                    >
                      Volver
                    </button>
                  </div>
                ) : (
                  <div className="col-12">
                    <Link
                      to="/solicitudes"
                      className="btn btn-outline-secondary"
                    >
                      Volver
                    </Link>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
