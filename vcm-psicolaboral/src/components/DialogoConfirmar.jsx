export default function DialogoConfirmar({
  abierto,
  titulo,
  mensaje,
  etiquetaConfirmar = "Confirmar",
  alConfirmar,
  alCancelar,
}) {
  if (!abierto) return null;

  return (
    <div
      className="modal d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialogo-titulo"
      aria-describedby="dialogo-mensaje"
      style={{ backgroundColor: "rgba(4, 50, 77, 0.55)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <h2
              className="modal-title h5 d-flex align-items-center gap-2"
              id="dialogo-titulo"
            >
              <span className="text-danger" aria-hidden="true">
                <i className="bi bi-exclamation-triangle-fill" />
              </span>
              {titulo}
            </h2>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar"
              onClick={alCancelar}
            />
          </div>
          <div className="modal-body text-secondary" id="dialogo-mensaje">
            {mensaje}
          </div>
          <div className="modal-footer border-0 pt-0">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={alCancelar}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={alConfirmar}
            >
              <i className="bi bi-trash me-1" aria-hidden="true" />
              {etiquetaConfirmar}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
