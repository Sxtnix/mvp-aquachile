import { formatFecha } from "../utils/fechas.js";
import EtiquetaEstado from "./EtiquetaEstado.jsx";

export default function BitacoraEstados({ registros }) {
  if (!registros || registros.length === 0) {
    return (
      <p className="text-secondary small mb-0">
        <i className="bi bi-clock me-1" aria-hidden="true" />
        Todavía no hay cambios de estado registrados.
      </p>
    );
  }

  return (
    <ol className="bitacora mb-0">
      {[...registros].reverse().map((registro) => (
        <li key={registro.id} className="bitacora-item">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <EtiquetaEstado estado={registro.estadoNuevo} />
            {registro.estadoAnterior ? (
              <span className="small text-secondary">
                <i className="bi bi-arrow-left-right me-1" aria-hidden="true" />
                desde {registro.estadoAnterior}
              </span>
            ) : (
              <span className="small text-secondary">
                <i className="bi bi-stars me-1" aria-hidden="true" />
                creación de la solicitud
              </span>
            )}
          </div>
          <span className="bitacora-meta">
            <i className="bi bi-calendar3 me-1" aria-hidden="true" />
            {formatFecha(registro.fecha)}
            <span className="mx-1">·</span>
            <i className="bi bi-person me-1" aria-hidden="true" />
            {registro.responsable}
          </span>
        </li>
      ))}
    </ol>
  );
}
