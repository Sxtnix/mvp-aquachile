export default function AvisoSimulacion() {
  return (
    <div className="alert alert-info d-flex align-items-start gap-2 py-2 small mb-4" role="status">
      <span aria-hidden="true">ℹ️</span>
      <span>
        Entorno de demostración: los datos son ficticios y se guardan solo en
        memoria. Al recargar la página se restablecen.
      </span>
    </div>
  );
}
