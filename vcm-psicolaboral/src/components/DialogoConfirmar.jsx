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
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title h6" id="dialogo-titulo">
              {titulo}
            </h2>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar"
              onClick={alCancelar}
            />
          </div>
          <div className="modal-body">{mensaje}</div>
          <div className="modal-footer">
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
              {etiquetaConfirmar}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
