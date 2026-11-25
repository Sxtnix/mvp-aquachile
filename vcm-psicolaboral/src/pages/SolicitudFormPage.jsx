import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import CampoSelect from "../components/CampoSelect.jsx";
import CampoTexto from "../components/CampoTexto.jsx";
import { PRIORIDADES, RESPONSABLES } from "../data/catalogos.js";
import { hayErrores, validarSolicitud } from "../utils/validaciones.js";
import { hoyISO } from "../utils/fechas.js";

const estadoInicial = {
  candidatoId: "",
  responsable: "",
  prioridad: "",
  observaciones: "",
  fechaEntrevista: "",
  fechaSolicitud: hoyISO(),
};

export default function SolicitudFormPage() {
  const navigate = useNavigate();
  const { candidatos, solicitudes, dispatch, puede } = useApp();

  const [datos, setDatos] = useState(estadoInicial);
  const [errores, setErrores] = useState({});

  const candidatoSeleccionado = candidatos.find(
    (candidato) => candidato.id === Number(datos.candidatoId)
  );

  const cambiar = (campo) => (evento) => {
    setDatos((actual) => ({ ...actual, [campo]: evento.target.value }));
    setErrores((actual) => ({ ...actual, [campo]: undefined }));
  };

  const enviar = (evento) => {
    evento.preventDefault();
    const validados = validarSolicitud(datos, { candidatos, solicitudes });
    setErrores(validados);
    if (hayErrores(validados)) return;

    const candidato = candidatos.find(
      (item) => item.id === Number(datos.candidatoId)
    );
    if (!candidato) return;

    dispatch({
      type: "crear-solicitud",
      datos: {
        candidatoId: candidato.id,
        cargo: candidato.cargo,
        familia: candidato.familia,
        fechaSolicitud: datos.fechaSolicitud,
        responsable: datos.responsable,
        prioridad: datos.prioridad,
        observaciones: datos.observaciones,
        fechaEntrevista: datos.fechaEntrevista,
        fechaInforme: "",
      },
    });

    navigate("/solicitudes");
  };

  if (!puede("crearSolicitud")) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-shield-lock me-2" aria-hidden="true" />
        Tu perfil no puede crear solicitudes de evaluación.
        <div className="mt-2">
          <Link to="/solicitudes" className="btn btn-sm btn-outline-secondary">
            Ver solicitudes
          </Link>
        </div>
      </div>
    );
  }

  const candidatosDisponibles = candidatos.filter(
    (candidato) =>
      !solicitudes.some(
        (solicitud) =>
          solicitud.candidatoId === candidato.id &&
          solicitud.estado !== "Finalizada"
      )
  );

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
            Nueva solicitud
          </li>
        </ol>
      </nav>

      <header className="encabezado-pagina mb-4">
        <span className="eyebrow">
          <i className="bi bi-clipboard-plus" aria-hidden="true" />
          Nueva evaluación
        </span>
        <h1 className="h3 mb-1">Nueva solicitud de evaluación</h1>
        <p className="text-secondary mb-0">
          Selecciona un candidato sin solicitud activa y el profesional
          responsable.
        </p>
      </header>

      {candidatosDisponibles.length === 0 ? (
        <div className="alert alert-info d-flex align-items-start gap-2">
          <i className="bi bi-info-circle mt-1" aria-hidden="true" />
          <span>
            Todos los candidatos ya tienen una solicitud en curso. Registra un
            candidato nuevo o espera a que se finalicen las solicitudes activas.
          </span>
        </div>
      ) : null}

      <form className="row g-3" noValidate onSubmit={enviar}>
        <div className="col-12 col-lg-8">
          <div className="card tarjeta-vc h-100">
            <div className="card-body">
              <h2 className="seccion-titulo">
                <i className="bi bi-person-check" aria-hidden="true" />
                Datos de la solicitud
              </h2>
              <div className="row g-3">
                <CampoSelect
                  id="candidatoId"
                  etiqueta="Candidato"
                  valor={datos.candidatoId}
                  alCambiar={cambiar("candidatoId")}
                  opciones={candidatosDisponibles.map((candidato) => ({
                    valor: String(candidato.id),
                    texto: `${candidato.nombre} · ${candidato.cargo}`,
                  }))}
                  placeholder="Seleccione un candidato"
                  error={errores.candidatoId}
                  requerido
                />

                <CampoTexto
                  id="fechaSolicitud"
                  etiqueta="Fecha de solicitud"
                  tipo="date"
                  valor={datos.fechaSolicitud}
                  alCambiar={cambiar("fechaSolicitud")}
                  error={errores.fechaSolicitud}
                  requerido
                />

                <CampoSelect
                  id="responsable"
                  etiqueta="Profesional responsable"
                  valor={datos.responsable}
                  alCambiar={cambiar("responsable")}
                  opciones={RESPONSABLES}
                  error={errores.responsable}
                  requerido
                />

                <CampoSelect
                  id="prioridad"
                  etiqueta="Prioridad"
                  valor={datos.prioridad}
                  alCambiar={cambiar("prioridad")}
                  opciones={PRIORIDADES}
                  error={errores.prioridad}
                  requerido
                />

                <CampoTexto
                  id="fechaEntrevista"
                  etiqueta="Fecha de entrevista (opcional)"
                  tipo="date"
                  valor={datos.fechaEntrevista}
                  alCambiar={cambiar("fechaEntrevista")}
                />

                <div className="col-12">
                  <label className="form-label" htmlFor="observaciones">
                    Observaciones de la solicitud
                  </label>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    className="form-control"
                    rows={3}
                    placeholder="Contexto de la solicitud, urgencia, detalles del cargo..."
                    value={datos.observaciones}
                    onChange={cambiar("observaciones")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card tarjeta-vc h-100">
            <div className="card-body">
              <h2 className="seccion-titulo">
                <i className="bi bi-card-checklist" aria-hidden="true" />
                Resumen
              </h2>

              {candidatoSeleccionado ? (
                <dl className="row small mb-0">
                  <dt className="col-5 text-secondary fw-normal">Cargo</dt>
                  <dd className="col-7 fw-semibold">
                    {candidatoSeleccionado.cargo}
                  </dd>
                  <dt className="col-5 text-secondary fw-normal">Familia</dt>
                  <dd className="col-7">{candidatoSeleccionado.familia}</dd>
                  <dt className="col-5 text-secondary fw-normal">Ubicación</dt>
                  <dd className="col-7">{candidatoSeleccionado.ubicacion}</dd>
                  <dt className="col-5 text-secondary fw-normal">
                    Estado inicial
                  </dt>
                  <dd className="col-7">
                    <span className="badge-vc estado-pendiente">
                      <i className="bi bi-hourglass-split" aria-hidden="true" />
                      Pendiente
                    </span>
                  </dd>
                </dl>
              ) : (
                <div className="text-center text-secondary small py-4">
                  <i
                    className="bi bi-person-plus d-block fs-2 mb-2 texto-aqua"
                    aria-hidden="true"
                  />
                  Selecciona un candidato para ver el resumen de la solicitud.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 d-flex flex-column flex-sm-row gap-2">
          <button type="submit" className="btn btn-marca">
            <i className="bi bi-send me-1" aria-hidden="true" />
            Crear solicitud
          </button>
          <Link to="/solicitudes" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-1" aria-hidden="true" />
            Volver
          </Link>
        </div>
      </form>
    </>
  );
}
