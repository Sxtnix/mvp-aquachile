import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import {
  ESTADOS_SOLICITUD,
  FAMILIAS_CARGO,
  RESPONSABLES,
} from "../data/catalogos.js";
import { solicitudesFiltradas } from "../utils/selectores.js";
import { formatFecha } from "../utils/fechas.js";
import BarraFiltros from "./BarraFiltros.jsx";
import BuscadorExpandible from "./BuscadorExpandible.jsx";
import EtiquetaEstado from "./EtiquetaEstado.jsx";

export default function BandejaSolicitudes({
  solicitudes,
  titulo = "Solicitudes",
  mostrarBotonNuevo = true,
  mostrarResponsable = true,
  filaVacia = "No hay solicitudes que coincidan con los filtros.",
}) {
  const { obtenerCandidato, puede } = useApp();
  const [filtros, setFiltros] = useState({
    texto: "",
    estado: "",
    familia: "",
    responsable: "",
    desde: "",
    hasta: "",
  });

  const cambiar = (campo) => (evento) =>
    setFiltros((actual) => ({ ...actual, [campo]: evento.target.value }));

  const filtradas = solicitudesFiltradas(solicitudes, filtros, obtenerCandidato);
  const hayFiltros = Object.values(filtros).some(Boolean);

  return (
    <section className="mt-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
        <div>
          <h2 className="h4 mb-1">
            <i className="bi bi-inbox texto-aqua me-2" aria-hidden="true" />
            {titulo}
          </h2>
          <p className="small text-secondary mb-0">
            {filtradas.length} de {solicitudes.length} solicitudes
            {hayFiltros ? " según los filtros aplicados" : " registradas"}
          </p>
        </div>

        {mostrarBotonNuevo && puede("crearSolicitud") ? (
          <Link to="/solicitudes/nueva" className="btn btn-marca">
            <i className="bi bi-plus-lg me-1" aria-hidden="true" />
            Nueva solicitud
          </Link>
        ) : null}
      </div>

      <BarraFiltros
        resumen={
          <>
            <i className="bi bi-inbox me-1" aria-hidden="true" />
            {filtradas.length} de {solicitudes.length} solicitudes
            {hayFiltros ? " con filtros aplicados" : " registradas"}
          </>
        }
        hayFiltros={hayFiltros}
        alLimpiar={() =>
          setFiltros({
            texto: "",
            estado: "",
            familia: "",
            responsable: "",
            desde: "",
            hasta: "",
          })
        }
        etiqueta="Filtros de solicitudes"
      >
        <BuscadorExpandible
          id="bandeja-texto"
          etiqueta="Buscar candidato o cargo"
          placeholder="Buscar candidato o cargo…"
          valor={filtros.texto}
          alCambiar={cambiar("texto")}
          alLimpiar={() =>
            setFiltros((actual) => ({ ...actual, texto: "" }))
          }
        />

        <div className="barra-filtros-campo">
          <label className="visually-hidden" htmlFor="bandeja-estado">
            Estado
          </label>
          <select
            id="bandeja-estado"
            className="form-select"
            value={filtros.estado}
            onChange={cambiar("estado")}
          >
            <option value="">Todos los estados</option>
            {ESTADOS_SOLICITUD.map((opcion) => (
              <option key={opcion}>{opcion}</option>
            ))}
          </select>
        </div>

        <div className="barra-filtros-campo">
          <label className="visually-hidden" htmlFor="bandeja-familia">
            Familia
          </label>
          <select
            id="bandeja-familia"
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

        {mostrarResponsable ? (
          <div className="barra-filtros-campo">
            <label className="visually-hidden" htmlFor="bandeja-responsable">
              Responsable
            </label>
            <select
              id="bandeja-responsable"
              className="form-select"
              value={filtros.responsable}
              onChange={cambiar("responsable")}
            >
              <option value="">Todos los responsables</option>
              {RESPONSABLES.map((opcion) => (
                <option key={opcion}>{opcion}</option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="barra-filtros-fechas">
          <div className="barra-filtros-campo">
            <label className="visually-hidden" htmlFor="bandeja-desde">
              Desde
            </label>
            <input
              id="bandeja-desde"
              type="date"
              className="form-control"
              value={filtros.desde}
              onChange={cambiar("desde")}
              aria-label="Fecha de solicitud desde"
            />
          </div>

          <div className="barra-filtros-campo">
            <label className="visually-hidden" htmlFor="bandeja-hasta">
              Hasta
            </label>
            <input
              id="bandeja-hasta"
              type="date"
              className="form-control"
              value={filtros.hasta}
              onChange={cambiar("hasta")}
              aria-label="Fecha de solicitud hasta"
            />
          </div>
        </div>
      </BarraFiltros>

      <div className="tabla-contenedor">
        <div className="table-responsive">
          <table className="table table-hover align-middle tabla-vc">
            <thead>
              <tr>
                <th>Candidato</th>
                <th>Cargo</th>
                <th>Estado</th>
                <th className="d-none d-md-table-cell">Solicitud</th>
                {mostrarResponsable ? (
                  <th className="d-none d-lg-table-cell">Responsable</th>
                ) : null}
                <th className="text-end text-nowrap">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td
                    colSpan={mostrarResponsable ? 6 : 5}
                    className="text-center text-secondary py-5"
                  >
                    <i
                      className="bi bi-search d-block fs-3 mb-2 texto-aqua"
                      aria-hidden="true"
                    />
                    {filaVacia}
                  </td>
                </tr>
              ) : (
                filtradas.map((solicitud) => {
                  const candidato = obtenerCandidato(solicitud.candidatoId);
                  return (
                    <tr key={solicitud.id}>
                      <td>
                        <span className="fw-semibold">
                          {candidato ? candidato.nombre : "Sin candidato"}
                        </span>
                        {candidato ? (
                          <span className="d-block small text-secondary">
                            {candidato.ubicacion}
                          </span>
                        ) : null}
                      </td>
                      <td>{solicitud.cargo}</td>
                      <td>
                        <EtiquetaEstado estado={solicitud.estado} />
                      </td>
                      <td className="d-none d-md-table-cell small text-secondary">
                        {formatFecha(solicitud.fechaSolicitud)}
                      </td>
                      {mostrarResponsable ? (
                        <td className="d-none d-lg-table-cell small">
                          {solicitud.responsable}
                        </td>
                      ) : null}
                      <td className="text-end text-nowrap">
                        <Link
                          to={`/solicitudes/${solicitud.id}`}
                          className="btn btn-sm btn-outline-marca"
                        >
                          <i className="bi bi-eye me-1" aria-hidden="true" />
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
