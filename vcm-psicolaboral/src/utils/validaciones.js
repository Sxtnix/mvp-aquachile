import { esFutura, esPosterior, esISOValida } from "./fechas.js";
import { FORMATOS_CURRICULUM, TAMANO_MAX_CURRICULUM } from "../data/catalogos.js";

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEFONO = /^\+?[0-9\s]{8,15}$/;

export function esCorreoValido(correo) {
  return CORREO.test((correo || "").trim());
}

export function esTelefonoValido(telefono) {
  return TELEFONO.test((telefono || "").trim());
}

function requerido(valor) {
  return typeof valor === "string" && valor.trim().length > 0;
}

export function validarCandidato(datos, { candidatos = [], idActual = null } = {}) {
  const errores = {};

  if (!requerido(datos.nombre)) {
    errores.nombre = "Ingresa el nombre completo.";
  } else if (datos.nombre.trim().length < 3) {
    errores.nombre = "El nombre debe tener al menos 3 caracteres.";
  }

  if (!requerido(datos.correo)) {
    errores.correo = "Ingresa el correo electrónico.";
  } else if (!esCorreoValido(datos.correo)) {
    errores.correo = "El formato del correo no es válido.";
  } else {
    const duplicado = candidatos.some(
      (candidato) =>
        candidato.id !== Number(idActual) &&
        candidato.correo.toLowerCase() === datos.correo.trim().toLowerCase()
    );
    if (duplicado) {
      errores.correo = "Ya existe un candidato con este correo.";
    }
  }

  if (!requerido(datos.telefono)) {
    errores.telefono = "Ingresa el teléfono de contacto.";
  } else if (!esTelefonoValido(datos.telefono)) {
    errores.telefono = "Usa solo números, espacios o el signo +.";
  }

  if (!requerido(datos.cargo)) {
    errores.cargo = "Indica el cargo al que postula.";
  }

  if (!requerido(datos.familia)) {
    errores.familia = "Selecciona la familia de cargo.";
  }

  if (!requerido(datos.origen)) {
    errores.origen = "Selecciona el origen del candidato.";
  }

  if (!requerido(datos.ubicacion)) {
    errores.ubicacion = "Selecciona la ubicación del cargo.";
  }

  if (!requerido(datos.departamento || datos.unidad)) {
    errores.unidad = "Selecciona el departamento.";
  }

  if (!requerido(datos.fechaPostulacion)) {
    errores.fechaPostulacion = "Indica la fecha de postulación.";
  } else if (!esISOValida(datos.fechaPostulacion)) {
    errores.fechaPostulacion = "La fecha de postulación no es válida.";
  } else if (esFutura(datos.fechaPostulacion)) {
    errores.fechaPostulacion = "La fecha de postulación no puede ser futura.";
  }

  return errores;
}

export function validarSolicitud(datos, { candidatos = [], solicitudes = [] } = {}) {
  const errores = {};
  const candidato = candidatos.find(
    (item) => item.id === Number(datos.candidatoId)
  );

  if (!candidato) {
    errores.candidatoId = "Selecciona un candidato válido.";
  } else {
    const solicitudActiva = solicitudes.find(
      (solicitud) =>
        solicitud.candidatoId === candidato.id && solicitud.estado !== "Finalizada"
    );
    if (solicitudActiva) {
      errores.candidatoId =
        "Este candidato ya tiene una solicitud de evaluación en curso.";
    }
  }

  if (!requerido(datos.responsable)) {
    errores.responsable = "Selecciona el profesional responsable.";
  }

  if (!requerido(datos.prioridad)) {
    errores.prioridad = "Selecciona la prioridad.";
  }

  if (!requerido(datos.fechaSolicitud)) {
    errores.fechaSolicitud = "Indica la fecha de solicitud.";
  } else if (!esISOValida(datos.fechaSolicitud)) {
    errores.fechaSolicitud = "La fecha de solicitud no es válida.";
  } else if (esFutura(datos.fechaSolicitud)) {
    errores.fechaSolicitud = "La fecha de solicitud no puede ser futura.";
  }

  return errores;
}

export function validarEvaluacion(datos, { solicitud } = {}) {
  const errores = {};

  if (!requerido(datos.fechaEvaluacion)) {
    errores.fechaEvaluacion = "Indica la fecha de evaluación.";
  } else if (!esISOValida(datos.fechaEvaluacion)) {
    errores.fechaEvaluacion = "La fecha de evaluación no es válida.";
  } else if (esFutura(datos.fechaEvaluacion)) {
    errores.fechaEvaluacion = "La fecha de evaluación no puede ser futura.";
  } else if (solicitud && esPosterior(solicitud.fechaSolicitud, datos.fechaEvaluacion)) {
    errores.fechaEvaluacion =
      "La evaluación no puede ser anterior a la solicitud.";
  }

  if (!requerido(datos.resultado)) {
    errores.resultado = "Selecciona el resultado de la evaluación.";
  } else if (datos.resultado === "Sin resultado") {
    errores.resultado = "Selecciona un resultado definitivo.";
  }

  if (!requerido(datos.categoria)) {
    errores.categoria = "Selecciona la categoría del evaluador.";
  }

  const observaciones = (datos.observaciones || "").trim();
  if (!requerido(observaciones)) {
    errores.observaciones = "Registra las observaciones de la evaluación.";
  } else if (observaciones.length < 10) {
    errores.observaciones = "Describe la evaluación (mínimo 10 caracteres).";
  }

  if (datos.resultado === "No apto" || datos.categoria === "No recomendado") {
    if (observaciones.length < 20) {
      errores.observaciones =
        "Cuando el resultado es negativo, detalla el fundamento (mínimo 20 caracteres).";
    }
  }

  return errores;
}

