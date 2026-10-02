import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import CandidatoCard from "../components/CandidatoCard.jsx";
import MetricaCard from "../components/MetricaCard.jsx";
import SolicitudesPanel from "../components/SolicitudesPanel.jsx";

export default function DashboardPage() {
  const { candidatos, solicitudesVisibles, perfil, puede } = useApp();

  const contar = (estado) =>
    solicitudesVisibles.filter((solicitud) => solicitud.estado === estado)
      .length;

  const recientes = [...candidatos].slice(-3).reverse();

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
        <div>
          <h1 className="h3 mb-1">Dashboard</h1>
          <p className="text-secondary mb-0">
            {perfil.nombre} · {perfil.rol}
          </p>
        </div>

        {puede("crearCandidato") ? (
          <Link to="/candidatos/nuevo" className="btn btn-marca">
            Registrar candidato
          </Link>
        ) : null}
      </div>

      <div className="alert alert-light border small mb-4">
        {perfil.descripcion}
      </div>

      <div className="row g-3">
        <MetricaCard
          titulo="Candidatos"
          valor={candidatos.length}
          detalle="Registrados en el sistema"
        />
        <MetricaCard
          titulo="Pendientes"
          valor={contar("Pendiente")}
          detalle="Sin gestión del evaluador"
          variante="text-secondary"
        />
        <MetricaCard
          titulo="En proceso"
          valor={contar("En proceso")}
          detalle="Evaluación en curso"
          variante="text-warning-emphasis"
        />
        <MetricaCard
          titulo="Finalizadas"
          valor={contar("Finalizada")}
          detalle="Evaluación completada"
          variante="text-success-emphasis"
        />
      </div>

      <section className="mt-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <h2 className="h4 mb-0">Candidatos recientes</h2>
          <Link to="/candidatos" className="btn btn-sm btn-outline-secondary">
            Ver todos
          </Link>
        </div>

        <div className="row g-3">
          {recientes.map((candidato) => (
            <CandidatoCard
              key={candidato.id}
              nombre={candidato.nombre}
              cargo={candidato.cargo}
              correo={candidato.correo}
              telefono={candidato.telefono}
            />
          ))}
        </div>
      </section>

      <SolicitudesPanel solicitudes={solicitudesVisibles} />
    </>
  );
}
