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

  return (
    <section className="mt-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
        <h2 className="h4 mb-0">{titulo}</h2>

        {mostrarBotonNuevo && puede("crearSolicitud") ? (
          <Link to="/solicitudes/nueva" className="btn btn-marca">
            Nueva solicitud
          </Link>
        ) : null}
      </div>

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-4">
          <label className="visually-hidden" htmlFor="bandeja-texto">
            Buscar candidato o cargo
          </label>
          <input
            id="bandeja-texto"
            className="form-control"
            placeholder="Buscar candidato o cargo..."
            value={filtros.texto}
            onChange={cambiar("texto")}
          />
        </div>

        <div className="col-6 col-md-2">
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

        <div className="col-6 col-md-2">
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
          <div className="col-6 col-md-2">
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

        <div className="col-6 col-md-1">
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

        <div className="col-6 col-md-1">
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

      <div className="table-responsive">
        <table className="table table-hover align-middle">
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
                  className="text-center text-secondary py-4"
                >
                  {filaVacia}
                </td>
              </tr>
            ) : (
              filtradas.map((solicitud) => {
                const candidato = obtenerCandidato(solicitud.candidatoId);
                return (
                  <tr key={solicitud.id}>
                    <td>{candidato ? candidato.nombre : "Sin candidato"}</td>
                    <td>{solicitud.cargo}</td>
                    <td>
                      <EtiquetaEstado estado={solicitud.estado} />
                    </td>
                    <td className="d-none d-md-table-cell">
                      {formatFecha(solicitud.fechaSolicitud)}
                    </td>
                    {mostrarResponsable ? (
                      <td className="d-none d-lg-table-cell">
                        {solicitud.responsable}
                      </td>
                    ) : null}
                    <td className="text-end text-nowrap">
                      <Link
                        to={`/solicitudes/${solicitud.id}`}
                        className="btn btn-sm btn-outline-secondary"
                      >
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
    </section>
  );
}
