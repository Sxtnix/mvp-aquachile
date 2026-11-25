import {
  bitacoraInicial,
  candidatosIniciales,
  evaluacionesIniciales,
  ofertasIniciales,
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
    gestionarOfertas: true,
  },
  evaluador: {
    crearCandidato: false,
    editarCandidato: false,
    eliminarCandidato: false,
    crearSolicitud: false,
    editarEvaluacion: true,
    cambiarEstado: true,
    gestionarOfertas: false,
  },
  jefatura: {
    crearCandidato: false,
    editarCandidato: false,
    eliminarCandidato: false,
    crearSolicitud: false,
    editarEvaluacion: false,
    cambiarEstado: false,
    gestionarOfertas: false,
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
  ofertas: ofertasIniciales,
  postulaciones: [],
  iaEstado: null,
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
    case "crear-oferta": {
      const nueva = {
        ...accion.datos,
        id: siguienteId(estado.ofertas),
        estado: accion.datos.estado || "Publicada",
        fechaPublicacion: accion.datos.fechaPublicacion || hoyISO(),
      };
      return { ...estado, ofertas: [...estado.ofertas, nueva] };
    }
    case "actualizar-oferta": {
      return {
        ...estado,
        ofertas: estado.ofertas.map((oferta) =>
          oferta.id === Number(accion.id)
            ? { ...oferta, ...accion.datos }
            : oferta
        ),
      };
    }
    case "cambiar-estado-oferta": {
      return {
        ...estado,
        ofertas: estado.ofertas.map((oferta) =>
          oferta.id === Number(accion.id)
            ? { ...oferta, estado: accion.estado }
            : oferta
        ),
      };
    }
    case "postular-oferta": {
      const oferta = estado.ofertas.find(
        (item) => item.id === Number(accion.ofertaId)
      );
      if (!oferta || oferta.estado !== "Publicada") return estado;

      const correo = (accion.datos.correo || "").trim().toLowerCase();
      const existente = estado.candidatos.find(
        (candidato) => candidato.correo.toLowerCase() === correo
      );

      if (
        existente &&
        estado.solicitudes.some(
          (solicitud) =>
            solicitud.ofertaId === oferta.id &&
            solicitud.candidatoId === existente.id
        )
      ) {
        return estado;
      }

      const candidato =
        existente ||
        ({
          id: siguienteId(estado.candidatos),
          nombre: accion.datos.nombre,
          correo: accion.datos.correo,
          telefono: accion.datos.telefono,
          cargo: oferta.cargo,
          familia: oferta.familia,
          origen: "Externo",
          ubicacion: oferta.ubicacion,
          unidad: oferta.unidad || oferta.departamento || "",
          fechaPostulacion: hoyISO(),
          requiereReferencia: false,
          canal: "Portal público",
          ofertaOrigenId: oferta.id,
        });

      const candidatos = existente
        ? estado.candidatos
        : [...estado.candidatos, candidato];

      const idSolicitud = accion.solicitudId || siguienteId(estado.solicitudes);
      const nuevaSolicitud = {
        id: idSolicitud,
        candidatoId: candidato.id,
        cargo: oferta.cargo,
        familia: oferta.familia,
        fechaSolicitud: hoyISO(),
        estado: "Pendiente",
        responsable: oferta.responsable,
        prioridad: "Media",
        observaciones: `Postulación recibida desde el portal público para la oferta #${oferta.id}: ${oferta.cargo}.`,
        fechaEntrevista: "",
        fechaInforme: "",
        ofertaId: oferta.id,
        canal: "Portal público",
        curriculum: accion.curriculum || null,
      };

      const registro = {
        id: siguienteId(estado.bitacora),
        solicitudId: nuevaSolicitud.id,
        fecha: nuevaSolicitud.fechaSolicitud,
        estadoAnterior: null,
        estadoNuevo: "Pendiente",
        responsable: "Portal público",
      };

      return {
        ...estado,
        candidatos,
        solicitudes: [...estado.solicitudes, nuevaSolicitud],
        bitacora: [...estado.bitacora, registro],
      };
    }
    case "eliminar-oferta": {
      const id = Number(accion.id);
      return {
        ...estado,
        ofertas: estado.ofertas.filter((oferta) => oferta.id !== id),
      };
    }
    case "guardar-analisis": {
      const id = Number(accion.solicitudId);
      return {
        ...estado,
        solicitudes: estado.solicitudes.map((solicitud) =>
          solicitud.id === id
            ? { ...solicitud, analisis: accion.analisis }
            : solicitud
        ),
      };
    }
    case "hidratar": {
      const datos = accion.datos || {};
      return {
        ...estado,
        ...(datos.candidatos ? { candidatos: datos.candidatos } : {}),
        ...(datos.solicitudes ? { solicitudes: datos.solicitudes } : {}),
        ...(datos.evaluaciones ? { evaluaciones: datos.evaluaciones } : {}),
        ...(datos.bitacora ? { bitacora: datos.bitacora } : {}),
        ...(datos.ofertas ? { ofertas: datos.ofertas } : {}),
        ...(datos.postulaciones
          ? { postulaciones: datos.postulaciones }
          : {}),
        ...(datos.iaEstado !== undefined ? { iaEstado: datos.iaEstado } : {}),
        ...(datos.perfilActivo ? { perfilActivo: datos.perfilActivo } : {}),
      };
    }
    case "cerrar-sesion": {
      return {
        ...estadoInicial,
        candidatos: [],
        solicitudes: [],
        evaluaciones: [],
        bitacora: [],
        ofertas: [],
        postulaciones: [],
        iaEstado: null,
      };
    }
    case "cambiar-perfil": {
      return { ...estado, perfilActivo: accion.perfil };
    }
    default:
      return estado;
  }
}
