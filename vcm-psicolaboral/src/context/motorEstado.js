import {
  bitacoraInicial,
  candidatosIniciales,
  evaluacionesIniciales,
  solicitudesIniciales,
} from "../data/datosIniciales.js";
import { hoyISO } from "../utils/fechas.js";

export const PERMISOS = {
  analista: {
    crearCandidato: true,
    editarCandidato: true,
    eliminarCandidato: true,
    crearSolicitud: true,
    editarEvaluacion: false,
    cambiarEstado: false,
  },
  evaluador: {
    crearCandidato: false,
    editarCandidato: false,
    eliminarCandidato: false,
    crearSolicitud: false,
    editarEvaluacion: true,
    cambiarEstado: true,
  },
  jefatura: {
    crearCandidato: false,
    editarCandidato: false,
    eliminarCandidato: false,
    crearSolicitud: false,
    editarEvaluacion: false,
    cambiarEstado: false,
  },
};

export function siguienteId(registros) {
  return registros.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

export const estadoInicial = {
  candidatos: candidatosIniciales,
  solicitudes: solicitudesIniciales,
  evaluaciones: evaluacionesIniciales,
  bitacora: bitacoraInicial,
  perfilActivo: "analista",
};

export function reducer(estado, accion) {
  switch (accion.type) {
    case "agregar-candidato": {
      const nuevo = { ...accion.datos, id: siguienteId(estado.candidatos) };
      return { ...estado, candidatos: [...estado.candidatos, nuevo] };
    }
    case "actualizar-candidato": {
      return {
        ...estado,
        candidatos: estado.candidatos.map((candidato) =>
          candidato.id === Number(accion.id)
            ? { ...candidato, ...accion.datos }
            : candidato
        ),
      };
    }
    case "eliminar-candidato": {
      const id = Number(accion.id);
      const idsEliminados = new Set(
        estado.solicitudes
          .filter((solicitud) => solicitud.candidatoId === id)
          .map((solicitud) => solicitud.id)
      );
      return {
        ...estado,
        candidatos: estado.candidatos.filter(
          (candidato) => candidato.id !== id
        ),
        solicitudes: estado.solicitudes.filter(
          (solicitud) => solicitud.candidatoId !== id
        ),
        evaluaciones: estado.evaluaciones.filter(
          (evaluacion) => !idsEliminados.has(evaluacion.solicitudId)
        ),
        bitacora: estado.bitacora.filter(
          (registro) => !idsEliminados.has(registro.solicitudId)
        ),
      };
    }
    case "crear-solicitud": {
      const nueva = {
        ...accion.datos,
        id: siguienteId(estado.solicitudes),
        estado: "Pendiente",
      };
      const registro = {
        id: siguienteId(estado.bitacora),
        solicitudId: nueva.id,
        fecha: nueva.fechaSolicitud,
        estadoAnterior: null,
        estadoNuevo: "Pendiente",
        responsable: nueva.responsable,
      };
      return {
        ...estado,
        solicitudes: [...estado.solicitudes, nueva],
        bitacora: [...estado.bitacora, registro],
      };
    }
    case "actualizar-solicitud": {
      return {
        ...estado,
        solicitudes: estado.solicitudes.map((solicitud) =>
          solicitud.id === Number(accion.id)
            ? { ...solicitud, ...accion.datos }
            : solicitud
        ),
      };
    }
    case "cambiar-estado": {
      const id = Number(accion.id);
      const solicitud = estado.solicitudes.find((item) => item.id === id);
      if (!solicitud || solicitud.estado === accion.estado) return estado;
      const registro = {
        id: siguienteId(estado.bitacora),
        solicitudId: id,
        fecha: accion.fecha || hoyISO(),
        estadoAnterior: solicitud.estado,
        estadoNuevo: accion.estado,
        responsable: accion.responsable,
      };
      return {
        ...estado,
        solicitudes: estado.solicitudes.map((item) =>
          item.id === id ? { ...item, estado: accion.estado } : item
        ),
        bitacora: [...estado.bitacora, registro],
      };
    }
    case "guardar-evaluacion": {
      const idSolicitud = Number(accion.solicitudId);
      const existente = estado.evaluaciones.find(
        (evaluacion) => evaluacion.solicitudId === idSolicitud
      );
      if (existente) {
        return {
          ...estado,
          evaluaciones: estado.evaluaciones.map((evaluacion) =>
            evaluacion.solicitudId === idSolicitud
              ? { ...evaluacion, ...accion.datos }
              : evaluacion
          ),
        };
      }
      return {
        ...estado,
        evaluaciones: [
          ...estado.evaluaciones,
          {
            ...accion.datos,
            id: siguienteId(estado.evaluaciones),
            solicitudId: idSolicitud,
          },
        ],
      };
    }
    case "cambiar-perfil": {
      return { ...estado, perfilActivo: accion.perfil };
    }
    default:
      return estado;
  }
}
