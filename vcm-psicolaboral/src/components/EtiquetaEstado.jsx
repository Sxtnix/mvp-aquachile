export default function EtiquetaEstado({ estado }) {
  const variantes = {
    Pendiente: { clase: "estado-pendiente", icono: "bi-hourglass-split" },
    "En proceso": { clase: "estado-en-proceso", icono: "bi-arrow-repeat" },
    Finalizada: { clase: "estado-finalizada", icono: "bi-check-circle-fill" },
    Aprobada: { clase: "estado-aprobado", icono: "bi-patch-check-fill" },
    Rechazada: { clase: "estado-rechazado", icono: "bi-x-circle-fill" },
    "Sin solicitud": { clase: "estado-sin-solicitud", icono: "bi-dash-circle" },
    Publicada: { clase: "estado-publicada", icono: "bi-broadcast" },
    Cerrada: { clase: "estado-cerrada", icono: "bi-lock" },
  };

  const variante = variantes[estado] || {
    clase: "estado-sin-solicitud",
    icono: "bi-circle",
  };

  return (
    <span className={`badge-vc ${variante.clase}`}>
      <i className={`bi ${variante.icono}`} aria-hidden="true" />
      {estado}
    </span>
  );
}
