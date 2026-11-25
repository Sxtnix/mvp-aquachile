import { useState } from "react";
import { Link } from "react-router-dom";
import BarraFiltros from "../components/BarraFiltros.jsx";
import BuscadorExpandible from "../components/BuscadorExpandible.jsx";
import EtiquetaEstado from "../components/EtiquetaEstado.jsx";
import { FAMILIAS_CARGO } from "../data/catalogos.js";
import { useApp } from "../context/AppContext.jsx";
import { diasEntre, formatFecha, hoyISO } from "../utils/fechas.js";
import { ofertasFiltradas, resumenPortal } from "../utils/selectores.js";

export default function PortalOfertasPage() {
  const { ofertas, solicitudes } = useApp();
  const [filtros, setFiltros] = useState({ texto: "", familia: "" });

  const visibles = ofertasFiltradas(ofertas, filtros);
  const resumen = resumenPortal(ofertas, solicitudes);
  const hayFiltros = Boolean(filtros.texto || filtros.familia);

  const cambiar = (campo) => (evento) =>
    setFiltros((actual) => ({ ...actual, [campo]: evento.target.value }));

  const diasParaCierre = (fecha) => {
    const dias = diasEntre(hoyISO(), fecha);
    return dias;
  };

  return (
    <>
      <section className="portal-hero mb-4">
        <div className="row align-items-center g-4">
          <div className="col-12 col-lg-7">
            <span className="eyebrow text-white-50">
              <i className="bi bi-water" aria-hidden="true" />
              Oportunidades en AquaChile
            </span>
            <h1 className="display-5 fw-bold text-white mb-2">
              Postula en línea, sin filas ni papeles
            </h1>
            <p className="lead text-white-50 mb-4">
              Revisa las ofertas publicadas, completa tus datos y adjunta tu
              currículum. Tu postulación llega directo al equipo de
              Reclutamiento y Selección.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge-vc estado-publicada">
                <i className="bi bi-broadcast" aria-hidden="true" />
                {resumen.ofertas} ofertas publicadas
              </span>
              <span className="badge-vc estado-en-proceso">
                <i className="bi bi-briefcase" aria-hidden="true" />
                {resumen.vacantes} vacantes disponibles
              </span>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="portal-hero-panel">
              <p className="small text-uppercase text-white-50 mb-2">
                ¿Cómo postular?
              </p>
              <ol className="portal-pasos mb-0">
                <li>
                  <span>1</span> Elige la oferta que calce con tu perfil.
                </li>
                <li>
                  <span>2</span> Completa tus datos y adjunta tu currículum.
                </li>
                <li>
                  <span>3</span> Recibe la confirmación de tu postulación.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <BarraFiltros
        resumen={
          <>
            <i className="bi bi-briefcase me-1" aria-hidden="true" />
            {visibles.length} de {resumen.ofertas} ofertas abiertas
          </>
        }
        hayFiltros={hayFiltros}
        alLimpiar={() => setFiltros({ texto: "", familia: "" })}
        etiqueta="Filtros del portal de ofertas"
      >
        <BuscadorExpandible
          id="portal-texto"
          etiqueta="Buscar oferta"
          placeholder="Buscar por cargo, planta o departamento…"
          valor={filtros.texto}
          alCambiar={cambiar("texto")}
          alLimpiar={() =>
            setFiltros((actual) => ({ ...actual, texto: "" }))
          }
        />

        <div className="barra-filtros-campo">
          <label className="visually-hidden" htmlFor="portal-familia">
            Familia de cargo
          </label>
          <select
            id="portal-familia"
            className="form-select"
            value={filtros.familia}
            onChange={cambiar("familia")}
          >
            <option value="">Todas las familias</option>
            {FAMILIAS_CARGO.map((opcion) => (
              <option key={opcion}>{opcion}</option>
            ))}
          </select>
        </div>
      </BarraFiltros>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
        <div>
          <h2 className="h4 mb-1">
            <i className="bi bi-briefcase texto-aqua me-2" aria-hidden="true" />
            Ofertas disponibles
          </h2>
          <p className="small text-secondary mb-0">
            {visibles.length} de {resumen.ofertas} ofertas abiertas
          </p>
        </div>
      </div>

      {visibles.length === 0 ? (
        <div className="card tarjeta-vc">
          <div className="card-body text-center py-5">
            <i
              className="bi bi-inbox d-block display-5 text-secondary mb-3"
              aria-hidden="true"
            />
            <h3 className="h5">No hay ofertas que coincidan</h3>
            <p className="text-secondary mb-3">
              Prueba con otro cargo o revisa nuevamente más adelante.
            </p>
            {hayFiltros ? (
              <button
                type="button"
                className="btn btn-sm btn-outline-marca"
                onClick={() => setFiltros({ texto: "", familia: "" })}
              >
                Ver todas las ofertas
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {visibles.map((oferta) => {
            const dias = diasParaCierre(oferta.fechaCierre);
            const porCerrar = dias !== null && dias >= 0 && dias <= 7;

            return (
              <div className="col-12 col-md-6 col-xl-4" key={oferta.id}>
                <article className="card tarjeta-vc h-100 oferta-card">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <span className="kpi-icono" aria-hidden="true">
                        <i className="bi bi-briefcase" />
                      </span>
                      <EtiquetaEstado estado={oferta.estado} />
                    </div>

                    <h3 className="h5 mb-1">{oferta.cargo}</h3>
                    <p className="small text-secondary mb-3">
                      <i className="bi bi-diagram-3 me-1 texto-aqua" aria-hidden="true" />
                      {oferta.familia}
                    </p>

                    <ul className="ficha-datos mb-3">
                      <li>
                        <i className="bi bi-geo-alt" aria-hidden="true" />
                        <span>{oferta.ubicacion}</span>
                      </li>
                      <li>
                        <i className="bi bi-building" aria-hidden="true" />
                        <span>
                          {oferta.departamento ||
                            oferta.unidad ||
                            "Sin departamento"}
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
                        <span>Cierra el {formatFecha(oferta.fechaCierre)}</span>
                      </li>
                    </ul>

                    <p className="small text-secondary oferta-descripcion mb-3">
                      {oferta.descripcion}
                    </p>

                    {porCerrar ? (
                      <p className="small fw-semibold text-warning-emphasis mb-2">
                        <i className="bi bi-alarm me-1" aria-hidden="true" />
                        Cierre próximo
                      </p>
                    ) : null}

                    <Link
                      to={`/postular/${oferta.id}`}
                      className="btn btn-marca mt-auto"
                    >
                      Postular a esta oferta
                      <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
