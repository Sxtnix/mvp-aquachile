import { useState } from "react";
import { Link } from "react-router-dom";
import BarraFiltros from "../components/BarraFiltros.jsx";
import BuscadorExpandible from "../components/BuscadorExpandible.jsx";
import EtiquetaEstado from "../components/EtiquetaEstado.jsx";
import { ESTADOS_OFERTA, FAMILIAS_CARGO } from "../data/catalogos.js";
import { useApp } from "../context/AppContext.jsx";
import { formatFecha } from "../utils/fechas.js";
import {
  ofertaVigente,
  postulacionesDeOferta,
  resumenPortal,
} from "../utils/selectores.js";

export default function OfertasPage() {
  const { ofertas, solicitudes, puede, dispatch } = useApp();
  const [filtros, setFiltros] = useState({
    texto: "",
    familia: "",
    estado: "",
  });

  const resumen = resumenPortal(ofertas, solicitudes);
  const consulta = filtros.texto.trim().toLowerCase();
  const visibles = ofertas.filter((oferta) => {
    const coincideTexto =
      !consulta ||
      `${oferta.cargo} ${oferta.ubicacion} ${
        oferta.departamento || oferta.unidad || ""
      }`
        .toLowerCase()
        .includes(consulta);
    const coincideFamilia =
      !filtros.familia || oferta.familia === filtros.familia;
    const coincideEstado = !filtros.estado || oferta.estado === filtros.estado;
    return coincideTexto && coincideFamilia && coincideEstado;
  });
  const hayFiltros = Object.values(filtros).some(Boolean);

  const cambiar = (campo) => (evento) =>
    setFiltros((actual) => ({ ...actual, [campo]: evento.target.value }));

  const alternarEstado = (oferta) => {
    dispatch({
      type: "cambiar-estado-oferta",
      id: oferta.id,
      estado: oferta.estado === "Publicada" ? "Cerrada" : "Publicada",
    });
  };

  return (
    <>
      <header className="encabezado-pagina mb-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <span className="eyebrow">
              <i className="bi bi-broadcast" aria-hidden="true" />
              Reclutamiento
            </span>
            <h1 className="h3 mb-1">Ofertas laborales</h1>
            <p className="text-secondary mb-0">
              Publica vacantes y recibe postulaciones desde el portal público.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Link
              to="/postular"
              className="btn btn-outline-secondary"
              target="_blank"
              rel="noreferrer"
            >
              <i className="bi bi-box-arrow-up-right me-1" aria-hidden="true" />
              Ver portal público
            </Link>
            {puede("gestionarOfertas") ? (
              <Link to="/ofertas/nueva" className="btn btn-marca">
                <i className="bi bi-plus-lg me-1" aria-hidden="true" />
                Publicar oferta
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-4">
          <div className="kpi-card" style={{ "--kpi-color": "#0a7ba4", "--kpi-suave": "rgba(10,123,164,0.12)" }}>
            <div className="kpi-cabecera">
              <p className="kpi-titulo">Ofertas publicadas</p>
              <span className="kpi-icono" aria-hidden="true">
                <i className="bi bi-broadcast" />
              </span>
            </div>
            <p className="kpi-valor">{resumen.ofertas}</p>
            <p className="kpi-detalle">Visibles en el portal</p>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          <div className="kpi-card" style={{ "--kpi-color": "#17a7c4", "--kpi-suave": "rgba(23,167,196,0.14)" }}>
            <div className="kpi-cabecera">
              <p className="kpi-titulo">Vacantes disponibles</p>
              <span className="kpi-icono" aria-hidden="true">
                <i className="bi bi-briefcase" />
              </span>
            </div>
            <p className="kpi-valor">{resumen.vacantes}</p>
            <p className="kpi-detalle">En ofertas abiertas</p>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          <div className="kpi-card" style={{ "--kpi-color": "#1f9d6b", "--kpi-suave": "rgba(31,157,107,0.14)" }}>
            <div className="kpi-cabecera">
              <p className="kpi-titulo">Postulaciones</p>
              <span className="kpi-icono" aria-hidden="true">
                <i className="bi bi-people" />
              </span>
            </div>
            <p className="kpi-valor">{resumen.postulaciones}</p>
            <p className="kpi-detalle">Recibidas desde el portal</p>
          </div>
        </div>
      </div>

      <BarraFiltros
        resumen={
          <>
            <i className="bi bi-broadcast me-1" aria-hidden="true" />
            {visibles.length} de {ofertas.length} ofertas
          </>
        }
        hayFiltros={hayFiltros}
        alLimpiar={() => setFiltros({ texto: "", familia: "", estado: "" })}
        etiqueta="Filtros de ofertas"
      >
        <BuscadorExpandible
          id="ofertas-texto"
          etiqueta="Buscar oferta"
          placeholder="Buscar por cargo, planta o departamento…"
          valor={filtros.texto}
          alCambiar={cambiar("texto")}
          alLimpiar={() =>
            setFiltros((actual) => ({ ...actual, texto: "" }))
          }
        />

        <div className="barra-filtros-campo">
          <label className="visually-hidden" htmlFor="ofertas-familia">
            Familia de cargo
          </label>
          <select
            id="ofertas-familia"
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

        <div className="barra-filtros-campo">
          <label className="visually-hidden" htmlFor="ofertas-estado">
            Estado de la oferta
          </label>
          <select
            id="ofertas-estado"
            className="form-select"
            value={filtros.estado}
            onChange={cambiar("estado")}
          >
            <option value="">Todos los estados</option>
            {ESTADOS_OFERTA.map((opcion) => (
              <option key={opcion}>{opcion}</option>
            ))}
          </select>
        </div>
      </BarraFiltros>

      {visibles.length === 0 ? (
        <div className="alert alert-secondary d-flex align-items-center gap-2">
          <i className="bi bi-inbox" aria-hidden="true" />
          No hay ofertas que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="row g-3">
          {visibles.map((oferta) => {
            const totalPostulaciones = postulacionesDeOferta(
              solicitudes,
              oferta.id
            ).length;
            const vigente = ofertaVigente(oferta);

            return (
              <div className="col-12 col-xl-6" key={oferta.id}>
                <article className="card tarjeta-vc h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <div>
                        <h2 className="h5 mb-1">{oferta.cargo}</h2>
                        <p className="small text-secondary mb-0">
                          {oferta.familia} ·{" "}
                          {oferta.departamento || oferta.unidad || "Sin departamento"}
                        </p>
                      </div>
                      <div className="d-flex flex-column align-items-end gap-1">
                        <EtiquetaEstado estado={oferta.estado} />
                        {!vigente && oferta.estado === "Publicada" ? (
                          <span className="badge-vc estado-pendiente">
                            <i className="bi bi-alarm" aria-hidden="true" />
                            Cierre vencido
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <ul className="oferta-meta mb-3">
                      <li>
                        <i className="bi bi-geo-alt" aria-hidden="true" />
                        {oferta.ubicacion}
                      </li>
                      <li>
                        <i className="bi bi-people" aria-hidden="true" />
                        {oferta.vacantes}{" "}
                        {oferta.vacantes === 1 ? "vacante" : "vacantes"}
                      </li>
                      <li>
                        <i className="bi bi-calendar-event" aria-hidden="true" />
                        Cierra {formatFecha(oferta.fechaCierre)}
                      </li>
                      <li>
                        <i className="bi bi-person-badge" aria-hidden="true" />
                        {oferta.responsable}
                      </li>
                    </ul>

                    <p className="small text-secondary oferta-descripcion mb-3">
                      {oferta.descripcion}
                    </p>

                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-3 border-top">
                      <span className="contador-postulaciones">
                        <i className="bi bi-inbox" aria-hidden="true" />
                        {totalPostulaciones}{" "}
                        {totalPostulaciones === 1
                          ? "postulación"
                          : "postulaciones"}
                      </span>

                      <div className="d-flex flex-wrap gap-2">
                        {puede("gestionarOfertas") ? (
                          <>
                            <Link
                              to={`/ofertas/${oferta.id}`}
                              className="btn btn-sm btn-outline-marca"
                            >
                              <i className="bi bi-pencil me-1" aria-hidden="true" />
                              Editar
                            </Link>
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                oferta.estado === "Publicada"
                                  ? "btn-outline-danger"
                                  : "btn-outline-secondary"
                              }`}
                              onClick={() => alternarEstado(oferta)}
                            >
                              <i
                                className={`bi ${
                                  oferta.estado === "Publicada"
                                    ? "bi-lock"
                                    : "bi-broadcast"
                                } me-1`}
                                aria-hidden="true"
                              />
                              {oferta.estado === "Publicada"
                                ? "Cerrar"
                                : "Publicar"}
                            </button>
                          </>
                        ) : (
                          <span className="small text-secondary">
                            <i className="bi bi-eye me-1" aria-hidden="true" />
                            Solo consulta
                          </span>
                        )}
                      </div>
                    </div>
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
