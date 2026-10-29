import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import AvisoSimulacion from "../components/AvisoSimulacion.jsx";
import BandejaSolicitudes from "../components/BandejaSolicitudes.jsx";
import FichaCandidato from "../components/FichaCandidato.jsx";
import TarjetaKpi from "../components/TarjetaKpi.jsx";
import {
  distribucionPorFamilia,
  promedioDiasInforme,
  resumenEstados,
  tasaRecomendacion,
} from "../utils/selectores.js";

export default function DashboardPage() {
  const { candidatos, solicitudesVisibles, evaluaciones, perfil, puede } =
    useApp();

  const resumen = resumenEstados(solicitudesVisibles);
  const dias = promedioDiasInforme(solicitudesVisibles);
  const tasa = tasaRecomendacion(evaluaciones);
  const familias = distribucionPorFamilia(candidatos).slice(0, 5);
  const maxFamilia = familias[0]?.cantidad || 1;
  const recientes = [...candidatos].slice(-3).reverse();

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
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

      <AvisoSimulacion />

      <div className="row g-3 mb-3">
        <TarjetaKpi
          titulo="Candidatos"
          valor={candidatos.length}
          detalle="Registrados en el sistema"
        />
        <TarjetaKpi
          titulo="Solicitudes"
          valor={solicitudesVisibles.length}
          detalle="Visibles para tu perfil"
        />
        <TarjetaKpi
          titulo="Tiempo medio"
          valor={dias === null ? "—" : `${dias} d`}
          detalle="Solicitud a informe entregado"
        />
        <TarjetaKpi
          titulo="Recomendados"
          valor={tasa === null ? "—" : `${tasa}%`}
          detalle="Evaluaciones con resultado Apto"
          variante="text-success-emphasis"
        />
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h6 text-uppercase text-secondary mb-3">
                Solicitudes por estado
              </h2>
              <div className="row g-3">
                {resumen.map((item) => (
                  <div className="col-4" key={item.estado}>
                    <div className="border rounded p-3 text-center h-100">
                      <p className="display-6 fw-semibold mb-1">
                        {item.cantidad}
                      </p>
                      <p className="small text-secondary mb-0">{item.estado}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h6 text-uppercase text-secondary mb-3">
                Candidatos por familia de cargo
              </h2>
              {familias.map((item) => (
                <div key={item.familia} className="mb-2">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>{item.familia}</span>
                    <span className="text-secondary">{item.cantidad}</span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar fondo-marca"
                      role="progressbar"
                      style={{
                        width: `${Math.round(
                          (item.cantidad / maxFamilia) * 100
                        )}%`,
                      }}
                      aria-valuenow={item.cantidad}
                      aria-valuemin="0"
                      aria-valuemax={maxFamilia}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <h2 className="h4 mb-0">Candidatos recientes</h2>
          <Link to="/candidatos" className="btn btn-sm btn-outline-secondary">
            Ver todos
          </Link>
        </div>

        <div className="row g-3">
          {recientes.map((candidato) => (
            <FichaCandidato
              key={candidato.id}
              nombre={candidato.nombre}
              cargo={candidato.cargo}
              familia={candidato.familia}
              ubicacion={candidato.ubicacion}
            />
          ))}
        </div>
      </section>

      <BandejaSolicitudes
        solicitudes={solicitudesVisibles}
        titulo="Solicitudes recientes"
        mostrarResponsable={false}
      />
    </>
  );
}
