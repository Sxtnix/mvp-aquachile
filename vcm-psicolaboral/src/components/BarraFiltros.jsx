/**
 * Contenedor de filtros alineados en una sola fila, con resumen y acción de
 * limpieza. En pantallas pequeñas los campos se apilan sin dejar huecos.
 */
export default function BarraFiltros({
  children,
  resumen,
  hayFiltros = false,
  alLimpiar,
  etiqueta = "Filtros de la tabla",
}) {
  return (
    <section className="barra-filtros" aria-label={etiqueta}>
      <div className="barra-filtros-campos">{children}</div>
      {resumen || (hayFiltros && alLimpiar) ? (
        <div className="barra-filtros-pie">
          {resumen ? (
            <span className="barra-filtros-resumen">{resumen}</span>
          ) : (
            <span />
          )}
          {hayFiltros && alLimpiar ? (
            <button
              type="button"
              className="btn btn-sm btn-link text-decoration-none barra-filtros-limpiar"
              onClick={alLimpiar}
            >
              <i className="bi bi-x-circle me-1" aria-hidden="true" />
              Limpiar filtros
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
