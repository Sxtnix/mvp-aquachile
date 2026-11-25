import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import AnalisisIa from "../components/AnalisisIa.jsx";
import BitacoraEstados from "../components/BitacoraEstados.jsx";
import CampoSelect from "../components/CampoSelect.jsx";
import CampoTexto from "../components/CampoTexto.jsx";
import EtiquetaEstado from "../components/EtiquetaEstado.jsx";
import {
  CATEGORIAS_EVALUADOR,
  ESTADOS_SOLICITUD,
  RESULTADOS_EVALUACION,
} from "../data/catalogos.js";
import { formatFecha, hoyISO } from "../utils/fechas.js";
import { hayErrores, validarEvaluacion } from "../utils/validaciones.js";

const iconoPrioridad = {
  Alta: "bi-exclamation-triangle-fill",
  Media: "bi-dash-circle-fill",
  Baja: "bi-arrow-down-circle-fill",
};

export default function SolicitudDetallePage() {
  const { id } = useParams();
  const {
    obtenerSolicitud,
    obtenerCandidato,
    evaluacionDe,
    bitacoraDe,
    dispatch,
    puede,
    veTodasLasSolicitudes,
    perfil,
    usaApi,
    descargarCv,
  } = useApp();

  const solicitud = obtenerSolicitud(id);
  const evaluacion = solicitud ? evaluacionDe(solicitud.id) : undefined;

  const [guardado, setGuardado] = useState(false);
  const [errorCv, setErrorCv] = useState("");
  const [descargando, setDescargando] = useState(false);
  const [errores, setErrores] = useState({});
  const [datos, setDatos] = useState(() => ({
    fechaEvaluacion: evaluacion?.fechaEvaluacion || hoyISO(),
    resultado: evaluacion?.resultado || "Apto",
    categoria: evaluacion?.categoria || "Recomendado",
    observaciones: evaluacion?.observaciones || "",
  }));

  if (!solicitud) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
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
  const bitacora = bitacoraDe(solicitud.id);
  const puedeEditar = puede("editarEvaluacion") && !sinAsignar;
  const puedeCambiarEstado = puede("cambiarEstado") && !sinAsignar;

  const cambiar = (campo) => (evento) => {
    setGuardado(false);
    setErrores((actual) => ({ ...actual, [campo]: undefined }));
    setDatos((actual) => ({ ...actual, [campo]: evento.target.value }));
  };

  const cambiarEstado = (estado) => {
    if (solicitud.estado === estado) return;
    dispatch({
      type: "cambiar-estado",
      id: solicitud.id,
      estado,
      responsable: perfil.nombre,
      fecha: hoyISO(),
    });
    setGuardado(false);
  };

  const descargarCurriculum = async () => {
    if (!solicitud.postulacion?.id) return;
    setErrorCv("");
    setDescargando(true);
    try {
      await descargarCv(
        solicitud.postulacion.id,
        solicitud.postulacion.archivo?.nombreOriginal || "curriculum.pdf",
      );
    } catch (fallo) {
      setErrorCv(fallo?.message || "No fue posible descargar el currículum.");
    } finally {
      setDescargando(false);
    }
  };

  const procesar = (intencion) => {
    if (!puedeEditar) return;

    const validados = validarEvaluacion(datos, { solicitud });
    setErrores(validados);
    if (hayErrores(validados)) {
      setGuardado(false);
      return;
    }

    dispatch({
      type: "guardar-evaluacion",
      solicitudId: solicitud.id,
      datos,
      finalizar: intencion === "finalizar",
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
            <Link to="/solicitudes">
              <i className="bi bi-inbox me-1" aria-hidden="true" />
              Solicitudes
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Solicitud #{solicitud.id}
          </li>
        </ol>
      </nav>

      <header className="encabezado-pagina mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
          <div className="d-flex align-items-start gap-3">
            <span className="avatar-iniciales" aria-hidden="true">
              <i className="bi bi-person" />
            </span>
            <div>
              <span className="eyebrow">
                <i className="bi bi-clipboard2-check" aria-hidden="true" />
                Detalle de la solicitud
              </span>
              <h1 className="h3 mb-1">{candidato?.nombre || "Sin candidato"}</h1>
              <p className="text-secondary mb-2">
                <i className="bi bi-briefcase me-1" aria-hidden="true" />
                {solicitud.cargo} · Familia {solicitud.familia}
              </p>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <EtiquetaEstado estado={solicitud.estado} />
                {solicitud.canal === "Portal público" ? (
                  <span className="badge-vc estado-en-proceso">
                    <i className="bi bi-broadcast" aria-hidden="true" />
                    Portal público
                  </span>
                ) : null}
                <span
                  className={`prioridad prioridad-${solicitud.prioridad?.toLowerCase()}`}
                >
                  <i
                    className={`bi ${
                      iconoPrioridad[solicitud.prioridad] || "bi-dash-circle"
                    }`}
                    aria-hidden="true"
                  />
                  Prioridad {solicitud.prioridad?.toLowerCase()}
                </span>
                <span className="small text-secondary">
                  <i className="bi bi-person-badge me-1" aria-hidden="true" />
                  {solicitud.responsable}
                </span>
              </div>
            </div>
          </div>

          <Link to="/solicitudes" className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-arrow-left me-1" aria-hidden="true" />
            Volver al listado
          </Link>
        </div>
      </header>

      {sinAsignar ? (
        <div className="alert alert-warning d-flex align-items-start gap-2">
          <i className="bi bi-shield-lock mt-1" aria-hidden="true" />
          <span>
            Esta solicitud está asignada a <strong>{solicitud.responsable}</strong>.
            No puedes editar su evaluación.
          </span>
        </div>
      ) : null}

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-5">
          <div className="card tarjeta-vc h-100">
            <div className="card-body">
              <h2 className="seccion-titulo">
                <i className="bi bi-info-circle" aria-hidden="true" />
                Datos de la solicitud
              </h2>

              <dl className="row small mb-0">
                <dt className="col-sm-5 text-secondary fw-normal">
                  <i className="bi bi-calendar3 me-1" aria-hidden="true" />
                  Fecha solicitud
                </dt>
                <dd className="col-sm-7">
                  {formatFecha(solicitud.fechaSolicitud)}
                </dd>

                <dt className="col-sm-5 text-secondary fw-normal">
                  <i className="bi bi-person-badge me-1" aria-hidden="true" />
                  Responsable
                </dt>
                <dd className="col-sm-7">{solicitud.responsable}</dd>

                <dt className="col-sm-5 text-secondary fw-normal">
                  <i className="bi bi-flag me-1" aria-hidden="true" />
                  Prioridad
                </dt>
                <dd className="col-sm-7">{solicitud.prioridad}</dd>

                <dt className="col-sm-5 text-secondary fw-normal">
                  <i className="bi bi-camera-video me-1" aria-hidden="true" />
                  Entrevista
                </dt>
                <dd className="col-sm-7">
                  {solicitud.fechaEntrevista
                    ? formatFecha(solicitud.fechaEntrevista)
                    : "Sin agendar"}
                </dd>

                <dt className="col-sm-5 text-secondary fw-normal">
                  <i className="bi bi-file-earmark-text me-1" aria-hidden="true" />
                  Informe
                </dt>
                <dd className="col-sm-7">
                  {solicitud.fechaInforme
                    ? formatFecha(solicitud.fechaInforme)
                    : "Pendiente"}
                </dd>

                {solicitud.ofertaId ? (
                  <>
                    <dt className="col-sm-5 text-secondary fw-normal">
                      <i className="bi bi-megaphone me-1" aria-hidden="true" />
                      Oferta
                    </dt>
                    <dd className="col-sm-7">
                      <Link to={`/ofertas/${solicitud.ofertaId}`}>
                        Ver oferta #{solicitud.ofertaId}
                      </Link>
                    </dd>
                  </>
                ) : null}

                {solicitud.postulacion || solicitud.curriculum ? (
                  <>
                    <dt className="col-sm-5 text-secondary fw-normal">
                      <i className="bi bi-folder2-open me-1" aria-hidden="true" />
                      Currículum
                    </dt>
                    <dd className="col-sm-7 text-break">
                      <span className="d-block">
                        {solicitud.postulacion?.archivo?.nombreOriginal ||
                          solicitud.curriculum?.nombre ||
                          "Archivo adjunto"}
                      </span>
                      {solicitud.postulacion?.folio ? (
                        <span className="small text-secondary d-block">
                          Folio {solicitud.postulacion.folio}
                        </span>
                      ) : null}
                      {solicitud.postulacion?.carpeta ? (
                        <code className="small d-block text-break">
                          {solicitud.postulacion.carpeta}
                        </code>
                      ) : null}
                      {usaApi && solicitud.postulacion?.archivo ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-marca mt-2"
                          onClick={descargarCurriculum}
                          disabled={descargando}
                        >
                          <i className="bi bi-download me-1" aria-hidden="true" />
                          {descargando ? "Descargando…" : "Descargar CV"}
                        </button>
                      ) : null}
                      {errorCv ? (
                        <span className="small text-danger d-block mt-1">
                          {errorCv}
                        </span>
                      ) : null}
                    </dd>
                  </>
                ) : null}

                <dt className="col-sm-5 text-secondary fw-normal">
                  <i className="bi bi-envelope me-1" aria-hidden="true" />
                  Correo
                </dt>
                <dd className="col-sm-7 text-break">{candidato?.correo || "—"}</dd>

                <dt className="col-sm-5 text-secondary fw-normal">
                  <i className="bi bi-telephone me-1" aria-hidden="true" />
                  Teléfono
                </dt>
                <dd className="col-sm-7">{candidato?.telefono || "—"}</dd>
              </dl>

              {solicitud.observaciones ? (
                <div className="border-top mt-3 pt-3">
                  <p className="small text-secondary mb-1">Observaciones</p>
                  <p className="small mb-0">{solicitud.observaciones}</p>
                </div>
              ) : null}

              {candidato ? (
                <Link
                  to={`/candidatos/${candidato.id}`}
                  className="btn btn-sm btn-outline-secondary mt-3"
                >
                  <i className="bi bi-person-vcard me-1" aria-hidden="true" />
                  Ver ficha del candidato
                </Link>
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
        </div>

        <div className="col-12 col-lg-7">
          <div className="card tarjeta-vc h-100">
            <div className="card-body">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
                <h2 className="seccion-titulo mb-0">
                  <i className="bi bi-clipboard2-pulse" aria-hidden="true" />
                  Evaluación psicolaboral
                </h2>
                {evaluacion ? (
                  <span className="badge-vc estado-finalizada">
                    <i className="bi bi-check2-circle" aria-hidden="true" />
                    Evaluación registrada
                  </span>
                ) : (
                  <span className="badge-vc estado-pendiente">
                    <i className="bi bi-hourglass-split" aria-hidden="true" />
                    Sin registrar
                  </span>
                )}
              </div>

              {guardado ? (
                <div
                  className="alert alert-success d-flex align-items-center gap-2 py-2"
                  role="status"
                >
                  <i className="bi bi-check-circle-fill" aria-hidden="true" />
                  Evaluación guardada correctamente.
                </div>
              ) : null}

              {!puedeEditar ? (
                <div className="alert alert-info d-flex align-items-start gap-2 py-2 small">
                  <i className="bi bi-eye mt-1" aria-hidden="true" />
                  <span>
                    {sinAsignar
                      ? "No tienes permisos sobre esta evaluación."
                      : "Tu perfil puede consultar la evaluación, pero no modificarla."}
                  </span>
                </div>
              ) : null}

              <form
                className="row g-3"
                noValidate
                onSubmit={(evento) => {
                  evento.preventDefault();
                  procesar("guardar");
                }}
              >
                <CampoTexto
                  id="fechaEvaluacion"
                  etiqueta="Fecha de evaluación"
                  tipo="date"
                  valor={puedeEditar || evaluacion ? datos.fechaEvaluacion : ""}
                  alCambiar={cambiar("fechaEvaluacion")}
                  error={errores.fechaEvaluacion}
                  deshabilitado={!puedeEditar}
                  requerido
                />

                <CampoSelect
                  id="resultado"
                  etiqueta="Resultado de la evaluación"
                  valor={puedeEditar || evaluacion ? datos.resultado : ""}
                  alCambiar={cambiar("resultado")}
                  opciones={RESULTADOS_EVALUACION}
                  error={errores.resultado}
                  deshabilitado={!puedeEditar}
                  requerido
                />

                <CampoSelect
                  id="categoria"
                  etiqueta="Categoría del evaluador"
                  valor={puedeEditar || evaluacion ? datos.categoria : ""}
                  alCambiar={cambiar("categoria")}
                  opciones={CATEGORIAS_EVALUADOR}
                  error={errores.categoria}
                  deshabilitado={!puedeEditar}
                  requerido
                />

                <div className="col-12">
                  <label className="form-label" htmlFor="observaciones">
                    Observaciones de la evaluación
                    <span className="text-danger"> *</span>
                  </label>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    className={`form-control ${
                      errores.observaciones ? "is-invalid" : ""
                    }`}
                    rows={4}
                    placeholder="Fundamento de la evaluación, competencias observadas y recomendación..."
                    value={puedeEditar || evaluacion ? datos.observaciones : ""}
                    onChange={cambiar("observaciones")}
                    disabled={!puedeEditar}
                    aria-invalid={errores.observaciones ? "true" : "false"}
                  />
                  {errores.observaciones ? (
                    <div className="invalid-feedback">{errores.observaciones}</div>
                  ) : null}
                </div>

                {puedeEditar ? (
                  <div className="col-12 d-flex flex-column flex-sm-row gap-2">
                    <button
                      type="submit"
                      className="btn btn-outline-marca"
                    >
                      <i className="bi bi-save me-1" aria-hidden="true" />
                      Guardar borrador
                    </button>
                    <button
                      type="button"
                      className="btn btn-marca"
                      onClick={() => procesar("finalizar")}
                    >
                      <i className="bi bi-check2-circle me-1" aria-hidden="true" />
                      Guardar y finalizar
                    </button>
                  </div>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      </div>

      {usaApi ? <AnalisisIa solicitud={solicitud} /> : null}

      <div className="card tarjeta-vc">
        <div className="card-body">
          <h2 className="seccion-titulo">
            <i className="bi bi-clock-history" aria-hidden="true" />
            Bitácora de estados
          </h2>
          <BitacoraEstados registros={bitacora} />
        </div>
      </div>
    </>
  );
}
