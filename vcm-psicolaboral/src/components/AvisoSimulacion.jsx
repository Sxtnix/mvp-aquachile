import { useApp } from "../context/AppContext.jsx";

export default function AvisoSimulacion() {
  const { usaApi } = useApp();

  return (
    <div
      className="aviso-contexto mb-4"
      role="status"
    >
      <i className="bi bi-info-circle-fill" aria-hidden="true" />
      <span>
        {usaApi ? (
          <>
            <strong className="fw-semibold">Backend local conectado:</strong>{" "}
            los datos se guardan de forma persistente y se comparten entre
            usuarios autorizados.
          </>
        ) : (
          <>
            <strong className="fw-semibold">Entorno de demostración:</strong>{" "}
            los datos son ficticios y se guardan solo en memoria. Al recargar la
            página se restablecen.
          </>
        )}
      </span>
    </div>
  );
}
