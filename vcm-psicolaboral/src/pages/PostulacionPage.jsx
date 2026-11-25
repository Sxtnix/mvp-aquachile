import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { formatFecha } from "../utils/fechas.js";
import { hayErrores, validarPostulacionPublica } from "../utils/validaciones.js";

const estadoInicial = {
  nombre: "",
  correo: "",
  telefono: "",
  curriculum: null,
  consentimiento: false,
};

function formatearTamano(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PostulacionPage() {
  const { ofertaId } = useParams();
  const {
    obtenerOferta,
    candidatos,
    solicitudes,
    postularPublico,
    usaApi,
  } = useApp();
  const oferta = obtenerOferta(ofertaId);

  const [datos, setDatos] = useState(estadoInicial);
  const [archivo, setArchivo] = useState(null);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [confirmacion, setConfirmacion] = useState(null);
  const inputArchivo = useRef(null);

  if (!oferta || oferta.estado !== "Publicada") {
    return (
      <div className="card tarjeta-vc">
        <div className="card-body text-center py-5">
          <i
            className="bi bi-exclamation-circle d-block display-5 text-secondary mb-3"
            aria-hidden="true"
          />
          <h1 className="h4">Oferta no disponible</h1>
          <p className="text-secondary mb-4">
            La oferta que buscas no existe o ya cerró sus postulaciones.
          </p>
          <Link to="/postular" className="btn btn-marca">
            <i className="bi bi-arrow-left me-1" aria-hidden="true" />
            Ver ofertas disponibles
          </Link>
        </div>
      </div>
    );
  }

  const cambiar = (campo) => (evento) => {
    const valor =
      evento.target.type === "checkbox"
        ? evento.target.checked
        : evento.target.value;
    setDatos((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actual) => ({ ...actual, [campo]: undefined }));
  };

  const adjuntar = (evento) => {
    const adjunto = evento.target.files?.[0];
    if (!adjunto) return;
    setArchivo(adjunto);
    setDatos((actual) => ({
      ...actual,
      curriculum: {
        nombre: adjunto.name,
        tipo: adjunto.type,
        tamano: adjunto.size,
      },
    }));
    setErrores((actual) => ({ ...actual, curriculum: undefined }));
  };

  const quitarArchivo = () => {
    setArchivo(null);
    setDatos((actual) => ({ ...actual, curriculum: null }));
    if (inputArchivo.current) inputArchivo.current.value = "";
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const validados = validarPostulacionPublica(datos, {
      oferta,
      candidatos,
      solicitudes,
    });
    setErrores(validados);
    if (hayErrores(validados)) return;

    setError("");
    setEnviando(true);
    try {
      const resultado = await postularPublico({
        oferta,
        datos,
        archivo,
      });
      setConfirmacion({
        ...resultado,
        nombre: datos.nombre,
        correo: datos.correo,
      });
    } catch (fallo) {
      setError(
        fallo?.message || "No fue posible enviar la postulación. Intenta nuevamente.",
      );
    } finally {
      setEnviando(false);
    }
  };

  if (confirmacion) {
    return (
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8 col-xl-7">
          <div className="card tarjeta-vc text-center">
            <div className="card-body p-4 p-md-5">
              <span
                className="avatar-iniciales mx-auto mb-3"
                style={{ width: "4rem", height: "4rem", fontSize: "1.6rem" }}
                aria-hidden="true"
              >
                <i className="bi bi-check2" />
              </span>
              <h1 className="h3 mb-2">Postulación recibida</h1>
              <p className="text-secondary mb-4">
                Gracias, <strong>{confirmacion.nombre}</strong>. Tu postulación
                a <strong>{oferta.cargo}</strong> quedó registrada.
              </p>

              <div className="alert alert-success text-start">
                <p className="mb-1">
                  <i className="bi bi-hash me-1" aria-hidden="true" />
                  N.° de postulación:{" "}
                  <strong>{confirmacion.folio}</strong>
                </p>
                {confirmacion.carpeta ? (
                  <p className="mb-1 small">
                    <i className="bi bi-folder2-open me-1" aria-hidden="true" />
                    Carpeta de currículum:{" "}
                    <code>{confirmacion.carpeta}</code>
                  </p>
                ) : null}
                <p className="small mb-0">
                  Enviamos la confirmación a {confirmacion.correo}. El equipo de
                  Reclutamiento y Selección revisará tus antecedentes y se
                  contactará contigo si avanzas en el proceso.
                </p>
              </div>

              <div className="d-flex flex-column flex-sm-row justify-content-center gap-2 mt-4">
                <Link to="/postular" className="btn btn-marca">
                  <i className="bi bi-briefcase me-1" aria-hidden="true" />
                  Ver otras ofertas
                </Link>
                <Link to="/" className="btn btn-outline-secondary">
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/postular">
              <i className="bi bi-briefcase me-1" aria-hidden="true" />
              Ofertas
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Postular
          </li>
        </ol>
      </nav>

      <header className="encabezado-pagina mb-4">
        <span className="eyebrow">
          <i className="bi bi-send" aria-hidden="true" />
          Postulación en línea
        </span>
        <h1 className="h3 mb-1">Postula a {oferta.cargo}</h1>
        <p className="text-secondary mb-0">
          Completa tus datos y adjunta tu currículum. Toma menos de 3 minutos.
        </p>
      </header>

      <div className="row g-3">
        <div className="col-12 col-lg-4 order-lg-2">
          <div className="card tarjeta-vc h-100">
            <div className="card-body">
              <h2 className="seccion-titulo">
                <i className="bi bi-briefcase" aria-hidden="true" />
                La oferta
              </h2>
              <h3 className="h5 mb-1">{oferta.cargo}</h3>
              <p className="small text-secondary mb-3">
                {oferta.familia} ·{" "}
                {oferta.departamento ||
                  oferta.unidad ||
                  "Sin departamento"}
              </p>

              <ul className="ficha-datos mb-3">
                <li>
                  <i className="bi bi-geo-alt" aria-hidden="true" />
                  <span>{oferta.ubicacion}</span>
                </li>
                <li>
                  <i className="bi bi-building" aria-hidden="true" />
                  <span>
                    Modalidad {oferta.modalidad || "por confirmar"}
                  </span>
                </li>
                <li>
                  <i className="bi bi-people" aria-hidden="true" />
                  <span>
                    {oferta.vacantes}{" "}
                    {oferta.vacantes === 1 ? "vacante" : "vacantes"}
                  </span>
                </li>
                <li>
                  <i className="bi bi-calendar-event" aria-hidden="true" />
                  <span>Cierre: {formatFecha(oferta.fechaCierre)}</span>
                </li>
              </ul>

              <p className="small text-secondary mb-2">{oferta.descripcion}</p>

              {oferta.funciones ? (
                <>
                  <p className="small text-secondary mb-1 fw-semibold">
                    Funciones
                  </p>
                  <p className="small text-secondary mb-2 texto-preline">
                    {oferta.funciones}
                  </p>
                </>
              ) : null}

              <p className="small text-secondary mb-1 fw-semibold">
                Requisitos
              </p>
              <p className="small text-secondary mb-2 texto-preline">
                {oferta.requisitos}
              </p>

              {oferta.beneficios ? (
                <>
                  <p className="small text-secondary mb-1 fw-semibold">
                    Beneficios
                  </p>
                  <p className="small text-secondary mb-2 texto-preline">
                    {oferta.beneficios}
                  </p>
                </>
              ) : null}

              {oferta.sueldo ? (
                <p className="small mb-0">
                  <i className="bi bi-cash-coin me-1 texto-aqua" aria-hidden="true" />
                  <strong>Sueldo:</strong> {oferta.sueldo}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8 order-lg-1">
          <div className="card tarjeta-vc">
            <div className="card-body">
              <h2 className="seccion-titulo">
                <i className="bi bi-person-lines-fill" aria-hidden="true" />
                Tus datos
              </h2>

              {error ? (
                <div className="alert alert-danger py-2" role="alert">
                  <i className="bi bi-exclamation-circle me-1" aria-hidden="true" />
                  {error}
                </div>
              ) : null}

              <form className="row g-3" noValidate onSubmit={enviar}>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="nombre">
                    Nombre completo <span className="text-danger">*</span>
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    className={`form-control ${errores.nombre ? "is-invalid" : ""}`}
                    value={datos.nombre}
                    onChange={cambiar("nombre")}
                    placeholder="Nombre y apellidos"
                    autoComplete="name"
                    aria-invalid={errores.nombre ? "true" : "false"}
                  />
                  {errores.nombre ? (
                    <div className="invalid-feedback">{errores.nombre}</div>
                  ) : null}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="correo">
                    Correo electrónico <span className="text-danger">*</span>
                  </label>
                  <input
                    id="correo"
                    name="correo"
                    type="email"
                    className={`form-control ${errores.correo ? "is-invalid" : ""}`}
                    value={datos.correo}
                    onChange={cambiar("correo")}
                    placeholder="nombre@correo.cl"
                    autoComplete="email"
                    aria-invalid={errores.correo ? "true" : "false"}
                  />
                  {errores.correo ? (
                    <div className="invalid-feedback">{errores.correo}</div>
                  ) : (
                    <div className="form-text">
                      Si ya postulaste antes, reutilizaremos tus datos.
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="telefono">
                    Teléfono <span className="text-danger">*</span>
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    className={`form-control ${errores.telefono ? "is-invalid" : ""}`}
                    value={datos.telefono}
                    onChange={cambiar("telefono")}
                    placeholder="+56 9 1234 5678"
                    autoComplete="tel"
                    aria-invalid={errores.telefono ? "true" : "false"}
                  />
                  {errores.telefono ? (
                    <div className="invalid-feedback">{errores.telefono}</div>
                  ) : null}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="curriculum">
                    Currículum <span className="text-danger">*</span>
                  </label>
                  <input
                    ref={inputArchivo}
                    id="curriculum"
                    name="curriculum"
                    type="file"
                    className={`visually-hidden ${
                      errores.curriculum ? "is-invalid" : ""
                    }`}
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={adjuntar}
                    aria-invalid={errores.curriculum ? "true" : "false"}
                  />
                  {datos.curriculum ? (
                    <div className="archivo-adjunto">
                      <i
                        className="bi bi-file-earmark-text fs-4 texto-aqua"
                        aria-hidden="true"
                      />
                      <div className="flex-grow-1 min-w-0">
                        <p className="small fw-semibold mb-0 text-truncate">
                          {datos.curriculum.nombre}
                        </p>
                        <p className="small text-secondary mb-0">
                          {formatearTamano(datos.curriculum.tamano)}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={quitarArchivo}
                      >
                        <i className="bi bi-x-lg" aria-hidden="true" />
                        <span className="visually-hidden">Quitar archivo</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="zona-archivo"
                      onClick={() => inputArchivo.current?.click()}
                    >
                      <i
                        className="bi bi-cloud-arrow-up fs-3 texto-aqua"
                        aria-hidden="true"
                      />
                      <span className="small fw-semibold">
                        Adjuntar currículum
                      </span>
                      <span className="small text-secondary">
                        PDF, DOC o DOCX · máximo 5 MB
                      </span>
                    </button>
                  )}
                  {errores.curriculum ? (
                    <div className="text-danger small mt-1">
                      {errores.curriculum}
                    </div>
                  ) : null}
                </div>

                <div className="col-12">
                  <div className="form-check">
                    <input
                      id="consentimiento"
                      name="consentimiento"
                      type="checkbox"
                      className={`form-check-input ${
                        errores.consentimiento ? "is-invalid" : ""
                      }`}
                      checked={datos.consentimiento}
                      onChange={cambiar("consentimiento")}
                      aria-invalid={errores.consentimiento ? "true" : "false"}
                    />
                    <label className="form-check-label small" htmlFor="consentimiento">
                      Autorizo a AquaChile a tratar mis datos personales y
                      currículum exclusivamente para este proceso de selección.
                    </label>
                    {errores.consentimiento ? (
                      <div className="text-danger small mt-1">
                        {errores.consentimiento}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="col-12 d-flex flex-column flex-sm-row gap-2">
                  <button type="submit" className="btn btn-marca" disabled={enviando}>
                    {enviando ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          aria-hidden="true"
                        />
                        Enviando…
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-1" aria-hidden="true" />
                        Enviar postulación
                      </>
                    )}
                  </button>
                  <Link to="/postular" className="btn btn-outline-secondary">
                    <i className="bi bi-arrow-left me-1" aria-hidden="true" />
                    Volver a las ofertas
                  </Link>
                </div>
              </form>

              {!usaApi ? (
                <p className="small text-secondary mt-3 mb-0">
                  <i className="bi bi-info-circle me-1" aria-hidden="true" />
                  Modo demostración: la postulación se guarda solo en esta
                  sesión del navegador.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
