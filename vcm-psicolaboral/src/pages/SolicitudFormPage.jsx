import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { RESPONSABLES } from "../data/datosFicticios.js";

export default function SolicitudFormPage() {
  const navigate = useNavigate();
  const { candidatos, solicitudes, crearSolicitud, puede, perfil } = useApp();

  const [datos, setDatos] = useState({
    candidatoId: "",
    fechaSolicitud: new Date().toISOString().slice(0, 10),
    responsable: "",
  });
  const [intento, setIntento] = useState(false);

  const candidatoSeleccionado = candidatos.find(
    (candidato) => candidato.id === Number(datos.candidatoId)
  );

  const cambiar = (campo) => (evento) =>
    setDatos((actual) => ({ ...actual, [campo]: evento.target.value }));

  const enviar = (evento) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    setIntento(true);

    if (!formulario.checkValidity()) {
      evento.stopPropagation();
      return;
    }

    if (!candidatoSeleccionado) return;

    const id = crearSolicitud({
      candidatoId: candidatoSeleccionado.id,
      cargo: candidatoSeleccionado.cargo,
      familia: candidatoSeleccionado.familia,
      fechaSolicitud: datos.fechaSolicitud,
      responsable: datos.responsable,
    });

    navigate(`/solicitudes/${id}`);
  };

  if (!puede("crearSolicitud")) {
    return (
      <div className="alert alert-warning">
        El rol Evaluador no puede crear solicitudes de evaluación.
        <div className="mt-2">
          <Link to="/solicitudes" className="btn btn-sm btn-outline-secondary">
            Ver solicitudes asignadas
          </Link>
        </div>
      </div>
    );
  }

  const candidatosSinSolicitud = candidatos.filter(
    (candidato) =>
      !solicitudes.some((solicitud) => solicitud.candidatoId === candidato.id)
  );

  const opciones = candidatosSinSolicitud.length
    ? candidatosSinSolicitud
    : candidatos;

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
          Selecciona un candidato y el profesional responsable.
        </p>
      </div>

      <form
        className={`row g-3 ${intento ? "was-validated" : ""}`}
        noValidate
        onSubmit={enviar}
      >
        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="candidato">
            Candidato
          </label>
          <select
            id="candidato"
            name="candidato"
            className="form-select"
            value={datos.candidatoId}
            onChange={cambiar("candidatoId")}
            required
          >
            <option value="">Seleccione un candidato</option>
            {opciones.map((candidato) => (
              <option key={candidato.id} value={candidato.id}>
                {candidato.nombre} · {candidato.cargo}
              </option>
            ))}
          </select>
          <div className="invalid-feedback">Selecciona el candidato.</div>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="fechaSolicitud">
            Fecha de solicitud
          </label>
          <input
            id="fechaSolicitud"
            name="fechaSolicitud"
            type="date"
            className="form-control"
            value={datos.fechaSolicitud}
            onChange={cambiar("fechaSolicitud")}
            required
          />
          <div className="invalid-feedback">Indica la fecha de solicitud.</div>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="responsable">
            Profesional responsable
          </label>
          <select
            id="responsable"
            name="responsable"
            className="form-select"
            value={datos.responsable}
            onChange={cambiar("responsable")}
            required
          >
            <option value="">Seleccione un responsable</option>
            {RESPONSABLES.map((nombre) => (
              <option key={nombre}>{nombre}</option>
            ))}
          </select>
          <div className="invalid-feedback">Selecciona el responsable.</div>
        </div>

        {candidatoSeleccionado ? (
          <div className="col-12">
            <div className="alert alert-light border small mb-0">
              <strong>Cargo:</strong> {candidatoSeleccionado.cargo} ·{" "}
              <strong>Familia:</strong> {candidatoSeleccionado.familia} ·{" "}
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
