import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CampoSelect from "../components/CampoSelect.jsx";
import CampoTexto from "../components/CampoTexto.jsx";
import {
  ESTADOS_OFERTA,
  FAMILIAS_CARGO,
  MODALIDADES,
  RESPONSABLES,
  UBICACIONES,
  UNIDADES,
} from "../data/catalogos.js";
import { useApp } from "../context/AppContext.jsx";
import { hoyISO } from "../utils/fechas.js";
import { hayErrores, validarOferta } from "../utils/validaciones.js";

const estadoInicial = {
  cargo: "",
  familia: "",
  ubicacion: "",
  unidad: "",
  modalidad: "",
  vacantes: "1",
  fechaPublicacion: hoyISO(),
  fechaCierre: "",
  estado: "Publicada",
  responsable: "",
  descripcion: "",
  funciones: "",
  requisitos: "",
  beneficios: "",
  sueldo: "",
};

function CampoArea({ id, etiqueta, valor, alCambiar, error, requerido, placeholder, filas = 3 }) {
  return (
    <div className="col-12">
      <label className="form-label" htmlFor={id}>
        {etiqueta}
        {requerido ? <span className="text-danger"> *</span> : null}
      </label>
      <textarea
        id={id}
        name={id}
        className={`form-control ${error ? "is-invalid" : ""}`}
        rows={filas}
        value={valor}
        onChange={alCambiar}
        placeholder={placeholder}
        aria-invalid={error ? "true" : "false"}
      />
      {error ? <div className="invalid-feedback">{error}</div> : null}
    </div>
  );
}

