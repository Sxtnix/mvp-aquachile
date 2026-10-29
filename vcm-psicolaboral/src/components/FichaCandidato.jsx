export default function FichaCandidato({
  nombre,
  cargo,
  familia,
  estado,
  correo,
  telefono,
  ubicacion,
  acciones,
}) {
  return (
    <div className="col-12 col-md-6 col-xl-4">
      <div className="card card-altura shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start gap-2">
            <h3 className="h5 mb-1">{nombre}</h3>
            {estado ? (
              <span className="badge text-bg-secondary flex-shrink-0">
                {estado}
              </span>
            ) : null}
          </div>

          <p className="text-secondary mb-2">{cargo}</p>

          {familia ? (
            <p className="small mb-1">
              <span className="text-secondary">Familia:</span> {familia}
            </p>
          ) : null}

          {ubicacion ? (
            <p className="small mb-1">
              <span className="text-secondary">Ubicación:</span> {ubicacion}
            </p>
          ) : null}

          {correo ? (
            <p className="mb-1 small text-break">{correo}</p>
          ) : null}

          {telefono ? (
            <p className="mb-0 small text-secondary">{telefono}</p>
          ) : null}

          {acciones ? (
            <div className="d-flex flex-wrap gap-2 mt-3">{acciones}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
