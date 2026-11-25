import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import AvisoSimulacion from "../components/AvisoSimulacion.jsx";
import BandejaSolicitudes from "../components/BandejaSolicitudes.jsx";
import EtiquetaEstado from "../components/EtiquetaEstado.jsx";
import FichaCandidato from "../components/FichaCandidato.jsx";
import TarjetaKpi from "../components/TarjetaKpi.jsx";
import {
  distribucionPorFamilia,
  promedioDiasInforme,
  resumenEstados,
  resumenPortal,
  tasaRecomendacion,
} from "../utils/selectores.js";

export default function DashboardPage() {
  const {
    candidatos,
    solicitudes,
    solicitudesVisibles,
    evaluaciones,
    ofertas,
    perfil,
    perfilActivo,
    puede,
  } = useApp();

  const resumen = resumenEstados(solicitudesVisibles);
  const dias = promedioDiasInforme(solicitudesVisibles);
  const tasa = tasaRecomendacion(evaluaciones);
  const familias = distribucionPorFamilia(candidatos).slice(0, 5);
  const maxFamilia = familias[0]?.cantidad || 1;
  const recientes = [...candidatos].slice(-3).reverse();
  const portal = resumenPortal(ofertas, solicitudes);
  const postulacionesPortal = solicitudes
    .filter((solicitud) => solicitud.canal === "Portal público")
    .slice(-3)
    .reverse();

  const pendientes = resumen.find((item) => item.estado === "Pendiente")?.cantidad || 0;
  const enProceso = resumen.find((item) => item.estado === "En proceso")?.cantidad || 0;
  const finalizadas =
    resumen.find((item) => item.estado === "Finalizada")?.cantidad || 0;
  const totalSolicitudes = solicitudesVisibles.length;
  const avance =
    totalSolicitudes === 0
      ? 0
      : Math.round((finalizadas / totalSolicitudes) * 100);

  const sinSolicitud = candidatos.filter(
    (candidato) =>
      !solicitudes.some((solicitud) => solicitud.candidatoId === candidato.id)
  ).length;

  const estadoDe = (idCandidato) => {
    const solicitud = solicitudes.find(
      (item) => item.candidatoId === idCandidato
    );
    return solicitud ? solicitud.estado : "Sin solicitud";
  };

  const focoPorRol = {
    analista: {
      icono: "bi-person-plus",
      titulo: "Gestión de candidatos",
      texto: `${sinSolicitud} ${
        sinSolicitud === 1 ? "candidato no tiene" : "candidatos no tienen"
      } una solicitud de evaluación registrada.`,
      enlace: puede("crearSolicitud") ? "/solicitudes/nueva" : "/solicitudes",
      etiquetaEnlace: puede("crearSolicitud")
        ? "Crear solicitud"
        : "Ver solicitudes",
    },
    evaluador: {
      icono: "bi-clipboard-pulse",
      titulo: "Evaluaciones asignadas",
      texto: `${pendientes + enProceso} ${
        pendientes + enProceso === 1
          ? "solicitud requiere"
          : "solicitudes requieren"
      } seguimiento en tu bandeja.`,
      enlace: "/solicitudes",
      etiquetaEnlace: "Ir a mi bandeja",
    },
    jefatura: {
      icono: "bi-graph-up",
      titulo: "Estado general del proceso",
      texto: `${avance}% de las solicitudes visibles ya está finalizado (${finalizadas} de ${totalSolicitudes}).`,
      enlace: "/solicitudes",
      etiquetaEnlace: "Revisar procesos",
    },
  };

  const foco = focoPorRol[perfilActivo] || focoPorRol.jefatura;

  return (
    <>
      <header className="encabezado-pagina mb-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <span className="eyebrow">
              <i className="bi bi-grid-1x2" aria-hidden="true" />
              Panel de control
            </span>
            <h1 className="h3 mb-1">Dashboard</h1>
            <p className="text-secondary mb-0">
              <i className="bi bi-person-circle me-1" aria-hidden="true" />
              {perfil.nombre} · {perfil.rol}
            </p>
          </div>

          {puede("crearCandidato") ? (
            <Link to="/candidatos/nuevo" className="btn btn-marca">
              <i className="bi bi-person-plus me-1" aria-hidden="true" />
              Registrar candidato
            </Link>
          ) : null}
        </div>
      </header>

      <AvisoSimulacion />

      <div className="row g-3 mb-4">
        <TarjetaKpi
          titulo="Candidatos"
          valor={candidatos.length}
          detalle="Registrados en el sistema"
          icono="bi-people-fill"
          color="azul"
        />
        <TarjetaKpi
          titulo="Solicitudes"
          valor={solicitudesVisibles.length}
          detalle="Visibles para tu perfil"
          icono="bi-clipboard2-check"
          color="aqua"
        />
        <TarjetaKpi
          titulo="Tiempo medio"
          valor={dias === null ? "—" : `${dias} d`}
          detalle="Solicitud a informe entregado"
          icono="bi-clock-history"
          color="ambar"
        />
        <TarjetaKpi
          titulo="Recomendados"
          valor={tasa === null ? "—" : `${tasa}%`}
          detalle="Evaluaciones con resultado Apto"
          icono="bi-hand-thumbs-up-fill"
          color="verde"
        />
      </div>

      <div className="card tarjeta-vc mb-4">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div className="d-flex align-items-start gap-3">
              <span className="kpi-icono" aria-hidden="true">
                <i className="bi bi-broadcast" />
              </span>
              <div>
                <h2 className="h6 text-uppercase text-secondary mb-1">
                  Reclutamiento en línea
                </h2>
                <p className="mb-0 small text-secondary">
                  <strong className="texto-marca">{portal.ofertas}</strong>{" "}
                  ofertas publicadas ·{" "}
                  <strong className="texto-marca">{portal.vacantes}</strong>{" "}
                  vacantes disponibles ·{" "}
                  <strong className="texto-marca">{portal.postulaciones}</strong>{" "}
                  postulaciones recibidas desde el portal.
                </p>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <Link to="/ofertas" className="btn btn-sm btn-outline-marca">
                <i className="bi bi-megaphone me-1" aria-hidden="true" />
                Gestionar ofertas
              </Link>
              <Link
                to="/postular"
                className="btn btn-sm btn-outline-secondary"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bi bi-box-arrow-up-right me-1" aria-hidden="true" />
                Ver portal
              </Link>
            </div>
          </div>

          {postulacionesPortal.length > 0 ? (
            <div className="border-top mt-3 pt-3">
              <p className="small text-secondary mb-2">
                Últimas postulaciones del portal
              </p>
              <ul className="list-unstyled small mb-0 row g-2">
                {postulacionesPortal.map((solicitud) => {
                  const candidato = candidatos.find(
                    (item) => item.id === solicitud.candidatoId
                  );
                  return (
                    <li className="col-12 col-md-4" key={solicitud.id}>
                      <Link
                        to={`/solicitudes/${solicitud.id}`}
                        className="d-flex align-items-center gap-2 text-decoration-none"
                      >
                        <i className="bi bi-person-plus texto-aqua" aria-hidden="true" />
                        <span className="text-body text-truncate">
                          {candidato?.nombre || "Postulante"}
                        </span>
                        <EtiquetaEstado estado={solicitud.estado} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="small text-secondary border-top mt-3 pt-3 mb-0">
              <i className="bi bi-info-circle me-1" aria-hidden="true" />
              Aún no hay postulaciones desde el portal público. Comparte el
              enlace con tus candidatos para automatizar el registro.
            </p>
          )}
        </div>
      </div>

      <div className="card enfoque-rol mb-4">
        <div className="card-body d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 py-3">
          <div className="d-flex align-items-start gap-3">
            <span className="kpi-icono" aria-hidden="true">
              <i className={`bi ${foco.icono}`} />
            </span>
            <div>
              <p className="fw-semibold mb-1">{foco.titulo}</p>
              <p className="small text-secondary mb-0">{foco.texto}</p>
            </div>
          </div>
          <Link to={foco.enlace} className="btn btn-sm btn-outline-marca">
            {foco.etiquetaEnlace}
            <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-7">
          <div className="card tarjeta-vc h-100">
            <div className="card-body">
              <h2 className="seccion-titulo">
                <i className="bi bi-pie-chart" aria-hidden="true" />
                Solicitudes por estado
              </h2>
              <div className="row g-3">
                {resumen.map((item) => (
                  <div className="col-4" key={item.estado}>
                    <div className="resumen-estado">
                      <p className="cantidad">{item.cantidad}</p>
                      <EtiquetaEstado estado={item.estado} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-secondary">Avance del proceso</span>
                  <span className="fw-semibold">{avance}%</span>
                </div>
                <div
                  className="progress barra-familia"
                  role="progressbar"
                  aria-label="Avance del proceso"
                  aria-valuenow={avance}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div
                    className="progress-bar"
                    style={{ width: `${avance}%` }}
                  />
                </div>
              </div>

              <Link
                to="/solicitudes"
                className="btn btn-sm btn-outline-secondary mt-3"
              >
                Ver todas las solicitudes
                <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card tarjeta-vc h-100">
            <div className="card-body">
              <h2 className="seccion-titulo">
                <i className="bi bi-diagram-3" aria-hidden="true" />
                Candidatos por familia
              </h2>
              {familias.map((item) => (
                <div key={item.familia} className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>{item.familia}</span>
                    <span className="text-secondary">{item.cantidad}</span>
                  </div>
                  <div className="progress barra-familia">
                    <div
                      className="progress-bar"
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
          <h2 className="h4 mb-0">
            <i className="bi bi-clock-history texto-aqua me-2" aria-hidden="true" />
            Candidatos recientes
          </h2>
          <Link to="/candidatos" className="btn btn-sm btn-outline-secondary">
            Ver todos
            <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
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
              estado={estadoDe(candidato.id)}
              correo={candidato.correo}
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
