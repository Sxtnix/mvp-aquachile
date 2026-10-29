import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import BitacoraEstados from "../components/BitacoraEstados.jsx";
import CampoSelect from "../components/CampoSelect.jsx";
import EtiquetaEstado from "../components/EtiquetaEstado.jsx";
import {
  CATEGORIAS_EVALUADOR,
  ESTADOS_SOLICITUD,
  RESULTADOS_EVALUACION,
} from "../data/catalogos.js";
import { formatFecha, hoyISO } from "../utils/fechas.js";
import { hayErrores, validarEvaluacion } from "../utils/validaciones.js";

export default function SolicitudDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    obtenerSolicitud,
    obtenerCandidato,
    evaluacionDe,
    bitacoraDe,
    dispatch,
    puede,
    veTodasLasSolicitudes,
    perfil,
  } = useApp();

  const solicitud = obtenerSolicitud(id);
  const [guardado, setGuardado] = useState(false);
  const [errores, setErrores] = useState({});

  const [datos, setDatos] = useState(() => {
    const existente = solicitud ? evaluacionDe(solicitud.id) : undefined;
    return {
      fechaEvaluacion: existente?.fechaEvaluacion || "",
      resultado: existente?.resultado || "",
      categoria: existente?.categoria || "",
      observaciones: existente?.observaciones || "",
    };
  });

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
  const sinAsignar = !veTodasLasSolicitudes && !asignada;
  const evaluacion = evaluacionDe(solicitud.id);
  const bitacora = bitacoraDe(solicitud.id);
  const puedeEditar = puede("editarEvaluacion") && !sinAsignar;
  const puedeCambiarEstado = puede("cambiarEstado") && !sinAsignar;

  const cambiar = (campo) => (evento) => {
    setGuardado(false);
    setErrores((actual) => ({ ...actual, [campo]: undefined }));
    setDatos((actual) => ({ ...actual, [campo]: evento.target.value }));
  };

  const cambiarEstado = (estado) => {
    dispatch({
      type: "cambiar-estado",
      id: solicitud.id,
      estado,
      responsable: perfil.nombre,
      fecha: hoyISO(),
    });
    setGuardado(false);
  };

  const enviar = (evento) => {
    evento.preventDefault();
    const validados = validarEvaluacion(datos, { solicitud });
    setErrores(validados);
    if (hayErrores(validados)) return;

    const intencion =
      evento.nativeEvent.submitter?.value === "finalizar"
        ? "finalizar"
        : "guardar";

    dispatch({
      type: "guardar-evaluacion",
      solicitudId: solicitud.id,
      datos,
    });

    if (intencion === "finalizar") {
      dispatch({
        type: "actualizar-solicitud",
        id: solicitud.id,
        datos: { fechaInforme: datos.fechaEvaluacion },
      });
      if (solicitud.estado !== "Finalizada") {
        dispatch({
          type: "cambiar-estado",
          id: solicitud.id,
          estado: "Finalizada",
          responsable: perfil.nombre,
          fecha: hoyISO(),
        });
      }
    } else if (solicitud.estado === "Pendiente") {
      dispatch({
        type: "cambiar-estado",
        id: solicitud.id,
        estado: "En proceso",
        responsable: perfil.nombre,
        fecha: hoyISO(),
      });
    }

    setGuardado(true);
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

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
        <div>
          <h1 className="h3 mb-1">{candidato?.nombre}</h1>
          <p className="text-secondary mb-0">
            {solicitud.cargo} · Familia {solicitud.familia}
          </p>
        </div>
        <div>
          <EtiquetaEstado estado={solicitud.estado} />
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
                <dd className="col-sm-7">{formatFecha(solicitud.fechaSolicitud)}</dd>

                <dt className="col-sm-5">Responsable</dt>
                <dd className="col-sm-7">{solicitud.responsable}</dd>

                <dt className="col-sm-5">Prioridad</dt>
                <dd className="col-sm-7">{solicitud.prioridad}</dd>

                <dt className="col-sm-5">Entrevista</dt>
                <dd className="col-sm-7">
                  {solicitud.fechaEntrevista
                    ? formatFecha(solicitud.fechaEntrevista)
                    : "Sin agendar"}
                </dd>

                <dt className="col-sm-5">Informe</dt>
                <dd className="col-sm-7">
                  {solicitud.fechaInforme
                    ? formatFecha(solicitud.fechaInforme)
                    : "Pendiente"}
                </dd>

                <dt className="col-sm-5">Correo</dt>
                <dd className="col-sm-7 text-break">{candidato?.correo}</dd>

                <dt className="col-sm-5">Teléfono</dt>
                <dd className="col-sm-7">{candidato?.telefono}</dd>
              </dl>

              {solicitud.observaciones ? (
                <p className="small text-secondary border-top pt-2 mb-0">
                  {solicitud.observaciones}
                </p>
              ) : null}

              {puedeCambiarEstado ? (
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

          <div className="card border-0 shadow-sm mt-3">
            <div className="card-body">
              <h2 className="h6 text-uppercase text-secondary mb-3">
                Bitácora de estados
              </h2>
              <BitacoraEstados registros={bitacora} />
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

              <form className="row g-3" noValidate onSubmit={enviar}>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="fechaEvaluacionInput">
                    Fecha de evaluación
                  </label>
                  <input
                    id="fechaEvaluacionInput"
                    name="fechaEvaluacion"
                    type="date"
                    className={`form-control ${
                      errores.fechaEvaluacion ? "is-invalid" : ""
                    }`}
                    value={datos.fechaEvaluacion}
                    onChange={cambiar("fechaEvaluacion")}
                    disabled={!puedeEditar}
                    required
                  />
                  {errores.fechaEvaluacion ? (
                    <div className="invalid-feedback">
                      {errores.fechaEvaluacion}
                    </div>
                  ) : null}
                </div>

                <CampoSelect
                  id="resultado"
                  etiqueta="Resultado"
                  valor={datos.resultado}
                  alCambiar={cambiar("resultado")}
                  opciones={RESULTADOS_EVALUACION.filter(
                    (opcion) => opcion !== "Sin resultado"
                  )}
                  error={errores.resultado}
                  deshabilitado={!puedeEditar}
                  requerido
                />

                <CampoSelect
                  id="categoria"
                  etiqueta="Categoría del evaluador"
                  valor={datos.categoria}
                  alCambiar={cambiar("categoria")}
                  opciones={CATEGORIAS_EVALUADOR}
                  error={errores.categoria}
                  deshabilitado={!puedeEditar}
                  requerido
                />

                <div className="col-12">
                  <label className="form-label" htmlFor="observaciones">
                    Observaciones
                  </label>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    className={`form-control ${
                      errores.observaciones ? "is-invalid" : ""
                    }`}
                    rows={5}
                    placeholder="Hallazgos, comportamientos observables, recomendaciones..."
                    value={datos.observaciones}
                    onChange={cambiar("observaciones")}
                    disabled={!puedeEditar}
                    required
                    minLength={10}
                  />
                  {errores.observaciones ? (
                    <div className="invalid-feedback">
                      {errores.observaciones}
                    </div>
                  ) : (
                    <div className="form-text">
                      Describe la evaluación con al menos 10 caracteres.
                    </div>
                  )}
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
