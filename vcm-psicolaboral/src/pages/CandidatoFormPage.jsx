import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { FAMILIAS_CARGO } from "../data/datosFicticios.js";

const estadoInicial = {
  nombre: "",
  correo: "",
  telefono: "",
  cargo: "",
  familia: "",
};

export default function CandidatoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { obtenerCandidato, agregarCandidato, actualizarCandidato, puede } =
    useApp();

  const candidato = id ? obtenerCandidato(id) : undefined;
  const esEdicion = Boolean(id);
  const soloLectura = esEdicion && !puede("editarCandidato");
  const sinPermiso = esEdicion && !candidato;

  const [datos, setDatos] = useState(() => ({
    ...estadoInicial,
    ...(candidato || {}),
  }));
  const [intento, setIntento] = useState(false);

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

    if (esEdicion) {
      actualizarCandidato(id, datos);
      navigate("/candidatos");
      return;
    }

    agregarCandidato(datos);
    navigate("/candidatos");
  };

  if (sinPermiso) {
    return (
      <div className="alert alert-warning">
        El candidato solicitado no existe.
        <div className="mt-2">
          <Link to="/candidatos" className="btn btn-sm btn-outline-secondary">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/candidatos">Candidatos</Link>
          </li>
          <li className="breadcrumb-item active">
            {esEdicion ? "Editar candidato" : "Nuevo candidato"}
          </li>
        </ol>
      </nav>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
        <div>
          <h1 className="h3 mb-1">
            {esEdicion ? datos.nombre : "Registrar candidato"}
          </h1>
          <p className="text-secondary mb-0">
            {soloLectura
              ? "Ficha en solo consulta (rol Evaluador)."
              : "Los datos deben ser ficticios o simulados."}
          </p>
        </div>
      </div>

      {soloLectura ? (
        <div className="alert alert-info">
          El rol Evaluador no puede crear ni editar candidatos.
        </div>
      ) : null}

      <form
        className={`row g-3 ${intento ? "was-validated" : ""}`}
        noValidate
        onSubmit={enviar}
      >
        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="nombre">
            Nombre completo
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            className="form-control"
            value={datos.nombre}
            onChange={cambiar("nombre")}
            disabled={soloLectura}
            required
            minLength={3}
          />
          <div className="invalid-feedback">
            Ingresa un nombre de al menos 3 caracteres.
          </div>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="correo">
            Correo electrónico
          </label>
          <input
            id="correo"
            name="correo"
            type="email"
            className="form-control"
            value={datos.correo}
            onChange={cambiar("correo")}
            disabled={soloLectura}
            required
          />
          <div className="invalid-feedback">Ingresa un correo válido.</div>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="telefono">
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            className="form-control"
            placeholder="+56 9 1234 5678"
            value={datos.telefono}
            onChange={cambiar("telefono")}
            disabled={soloLectura}
            required
            pattern="[0-9+ ]{8,}"
          />
          <div className="invalid-feedback">
            Usa solo números, espacios o el signo +.
          </div>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="cargo">
            Cargo al que postula
          </label>
          <input
            id="cargo"
            name="cargo"
            type="text"
            className="form-control"
            value={datos.cargo}
            onChange={cambiar("cargo")}
            disabled={soloLectura}
            required
            minLength={3}
          />
          <div className="invalid-feedback">Indica el cargo al que postula.</div>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="familia">
            Familia de cargo
          </label>
          <select
            id="familia"
            name="familia"
            className="form-select"
            value={datos.familia}
            onChange={cambiar("familia")}
            disabled={soloLectura}
            required
          >
            <option value="">Seleccione una familia</option>
            {FAMILIAS_CARGO.map((opcion) => (
              <option key={opcion}>{opcion}</option>
            ))}
          </select>
          <div className="invalid-feedback">Selecciona la familia de cargo.</div>
        </div>

        <div className="col-12 d-flex flex-column flex-sm-row gap-2">
          {soloLectura ? null : (
            <button type="submit" className="btn btn-marca">
              {esEdicion ? "Guardar cambios" : "Registrar candidato"}
            </button>
          )}

          <Link to="/candidatos" className="btn btn-outline-secondary">
            Volver
          </Link>
        </div>
      </form>
    </>
  );
}
