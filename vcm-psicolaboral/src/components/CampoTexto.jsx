export default function CampoTexto({
  id,
  etiqueta,
  tipo = "text",
  valor,
  alCambiar,
  error,
  deshabilitado = false,
  requerido = false,
  ayuda,
  min,
  pattern,
  placeholder,
}) {
  return (
    <div className="col-12 col-md-6">
      <label className="form-label" htmlFor={id}>
        {etiqueta}
        {requerido ? <span className="text-danger"> *</span> : null}
      </label>
      <input
        id={id}
        name={id}
        type={tipo}
        className={`form-control ${error ? "is-invalid" : ""}`}
        value={valor}
        onChange={alCambiar}
        disabled={deshabilitado}
        required={requerido}
        min={min}
        pattern={pattern}
        placeholder={placeholder}
        aria-invalid={error ? "true" : "false"}
      />
      {ayuda && !error ? (
        <div className="form-text">{ayuda}</div>
      ) : null}
      {error ? <div className="invalid-feedback">{error}</div> : null}
    </div>
  );
}
