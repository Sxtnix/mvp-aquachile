import { useApp } from "../context/AppContext.jsx";
import SolicitudesPanel from "../components/SolicitudesPanel.jsx";

export default function SolicitudesPage() {
  const { solicitudesVisibles, verTodasLasSolicitudes, perfil } = useApp();

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 mb-1">Solicitudes de evaluación</h1>
        <p className="text-secondary mb-0">
          {solicitudesVisibles.length} solicitudes visibles para {perfil.rol}
        </p>
      </div>

      {verTodasLasSolicitudes ? null : (
        <div className="alert alert-light border small">
          Estás viendo únicamente las solicitudes asignadas a {perfil.nombre}.
        </div>
      )}

      <SolicitudesPanel
        solicitudes={solicitudesVisibles}
        titulo="Listado de solicitudes"
        filaVacia="No hay solicitudes que coincidan con los filtros."
      />
    </>
  );
}
