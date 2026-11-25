function json(valor, respaldo) {
  if (valor === null || valor === undefined) return respaldo;
  if (typeof valor === "string") {
    try {
      return JSON.parse(valor);
    } catch {
      return respaldo;
    }
  }
  return valor;
}

export function aCandidato(r) {
  return {
    id: r.id,
    nombre: r.nombre,
    correo: r.correo,
    telefono: r.telefono,
    cargo: r.cargo,
    familia: r.familia,
    origen: r.origen,
    ubicacion: r.ubicacion,
    departamento: r.departamento,
    unidad: r.departamento,
    requiereReferencia: Boolean(r.requiere_referencia),
    canal: r.canal,
    fechaPostulacion: r.fecha_postulacion,
  };
}

export function aOferta(r) {
  return {
    id: r.id,
    cargo: r.cargo,
    familia: r.familia,
    departamento: r.departamento,
    unidad: r.departamento,
    ubicacion: r.ubicacion,
    modalidad: r.modalidad,
    descripcion: r.descripcion,
    funciones: r.funciones,
    requisitos: r.requisitos,
    beneficios: r.beneficios,
    sueldo: r.sueldo,
    vacantes: Number(r.vacantes),
    fechaPublicacion: r.fecha_publicacion,
    fechaCierre: r.fecha_cierre,
    estado: r.estado,
    responsable: r.responsable,
  };
}

export function aSolicitud(r) {
  const base = {
    id: r.id,
    candidatoId: r.candidato_id,
    postulacionId: r.postulacion_id,
    ofertaId: r.oferta_id,
    cargo: r.cargo,
    familia: r.familia,
    fechaSolicitud: r.fecha_solicitud,
    estado: r.estado,
    responsable: r.responsable,
    prioridad: r.prioridad,
    observaciones: r.observaciones,
    fechaEntrevista: r.fecha_entrevista,
    fechaInforme: r.fecha_informe,
  };
  if (r.candidato_nombre !== undefined) {
    base.candidato = {
      id: r.candidato_id,
      nombre: r.candidato_nombre,
      correo: r.candidato_correo,
      telefono: r.candidato_telefono,
      ubicacion: r.candidato_ubicacion,
      departamento: r.candidato_departamento,
    };
  }
  return base;
}

export function aEvaluacion(r) {
  return {
    id: r.id,
    solicitudId: r.solicitud_id,
    fechaEvaluacion: r.fecha_evaluacion,
    resultado: r.resultado,
    categoria: r.categoria,
    observaciones: r.observaciones,
    evaluador: r.evaluador,
  };
}

export function aBitacora(r) {
  return {
    id: r.id,
    solicitudId: r.solicitud_id,
    fecha: r.fecha,
    estadoAnterior: r.estado_anterior,
    estadoNuevo: r.estado_nuevo,
    responsable: r.responsable,
  };
}

export function aPostulacion(r) {
  return {
    id: r.id,
    folio: r.folio,
    ofertaId: r.oferta_id,
    candidatoId: r.candidato_id,
    fecha: r.fecha,
    estado: r.estado,
    consentimiento: Boolean(r.consentimiento),
    carpeta: r.carpeta || null,
    carpetaId: r.carpeta_cv_id,
    tieneCv: Boolean(r.archivo_id),
    archivo: r.archivo_id
      ? {
          id: r.archivo_id,
          nombreOriginal: r.nombre_original,
          mime: r.mime,
          tamano: Number(r.tamano),
          sha256: r.sha256,
        }
      : null,
    candidato: r.candidato_nombre
      ? {
          id: r.candidato_id,
          nombre: r.candidato_nombre,
          correo: r.candidato_correo,
          telefono: r.candidato_telefono,
        }
      : null,
    oferta: r.oferta_cargo
      ? {
          id: r.oferta_id,
          cargo: r.oferta_cargo,
          departamento: r.oferta_departamento,
          ubicacion: r.oferta_ubicacion,
        }
      : null,
  };
}

export function aAnalisis(r) {
  return {
    id: r.id,
    solicitudId: r.solicitud_id,
    puntaje: r.puntaje === null ? null : Number(r.puntaje),
    resumen: r.resumen,
    formacion: r.formacion,
    experiencia: r.experiencia,
    habilidades: json(r.habilidades, []),
    requisitos: json(r.requisitos, []),
    preguntas: json(r.preguntas, []),
    faltantes: json(r.faltantes, []),
    limitaciones: r.limitaciones,
    modelo: r.modelo,
    promptVersion: r.prompt_version,
    creadoPor: r.creado_por,
    revisadoPor: r.revisado_por,
    revisadoEn: r.revisado_en,
    creadoEn: r.creado_en,
    pendienteRevision: !r.revisado_en,
  };
}
