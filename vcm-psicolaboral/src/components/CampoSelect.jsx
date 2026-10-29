export default function CampoSelect({
  id,
  etiqueta,
  valor,
  alCambiar,
  opciones,
  placeholder = "Seleccione una opción",
  error,
  deshabilitado = false,
  requerido = false,
}) {
  return (
    <div className="col-12 col-md-6">
      <label className="form-label" htmlFor={id}>
        {etiqueta}
        {requerido ? <span className="text-danger"> *</span> : null}
      </label>
      <select
        id={id}
        name={id}
        className={`form-select ${error ? "is-invalid" : ""}`}
        value={valor}
        onChange={alCambiar}
        disabled={deshabilitado}
        required={requerido}
        aria-invalid={error ? "true" : "false"}
      >
        <option value="">{placeholder}</option>
        {opciones.map((opcion) => {
          const clave = typeof opcion === "string" ? opcion : opcion.valor;
          const texto = typeof opcion === "string" ? opcion : opcion.texto;
          return (
            <option key={clave} value={clave}>
              {texto}
            </option>
          );
        })}
      </select>
      {error ? <div className="invalid-feedback">{error}</div> : null}
    </div>
  );
}
