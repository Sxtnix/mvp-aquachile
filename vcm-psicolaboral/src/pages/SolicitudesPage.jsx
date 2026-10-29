import { useApp } from "../context/AppContext.jsx";
import AvisoSimulacion from "../components/AvisoSimulacion.jsx";
import BandejaSolicitudes from "../components/BandejaSolicitudes.jsx";

export default function SolicitudesPage() {
  const { solicitudesVisibles, veTodasLasSolicitudes, perfil } = useApp();

  return (
    <>
      <div className="mb-3">
        <h1 className="h3 mb-1">Solicitudes de evaluación</h1>
        <p className="text-secondary mb-0">
          {solicitudesVisibles.length} solicitudes visibles para {perfil.rol}
        </p>
      </div>

      <AvisoSimulacion />

      {veTodasLasSolicitudes ? null : (
        <div className="alert alert-light border small">
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
