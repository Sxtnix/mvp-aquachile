import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { ESTADOS_SOLICITUD } from "../data/datosFicticios.js";
import BadgeEstado from "./BadgeEstado.jsx";

export default function SolicitudesPanel({
  solicitudes,
  titulo = "Solicitudes recientes",
  mostrarBotonNuevo = true,
  filaVacia = "No hay solicitudes para mostrar.",
}) {
  const { obtenerCandidato, puede } = useApp();
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("Todos los estados");

  const filtradas = solicitudes.filter((solicitud) => {
    const candidato = obtenerCandidato(solicitud.candidatoId);
    const coincideBusqueda = `${candidato?.nombre ?? ""} ${solicitud.cargo}`
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase());
    const coincideEstado =
      estado === "Todos los estados" || solicitud.estado === estado;
    return coincideBusqueda && coincideEstado;
  });

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
        <div className="col-12 col-md-8">
          <label className="visually-hidden" htmlFor="buscar-solicitud">
            Buscar candidato
          </label>
          <input
            id="buscar-solicitud"
            className="form-control"
            placeholder="Buscar candidato..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </div>

        <div className="col-12 col-md-4">
          <label className="visually-hidden" htmlFor="filtrar-estado">
            Filtrar por estado
          </label>
          <select
            id="filtrar-estado"
            className="form-select"
            value={estado}
            onChange={(evento) => setEstado(evento.target.value)}
          >
            <option>Todos los estados</option>
            {ESTADOS_SOLICITUD.map((opcion) => (
              <option key={opcion}>{opcion}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Candidato</th>
              <th>Cargo</th>
              <th>Estado</th>
              <th className="d-none d-md-table-cell">Fecha</th>
              <th className="d-none d-lg-table-cell">Responsable</th>
              <th className="text-end text-nowrap">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-secondary py-4">
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
                      <BadgeEstado estado={solicitud.estado} />
                    </td>
                    <td className="d-none d-md-table-cell">
                      {solicitud.fechaSolicitud}
                    </td>
                    <td className="d-none d-lg-table-cell">
                      {solicitud.responsable}
                    </td>
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
