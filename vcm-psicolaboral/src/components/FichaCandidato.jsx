import EtiquetaEstado from "./EtiquetaEstado.jsx";

function iniciales(nombre = "") {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

export default function FichaCandidato({
  nombre,
  cargo,
  familia,
  estado = "Sin solicitud",
  correo,
  telefono,
  ubicacion,
  acciones,
}) {
  return (
    <div className="col-12 col-md-6 col-xl-4">
      <article className="card tarjeta-vc ficha-candidato">
        <div className="card-body">
          <div className="d-flex align-items-start gap-3 mb-3">
            <span className="avatar-iniciales" aria-hidden="true">
              {iniciales(nombre)}
            </span>
            <div className="flex-grow-1 min-w-0">
              <h3 className="h5 mb-1 text-break">{nombre}</h3>
              <p className="small text-secondary mb-0">
                <i className="bi bi-briefcase me-1 texto-aqua" aria-hidden="true" />
                {cargo}
              </p>
            </div>
            <EtiquetaEstado estado={estado} />
          </div>

          <ul className="ficha-datos">
            {familia ? (
              <li>
                <i className="bi bi-diagram-3" aria-hidden="true" />
                <span>{familia}</span>
              </li>
            ) : null}

            {ubicacion ? (
              <li>
                <i className="bi bi-geo-alt" aria-hidden="true" />
                <span>{ubicacion}</span>
              </li>
            ) : null}

            {correo ? (
              <li>
                <i className="bi bi-envelope" aria-hidden="true" />
                <span className="text-break">{correo}</span>
              </li>
            ) : null}

            {telefono ? (
              <li>
                <i className="bi bi-telephone" aria-hidden="true" />
                <span>{telefono}</span>
              </li>
            ) : null}
          </ul>

          {acciones ? (
            <div className="d-flex flex-wrap gap-2 mt-3 pt-3 border-top">
              {acciones}
            </div>
          ) : null}
        </div>
      </article>
    </div>
  );
}
