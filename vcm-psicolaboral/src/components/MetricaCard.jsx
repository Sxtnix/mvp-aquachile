export default function MetricaCard({ titulo, valor, detalle, variante }) {
  return (
    <div className="col-12 col-sm-6 col-xl-3">
      <div className="card card-altura shadow-sm border-0 h-100">
        <div className="card-body">
          <p className="text-secondary small text-uppercase mb-1">{titulo}</p>
          <p className={`display-6 fw-semibold mb-1 ${variante}`}>{valor}</p>
          {detalle ? (
            <p className="small text-secondary mb-0">{detalle}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
