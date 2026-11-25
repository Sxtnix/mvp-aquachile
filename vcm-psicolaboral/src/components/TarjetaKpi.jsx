const PALETAS = {
  azul: { color: "#0a7ba4", suave: "rgba(10, 123, 164, 0.12)" },
  aqua: { color: "#17a7c4", suave: "rgba(23, 167, 196, 0.14)" },
  verde: { color: "#1f9d6b", suave: "rgba(31, 157, 107, 0.14)" },
  ambar: { color: "#c97a00", suave: "rgba(201, 122, 0, 0.14)" },
  rojo: { color: "#c0392b", suave: "rgba(192, 57, 43, 0.12)" },
};

export default function TarjetaKpi({
  titulo,
  valor,
  detalle,
  icono = "bi-bar-chart-line",
  color = "azul",
  tendencia,
}) {
  const paleta = PALETAS[color] || PALETAS.azul;

  return (
    <div className="col-12 col-sm-6 col-xl-3">
      <article
        className="kpi-card"
        style={{
          "--kpi-color": paleta.color,
          "--kpi-suave": paleta.suave,
        }}
      >
        <div className="kpi-cabecera">
          <p className="kpi-titulo">{titulo}</p>
          <span className="kpi-icono" aria-hidden="true">
            <i className={`bi ${icono}`} />
          </span>
        </div>
        <p className="kpi-valor">{valor}</p>
        {detalle ? <p className="kpi-detalle">{detalle}</p> : null}
        {tendencia ? (
          <span className="kpi-tendencia">
            <i className="bi bi-graph-up-arrow" aria-hidden="true" />
            {tendencia}
          </span>
        ) : null}
      </article>
    </div>
  );
}