export default function OfertaFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { obtenerOferta, dispatch, puede } = useApp();

  const oferta = id ? obtenerOferta(id) : undefined;
  const esEdicion = Boolean(id);
  const noEncontrado = esEdicion && !oferta;

  const [datos, setDatos] = useState(() => ({
    ...estadoInicial,
    ...(oferta || {}),
    vacantes: String(oferta?.vacantes ?? 1),
  }));
  const [errores, setErrores] = useState({});

  const cambiar = (campo) => (evento) => {
    setDatos((actual) => ({ ...actual, [campo]: evento.target.value }));
    setErrores((actual) => ({ ...actual, [campo]: undefined }));
  };

  const enviar = (evento) => {
    evento.preventDefault();
    const validados = validarOferta(datos);
    setErrores(validados);
    if (hayErrores(validados)) return;

    const normalizados = { ...datos, vacantes: Number(datos.vacantes) };

    if (esEdicion) {
      dispatch({ type: "actualizar-oferta", id, datos: normalizados });
    } else {
      dispatch({ type: "crear-oferta", datos: normalizados });
    }
    navigate("/ofertas");
  };

  if (!puede("gestionarOfertas")) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-shield-lock me-2" aria-hidden="true" />
        Tu perfil no puede crear ni editar ofertas laborales.
        <div className="mt-2">
          <Link to="/ofertas" className="btn btn-sm btn-outline-secondary">
            Volver a las ofertas
          </Link>
        </div>
      </div>
    );
  }

  if (noEncontrado) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
        La oferta solicitada no existe.
        <div className="mt-2">
          <Link to="/ofertas" className="btn btn-sm btn-outline-secondary">
            Volver a las ofertas
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
            <Link to="/ofertas">
              <i className="bi bi-broadcast me-1" aria-hidden="true" />
              Ofertas
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {esEdicion ? "Editar oferta" : "Nueva oferta"}
          </li>
        </ol>
      </nav>

      <header className="encabezado-pagina mb-4">
        <span className="eyebrow">
          <i className="bi bi-megaphone" aria-hidden="true" />
          Publicación de vacantes
        </span>
        <h1 className="h3 mb-1">
          {esEdicion ? oferta.cargo : "Publicar oferta laboral"}
        </h1>
        <p className="text-secondary mb-0">
          La oferta aparecerá en el portal público mientras esté publicada y
          dentro de su fecha de cierre.
        </p>
      </header>

      <form className="row g-3" noValidate onSubmit={enviar}>
        <div className="col-12 col-lg-8">
          <div className="card tarjeta-vc h-100">
            <div className="card-body">
              <h2 className="seccion-titulo">
                <i className="bi bi-briefcase" aria-hidden="true" />
                Datos del cargo
              </h2>
              <div className="row g-3">
                <CampoTexto
                  id="cargo"
                  etiqueta="Cargo de la oferta"
                  valor={datos.cargo}
                  alCambiar={cambiar("cargo")}
                  error={errores.cargo}
                  requerido
                />

                <CampoSelect
                  id="familia"
                  etiqueta="Familia de cargo"
                  valor={datos.familia}
                  alCambiar={cambiar("familia")}
                  opciones={FAMILIAS_CARGO}
                  error={errores.familia}
                  requerido
                />

                <CampoSelect
                  id="ubicacion"
                  etiqueta="Ubicación del cargo"
                  valor={datos.ubicacion}
                  alCambiar={cambiar("ubicacion")}
                  opciones={UBICACIONES}
                  error={errores.ubicacion}
                  requerido
                />

                <CampoSelect
                  id="unidad"
                  etiqueta="Departamento"
                  valor={datos.unidad}
                  alCambiar={cambiar("unidad")}
                  opciones={UNIDADES}
                  error={errores.unidad}
                  requerido
                />

                <CampoSelect
                  id="modalidad"
                  etiqueta="Modalidad de trabajo"
                  valor={datos.modalidad}
                  alCambiar={cambiar("modalidad")}
                  opciones={MODALIDADES}
                  error={errores.modalidad}
                  requerido
                />

                <CampoTexto
                  id="vacantes"
                  etiqueta="Cantidad de vacantes"
                  tipo="number"
                  valor={datos.vacantes}
                  alCambiar={cambiar("vacantes")}
                  error={errores.vacantes}
                  min="1"
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

                <CampoTexto
                  id="fechaPublicacion"
                  etiqueta="Fecha de publicación"
                  tipo="date"
                  valor={datos.fechaPublicacion}
                  alCambiar={cambiar("fechaPublicacion")}
                  error={errores.fechaPublicacion}
                  ayuda="Obligatoria al publicar. En borrador puede quedar vacía."
                  requerido={datos.estado !== "Borrador"}
                />

                <CampoTexto
                  id="fechaCierre"
                  etiqueta="Fecha de cierre"
                  tipo="date"
                  valor={datos.fechaCierre}
                  alCambiar={cambiar("fechaCierre")}
                  error={errores.fechaCierre}
                  requerido
                />

                <CampoArea
                  id="descripcion"
                  etiqueta="Descripción de la oferta"
                  valor={datos.descripcion}
                  alCambiar={cambiar("descripcion")}
                  error={errores.descripcion}
                  placeholder="Contexto del cargo, equipo de trabajo y propósito de la vacante…"
                  requerido
                />

                <CampoArea
                  id="funciones"
                  etiqueta="Funciones del cargo"
                  valor={datos.funciones}
                  alCambiar={cambiar("funciones")}
                  error={errores.funciones}
                  placeholder={"Una función por línea:\nEjecutar mantenciones preventivas.\nRegistrar órdenes de trabajo…"}
                  requerido
                />

                <CampoArea
                  id="requisitos"
                  etiqueta="Requisitos"
                  valor={datos.requisitos}
                  alCambiar={cambiar("requisitos")}
                  error={errores.requisitos}
                  placeholder={"Formación, experiencia y competencias requeridas…\nUna por línea."}
                  requerido
                />

                <CampoArea
                  id="beneficios"
                  etiqueta="Beneficios"
                  valor={datos.beneficios}
                  alCambiar={cambiar("beneficios")}
                  error={errores.beneficios}
                  placeholder={"Seguro complementario de salud.\nBono de turno y movilización…"}
                  filas={3}
                />

                <CampoTexto
                  id="sueldo"
                  etiqueta="Sueldo o rango"
                  valor={datos.sueldo}
                  alCambiar={cambiar("sueldo")}
                  error={errores.sueldo}
                  placeholder="Ej: $850.000 - $1.050.000 líquido"
                  ayuda="Opcional. Puedes indicar un rango o dejarlo a convenir."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card tarjeta-vc h-100">
            <div className="card-body">
              <h2 className="seccion-titulo">
                <i className="bi bi-sliders" aria-hidden="true" />
                Publicación
              </h2>

              <CampoSelect
                id="estado"
                etiqueta="Estado de la oferta"
                valor={datos.estado}
                alCambiar={cambiar("estado")}
                opciones={ESTADOS_OFERTA}
                error={errores.estado}
                requerido
              />

              <div className="alert alert-info small mt-3 mb-0">
                <i className="bi bi-info-circle me-1" aria-hidden="true" />
                Las ofertas publicadas y vigentes se muestran automáticamente en
                el portal público. Al cerrarlas, dejan de recibir
                postulaciones.
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 d-flex flex-column flex-sm-row gap-2">
          <button type="submit" className="btn btn-marca">
            <i className="bi bi-check2-circle me-1" aria-hidden="true" />
            {esEdicion ? "Guardar cambios" : "Publicar oferta"}
          </button>
          <Link to="/ofertas" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-1" aria-hidden="true" />
            Volver
          </Link>
        </div>
      </form>
    </>
  );
}
