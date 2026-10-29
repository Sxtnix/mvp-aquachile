import { diasEntre } from "./fechas.js";
import { ESTADOS_SOLICITUD } from "../data/catalogos.js";

export function contarPorEstado(solicitudes, estado) {
  return solicitudes.filter((solicitud) => solicitud.estado === estado).length;
}

export function resumenEstados(solicitudes) {
  return ESTADOS_SOLICITUD.map((estado) => ({
    estado,
    cantidad: contarPorEstado(solicitudes, estado),
  }));
}

export function promedioDiasInforme(solicitudes) {
  const cerradas = solicitudes.filter(
    (solicitud) => solicitud.estado === "Finalizada" && solicitud.fechaInforme
  );
  if (cerradas.length === 0) return null;
  const total = cerradas.reduce(
    (suma, solicitud) => suma + (diasEntre(solicitud.fechaSolicitud, solicitud.fechaInforme) ?? 0),
    0
  );
  return Math.round(total / cerradas.length);
}

export function tasaRecomendacion(evaluaciones) {
  const conResultado = evaluaciones.filter(
    (evaluacion) => evaluacion.resultado && evaluacion.resultado !== "Sin resultado"
  );
  if (conResultado.length === 0) return null;
  const aptas = conResultado.filter(
    (evaluacion) => evaluacion.resultado === "Apto"
  ).length;
  return Math.round((aptas / conResultado.length) * 100);
}

export function distribucionPorFamilia(candidatos) {
  const mapa = new Map();
  candidatos.forEach((candidato) => {
    const familia = candidato.familia || "Sin familia";
    mapa.set(familia, (mapa.get(familia) || 0) + 1);
  });
  return [...mapa.entries()]
    .map(([familia, cantidad]) => ({ familia, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);
}

export function candidatosFiltrados(candidatos, { texto = "", familia = "", origen = "" } = {}) {
  const consulta = texto.trim().toLowerCase();
  return candidatos.filter((candidato) => {
    const coincideTexto =
      !consulta ||
      `${candidato.nombre} ${candidato.cargo} ${candidato.correo}`
        .toLowerCase()
        .includes(consulta);
    const coincideFamilia = !familia || candidato.familia === familia;
    const coincideOrigen = !origen || candidato.origen === origen;
    return coincideTexto && coincideFamilia && coincideOrigen;
  });
}

export function solicitudesFiltradas(
  solicitudes,
  { texto = "", estado = "", familia = "", responsable = "", desde = "", hasta = "" } = {},
  obtenerCandidato
) {
  const consulta = texto.trim().toLowerCase();
  return solicitudes.filter((solicitud) => {
    const candidato = obtenerCandidato?.(solicitud.candidatoId);
    const coincideTexto =
      !consulta ||
      `${candidato?.nombre ?? ""} ${solicitud.cargo}`
        .toLowerCase()
        .includes(consulta);
    const coincideEstado = !estado || solicitud.estado === estado;
    const coincideFamilia = !familia || solicitud.familia === familia;
    const coincideResponsable =
      !responsable || solicitud.responsable === responsable;
    const coincideDesde = !desde || solicitud.fechaSolicitud >= desde;
    const coincideHasta = !hasta || solicitud.fechaSolicitud <= hasta;
    return (
      coincideTexto &&
      coincideEstado &&
      coincideFamilia &&
      coincideResponsable &&
      coincideDesde &&
      coincideHasta
    );
  });
}
