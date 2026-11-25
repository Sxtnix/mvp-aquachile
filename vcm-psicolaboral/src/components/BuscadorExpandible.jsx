/**
 * Buscador que se expande al recibir el foco para aprovechar el espacio
 * disponible en las tablas y barras de filtros.
 */
export default function BuscadorExpandible({
  id,
  etiqueta,
  placeholder,
  valor,
  alCambiar,
  alLimpiar,
}) {
  return (
    <div className="buscador-expandible">
      <label className="visually-hidden" htmlFor={id}>
        {etiqueta}
      </label>
      <i
        className="bi bi-search buscador-expandible-icono"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        className="form-control"
        placeholder={placeholder}
        value={valor}
        onChange={alCambiar}
        autoComplete="off"
      />
      {valor && alLimpiar ? (
        <button
          type="button"
          className="buscador-expandible-limpiar"
          onClick={alLimpiar}
          aria-label={`Limpiar ${etiqueta.toLowerCase()}`}
        >
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