export function validarCurriculum(archivo) {
  if (!archivo || !archivo.nombre) {
    return "Adjunta tu currículum en formato PDF, DOC o DOCX.";
  }

  const nombre = archivo.nombre.toLowerCase();
  const formatoValido = FORMATOS_CURRICULUM.some((extension) =>
    nombre.endsWith(extension)
  );

  if (!formatoValido) {
    return "El currículum debe ser PDF, DOC o DOCX.";
  }

  if (archivo.tamano > TAMANO_MAX_CURRICULUM) {
    return "El archivo no puede superar los 5 MB.";
  }

  if (archivo.tamano <= 0) {
    return "El archivo adjunto está vacío.";
  }

  return "";
}

export function validarOferta(datos) {
  const errores = {};
  const esBorrador = datos.estado === "Borrador";

  if (!requerido(datos.cargo)) {
    errores.cargo = "Indica el cargo de la oferta.";
  }

  if (!requerido(datos.familia)) {
    errores.familia = "Selecciona la familia de cargo.";
  }

  if (!requerido(datos.ubicacion)) {
    errores.ubicacion = "Selecciona la ubicación del cargo.";
  }

  if (!requerido(datos.departamento || datos.unidad)) {
    errores.unidad = "Selecciona el departamento.";
  }

  if (!requerido(datos.modalidad)) {
    errores.modalidad = "Selecciona la modalidad de trabajo.";
  }

  if (!requerido(datos.responsable)) {
    errores.responsable = "Selecciona el profesional responsable.";
  }

  const vacantes = Number(datos.vacantes);
  if (!Number.isInteger(vacantes) || vacantes < 1) {
    errores.vacantes = "Ingresa al menos una vacante.";
  }

  if (!requerido(datos.fechaPublicacion)) {
    if (!esBorrador) {
      errores.fechaPublicacion = "Indica la fecha de publicación.";
    }
  } else if (!esISOValida(datos.fechaPublicacion)) {
    errores.fechaPublicacion = "La fecha de publicación no es válida.";
  } else if (esFutura(datos.fechaPublicacion)) {
    errores.fechaPublicacion = "La fecha de publicación no puede ser futura.";
  }

  if (!requerido(datos.fechaCierre)) {
    errores.fechaCierre = "Indica la fecha de cierre.";
  } else if (!esISOValida(datos.fechaCierre)) {
    errores.fechaCierre = "La fecha de cierre no es válida.";
  } else if (
    requerido(datos.fechaPublicacion) &&
    esPosterior(datos.fechaPublicacion, datos.fechaCierre)
  ) {
    errores.fechaCierre = "El cierre no puede ser anterior a la publicación.";
  }

  if (!requerido(datos.descripcion)) {
    errores.descripcion = "Describe brevemente la oferta.";
  } else if (datos.descripcion.trim().length < 20) {
    errores.descripcion = "Describe la oferta con al menos 20 caracteres.";
  }

  if (!requerido(datos.funciones)) {
    errores.funciones = "Indica las funciones del cargo.";
  } else if (datos.funciones.trim().length < 10) {
    errores.funciones = "Detalla las funciones con al menos 10 caracteres.";
  }

  if (!requerido(datos.requisitos)) {
    errores.requisitos = "Indica los requisitos del cargo.";
  } else if (datos.requisitos.trim().length < 15) {
    errores.requisitos = "Detalla los requisitos con al menos 15 caracteres.";
  }

  return errores;
}

export function validarPostulacionPublica(
  datos,
  { oferta, candidatos = [], solicitudes = [] } = {}
) {
  const errores = {};

  if (!oferta) {
    errores.oferta = "La oferta seleccionada no existe.";
  } else if (oferta.estado !== "Publicada") {
    errores.oferta = "Esta oferta ya no está recibiendo postulaciones.";
  }

  if (!requerido(datos.nombre)) {
    errores.nombre = "Ingresa tu nombre completo.";
  } else if (datos.nombre.trim().length < 3) {
    errores.nombre = "El nombre debe tener al menos 3 caracteres.";
  }

  if (!requerido(datos.correo)) {
    errores.correo = "Ingresa tu correo electrónico.";
  } else if (!esCorreoValido(datos.correo)) {
    errores.correo = "El formato del correo no es válido.";
  } else {
    const existente = candidatos.find(
      (candidato) =>
        candidato.correo.toLowerCase() === datos.correo.trim().toLowerCase()
    );

    if (
      existente &&
      oferta &&
      solicitudes.some(
        (solicitud) =>
          solicitud.ofertaId === oferta.id &&
          solicitud.candidatoId === existente.id
      )
    ) {
      errores.correo =
        "Ya recibimos una postulación con este correo para esta oferta.";
    }
  }

  if (!requerido(datos.telefono)) {
    errores.telefono = "Ingresa tu teléfono de contacto.";
  } else if (!esTelefonoValido(datos.telefono)) {
    errores.telefono = "Usa solo números, espacios o el signo +.";
  }

  const errorCurriculum = validarCurriculum(datos.curriculum);
  if (errorCurriculum) {
    errores.curriculum = errorCurriculum;
  }

  if (!datos.consentimiento) {
    errores.consentimiento =
      "Debes autorizar el tratamiento de tus datos para continuar.";
  }

  return errores;
}

export function hayErrores(errores) {
  return Object.keys(errores).length > 0;
}
