import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import CampoSelect from "../components/CampoSelect.jsx";
import CampoTexto from "../components/CampoTexto.jsx";
import {
  FAMILIAS_CARGO,
  ORIGENES,
  UBICACIONES,
  UNIDADES,
} from "../data/catalogos.js";
import { hayErrores, validarCandidato } from "../utils/validaciones.js";
import { hoyISO } from "../utils/fechas.js";

const estadoInicial = {
  nombre: "",
  correo: "",
  telefono: "",
  cargo: "",
  familia: "",
  origen: "",
  ubicacion: "",
  unidad: "",
  fechaPostulacion: hoyISO(),
  requiereReferencia: false,
};

export default function CandidatoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { obtenerCandidato, candidatos, dispatch, puede } = useApp();

  const candidato = id ? obtenerCandidato(id) : undefined;
  const esEdicion = Boolean(id);
  const soloLectura = esEdicion && !puede("editarCandidato");
  const noEncontrado = esEdicion && !candidato;

  const [datos, setDatos] = useState(() => ({
    ...estadoInicial,
    ...(candidato || {}),
  }));
  const [errores, setErrores] = useState({});

  const cambiar = (campo) => (evento) => {
    const valor =
      evento.target.type === "checkbox"
        ? evento.target.checked
        : evento.target.value;
    setDatos((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actual) => ({ ...actual, [campo]: undefined }));
  };

  const enviar = (evento) => {
    evento.preventDefault();
    const validados = validarCandidato(datos, {
      candidatos,
      idActual: esEdicion ? id : null,
    });
    setErrores(validados);
    if (hayErrores(validados)) return;

    if (esEdicion) {
      dispatch({ type: "actualizar-candidato", id, datos });
    } else {
      dispatch({ type: "agregar-candidato", datos });
    }
    navigate("/candidatos");
  };

  if (noEncontrado) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
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
            <Link to="/candidatos">
              <i className="bi bi-people me-1" aria-hidden="true" />
              Candidatos
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {esEdicion ? "Editar candidato" : "Nuevo candidato"}
          </li>
        </ol>
      </nav>

      <header className="encabezado-pagina mb-4">
        <span className="eyebrow">
          <i className="bi bi-person-vcard" aria-hidden="true" />
          {esEdicion ? "Ficha del postulante" : "Nuevo registro"}
        </span>
        <h1 className="h3 mb-1">
          {esEdicion ? datos.nombre : "Registrar candidato"}
        </h1>
        <p className="text-secondary mb-0">
          {soloLectura
            ? "Ficha en solo consulta."
            : "Los datos deben ser ficticios o anonimizados."}
        </p>
      </header>

      {soloLectura ? (
        <div className="alert alert-info d-flex align-items-center gap-2">
          <i className="bi bi-lock" aria-hidden="true" />
          Tu perfil no puede crear ni editar candidatos.
        </div>
      ) : null}

      <form className="row g-3" noValidate onSubmit={enviar}>
        <div className="col-12">
          <div className="card tarjeta-vc">
            <div className="card-body">
              <h2 className="seccion-titulo">
                <i className="bi bi-person-lines-fill" aria-hidden="true" />
                Datos personales
              </h2>
              <div className="row g-3">
                <CampoTexto
                  id="nombre"
                  etiqueta="Nombre completo"
                  valor={datos.nombre}
                  alCambiar={cambiar("nombre")}
                  error={errores.nombre}
                  deshabilitado={soloLectura}
                  requerido
                />

                <CampoTexto
                  id="correo"
                  etiqueta="Correo electrónico"
                  tipo="email"
                  valor={datos.correo}
                  alCambiar={cambiar("correo")}
                  error={errores.correo}
                  deshabilitado={soloLectura}
                  requerido
                />

                <CampoTexto
                  id="telefono"
                  etiqueta="Teléfono"
                  tipo="tel"
                  valor={datos.telefono}
                  alCambiar={cambiar("telefono")}
                  error={errores.telefono}
                  deshabilitado={soloLectura}
                  requerido
                  placeholder="+56 9 1234 5678"
                />

                <CampoTexto
                  id="fechaPostulacion"
                  etiqueta="Fecha de postulación"
                  tipo="date"
                  valor={datos.fechaPostulacion}
                  alCambiar={cambiar("fechaPostulacion")}
                  error={errores.fechaPostulacion}
                  deshabilitado={soloLectura}
                  requerido
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card tarjeta-vc">
            <div className="card-body">
              <h2 className="seccion-titulo">
                <i className="bi bi-briefcase" aria-hidden="true" />
                Postulación y clasificación
              </h2>
              <div className="row g-3">
                <CampoTexto
                  id="cargo"
                  etiqueta="Cargo al que postula"
                  valor={datos.cargo}
                  alCambiar={cambiar("cargo")}
                  error={errores.cargo}
                  deshabilitado={soloLectura}
                  requerido
                />

                <CampoSelect
                  id="familia"
                  etiqueta="Familia de cargo"
                  valor={datos.familia}
                  alCambiar={cambiar("familia")}
                  opciones={FAMILIAS_CARGO}
                  error={errores.familia}
                  deshabilitado={soloLectura}
                  requerido
                />

                <CampoSelect
                  id="origen"
                  etiqueta="Origen del candidato"
                  valor={datos.origen}
                  alCambiar={cambiar("origen")}
                  opciones={ORIGENES}
                  error={errores.origen}
                  deshabilitado={soloLectura}
                  requerido
                />

                <CampoSelect
                  id="ubicacion"
                  etiqueta="Ubicación del cargo"
                  valor={datos.ubicacion}
                  alCambiar={cambiar("ubicacion")}
                  opciones={UBICACIONES}
                  error={errores.ubicacion}
                  deshabilitado={soloLectura}
                  requerido
                />

                <CampoSelect
                  id="unidad"
                  etiqueta="Departamento"
                  valor={datos.unidad}
                  alCambiar={cambiar("unidad")}
                  opciones={UNIDADES}
                  error={errores.unidad}
                  deshabilitado={soloLectura}
                  requerido
                />

                <div className="col-12 col-md-6 d-flex align-items-end">
                  <div className="form-check mb-2">
                    <input
                      id="requiereReferencia"
                      name="requiereReferencia"
                      type="checkbox"
                      className="form-check-input"
                      checked={Boolean(datos.requiereReferencia)}
                      onChange={cambiar("requiereReferencia")}
                      disabled={soloLectura}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="requiereReferencia"
                    >
                      Requiere contacto de referencia
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 d-flex flex-column flex-sm-row gap-2">
          {soloLectura ? null : (
            <button type="submit" className="btn btn-marca">
              <i className="bi bi-check2-circle me-1" aria-hidden="true" />
              {esEdicion ? "Guardar cambios" : "Registrar candidato"}
            </button>
          )}

          <Link to="/candidatos" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-1" aria-hidden="true" />
            Volver
          </Link>
        </div>
      </form>
    </>
  );
}
