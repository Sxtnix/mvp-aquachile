import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import BuscadorExpandible from "../components/BuscadorExpandible.jsx";
import BarraFiltros from "../components/BarraFiltros.jsx";
import EtiquetaEstado from "../components/EtiquetaEstado.jsx";
import { formatFecha } from "../utils/fechas.js";

export default function PostulacionesPage() {
  const { postulaciones, descargarCv, usaApi, limpiarError } = useApp();
  const [texto, setTexto] = useState("");
  const [descargando, setDescargando] = useState(null);
  const [error, setError] = useState("");

  const consulta = texto.trim().toLowerCase();
  const visibles = postulaciones.filter((postulacion) => {
    if (!consulta) return true;
    return `${postulacion.folio} ${postulacion.candidato?.nombre || ""} ${
      postulacion.candidato?.correo || ""
    } ${postulacion.oferta?.cargo || ""} ${postulacion.carpeta || ""}`
      .toLowerCase()
      .includes(consulta);
  });

  const descargar = async (postulacion) => {
    setError("");
    setDescargando(postulacion.id);
    try {
      await descargarCv(
        postulacion.id,
        postulacion.archivo?.nombreOriginal || "curriculum.pdf",
      );
    } catch (fallo) {
      setError(fallo.message || "No fue posible descargar el currículum.");
      limpiarError?.();
    } finally {
      setDescargando(null);
    }
  };

  return (
    <>
      <header className="encabezado-pagina mb-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <span className="eyebrow">
              <i className="bi bi-folder2-open" aria-hidden="true" />
              Currículums recibidos
            </span>
            <h1 className="h3 mb-1">Postulaciones y carpetas CV</h1>
            <p className="text-secondary mb-0">
              Cada postulación tiene una carpeta identificada y un archivo
              privado, descargable solo por el equipo autorizado.
            </p>
          </div>
          <span className="badge-vc estado-publicada align-self-start align-self-md-center">
            <i className="bi bi-shield-lock" aria-hidden="true" />
            Acceso restringido
          </span>
        </div>
      </header>

      <BarraFiltros
        resumen={
          <>
            <i className="bi bi-inbox me-1" aria-hidden="true" />
            {visibles.length}{" "}
            {visibles.length === 1 ? "postulación" : "postulaciones"}
          </>
        }
        hayFiltros={Boolean(texto)}
        alLimpiar={() => setTexto("")}
        etiqueta="Filtros de postulaciones"
      >
        <BuscadorExpandible
          id="postulaciones-buscar"
          etiqueta="Buscar postulación"
          placeholder="Folio, candidato, cargo o carpeta…"
          valor={texto}
          alCambiar={(evento) => setTexto(evento.target.value)}
          alLimpiar={() => setTexto("")}
        />
      </BarraFiltros>

      {error ? (
        <div className="alert alert-danger py-2" role="alert">
          <i className="bi bi-exclamation-circle me-1" aria-hidden="true" />
          {error}
        </div>
      ) : null}

      {!usaApi ? (
        <div className="alert alert-info d-flex align-items-center gap-2">
          <i className="bi bi-plug" aria-hidden="true" />
          Conecta el backend (`backend/npm run dev`) para ver y descargar los
          currículums persistidos.
        </div>
      ) : null}

      {visibles.length === 0 ? (
        <div className="card tarjeta-vc">
          <div className="card-body text-center py-5">
            <i
              className="bi bi-folder2 display-5 text-secondary d-block mb-3"
              aria-hidden="true"
            />
            <h2 className="h5">Aún no hay postulaciones para mostrar</h2>
            <p className="text-secondary mb-0">
              Cuando alguien postule desde el portal público, su carpeta y
              currículum aparecerán aquí.
            </p>
          </div>
        </div>
      ) : (
        <div className="tabla-contenedor">
          <div className="table-responsive">
            <table className="table tabla-vc align-middle">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Postulante</th>
                  <th>Oferta</th>
                  <th>Departamento</th>
                  <th>Carpeta CV</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th className="text-end">Currículum</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((postulacion) => (
                  <tr key={postulacion.id}>
                    <td>
                      <code className="small">{postulacion.folio}</code>
                    </td>
                    <td>
                      <span className="fw-semibold d-block">
                        {postulacion.candidato?.nombre || "Sin candidato"}
                      </span>
                      <span className="small text-secondary">
                        {postulacion.candidato?.correo}
                      </span>
                    </td>
                    <td>{postulacion.oferta?.cargo || "—"}</td>
                    <td>{postulacion.oferta?.departamento || "—"}</td>
                    <td>
                      <code className="small">{postulacion.carpeta || "—"}</code>
                    </td>
                    <td>{formatFecha(postulacion.fecha)}</td>
                    <td>
                      <EtiquetaEstado estado={postulacion.estado || "Recibida"} />
                    </td>
                    <td className="text-end">
                      {postulacion.tieneCv ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-marca"
                          onClick={() => descargar(postulacion)}
                          disabled={descargando === postulacion.id}
                        >
                          <i className="bi bi-download me-1" aria-hidden="true" />
                          {descargando === postulacion.id
                            ? "Descargando…"
                            : postulacion.archivo?.nombreOriginal || "CV"}
                        </button>
                      ) : (
                        <span className="small text-secondary">Sin archivo</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
