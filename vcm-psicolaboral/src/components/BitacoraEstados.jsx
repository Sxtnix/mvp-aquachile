import { formatFecha } from "../utils/fechas.js";
import EtiquetaEstado from "./EtiquetaEstado.jsx";

export default function BitacoraEstados({ registros }) {
  if (!registros || registros.length === 0) {
    return (
      <p className="text-secondary small mb-0">
        Todavía no hay cambios de estado registrados.
      </p>
    );
  }

  return (
    <ol className="list-group list-group-flush mb-0">
      {[...registros].reverse().map((registro) => (
        <li
          key={registro.id}
          className="list-group-item d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-1 px-0"
        >
          <div className="d-flex align-items-center gap-2">
            <EtiquetaEstado estado={registro.estadoNuevo} />
            {registro.estadoAnterior ? (
              <span className="small text-secondary">
                desde {registro.estadoAnterior}
              </span>
            ) : (
              <span className="small text-secondary">creación</span>
            )}
          </div>
          <span className="small text-secondary">
            {formatFecha(registro.fecha)} · {registro.responsable}
          </span>
        </li>
      ))}
    </ol>
  );
}
