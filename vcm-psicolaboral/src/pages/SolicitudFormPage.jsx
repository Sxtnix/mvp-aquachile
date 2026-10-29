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
            <Link to="/solicitudes">Solicitudes</Link>
          </li>
          <li className="breadcrumb-item active">Nueva solicitud</li>
        </ol>
      </nav>

      <div className="mb-4">
        <h1 className="h3 mb-1">Nueva solicitud de evaluación</h1>
        <p className="text-secondary mb-0">
          Selecciona un candidato sin solicitud activa y el profesional
          responsable.
        </p>
      </div>

      {candidatosDisponibles.length === 0 ? (
        <div className="alert alert-info">
          Todos los candidatos ya tienen una solicitud en curso. Registra un
          candidato nuevo o espera a que se finalicen las solicitudes activas.
        </div>
      ) : null}

      <form className="row g-3" noValidate onSubmit={enviar}>
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

        {candidatoSeleccionado ? (
          <div className="col-12">
            <div className="alert alert-light border small mb-0">
              <strong>Cargo:</strong> {candidatoSeleccionado.cargo} ·{" "}
              <strong>Familia:</strong> {candidatoSeleccionado.familia} ·{" "}
              <strong>Ubicación:</strong> {candidatoSeleccionado.ubicacion} ·{" "}
              <strong>Estado inicial:</strong> Pendiente
            </div>
          </div>
        ) : null}

        <div className="col-12 d-flex flex-column flex-sm-row gap-2">
          <button type="submit" className="btn btn-marca">
            Crear solicitud
          </button>
          <Link to="/solicitudes" className="btn btn-outline-secondary">
            Volver
          </Link>
        </div>
      </form>
    </>
  );
}
