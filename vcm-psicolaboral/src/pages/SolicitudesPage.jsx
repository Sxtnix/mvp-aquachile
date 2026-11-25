import { useApp } from "../context/AppContext.jsx";
import AvisoSimulacion from "../components/AvisoSimulacion.jsx";
import BandejaSolicitudes from "../components/BandejaSolicitudes.jsx";

export default function SolicitudesPage() {
  const { solicitudesVisibles, veTodasLasSolicitudes, perfil } = useApp();

  return (
    <>
      <header className="encabezado-pagina mb-3">
        <span className="eyebrow">
          <i className="bi bi-inbox" aria-hidden="true" />
          Seguimiento del proceso
        </span>
        <h1 className="h3 mb-1">Solicitudes de evaluación</h1>
        <p className="text-secondary mb-0">
          <i className="bi bi-clipboard2-check me-1" aria-hidden="true" />
          {solicitudesVisibles.length} solicitudes visibles para {perfil.rol}
        </p>
      </header>

      <AvisoSimulacion />

      {veTodasLasSolicitudes ? null : (
        <div className="alert alert-info d-flex align-items-center gap-2 small">
          <i className="bi bi-funnel" aria-hidden="true" />
          Estás viendo únicamente las solicitudes asignadas a {perfil.nombre}.
        </div>
      )}

      <BandejaSolicitudes
        solicitudes={solicitudesVisibles}
        titulo="Listado de solicitudes"
      />
    </>
  );
}
