import bcrypt from "bcryptjs";

const PASSWORD_DEMO = "AquaChile2026!";

const usuarios = [
  {
    nombre: "Camila Reyes",
    email: "analista@aquachile.cl",
    rol: "ANALISTA",
  },
  {
    nombre: "Valeria Ospina",
    email: "evaluador@aquachile.cl",
    rol: "EVALUADOR",
  },
  {
    nombre: "Alejandro Vidal",
    email: "jefatura@aquachile.cl",
    rol: "JEFATURA",
  },
];

const candidatos = [
  ["Valentina Rojas", "valentina.rojas@correo.cl", "+56 9 8123 4455", "Analista de Calidad", "Profesional A", "Externo", "Oficina Central", "Calidad", true, "Portal", "2026-09-10"],
  ["Mauricio Alarcón", "mauricio.alarcon@correo.cl", "+56 9 7744 1188", "Técnico de Mantenimiento", "Técnico A", "Externo", "Planta Magallanes", "Mantenimiento", true, "Portal", "2026-09-12"],
  ["Francisca Leiva", "francisca.leiva@correo.cl", "+56 9 6655 3399", "Jefe de Turno", "Jefatura", "Interno", "Planta San Antonio", "Operaciones", true, "Interno", "2026-09-14"],
  ["Diego Salazar", "diego.salazar@correo.cl", "+56 9 5544 2211", "Operario de Planta", "Operario Calificado", "Externo", "Planta Puerto Aysén", "Operaciones", false, "Portal", "2026-09-18"],
  ["Antonia Vega", "antonia.vega@correo.cl", "+56 9 4433 7788", "Profesional de Remuneraciones", "Profesional B", "Externo", "Oficina Central", "Recursos Humanos", true, "Portal", "2026-09-20"],
  ["Rodrigo Muñoz", "rodrigo.munoz@correo.cl", "+56 9 3322 9911", "Supervisor de Planta", "Técnico B", "Interno", "Planta Magallanes", "Mantenimiento", false, "Interno", "2026-09-22"],
  ["Josefa Contreras", "josefa.contreras@correo.cl", "+56 9 2211 6655", "Coordinador de Operaciones", "Profesional C", "Externo", "Planta San Antonio", "Operaciones", true, "Portal", "2026-09-28"],
  ["Ignacio Paredes", "ignacio.paredes@correo.cl", "+56 9 1188 4433", "Analista Técnico Senior", "Técnico C", "Interno", "Oficina Central", "Calidad", false, "Interno", "2026-10-02"],
  ["Constanza Fuentes", "constanza.fuentes@correo.cl", "+56 9 9012 3344", "Ingeniero de Procesos", "Profesional A", "Externo", "Centro de Distribución Rancagua", "Calidad", true, "Portal", "2026-10-08"],
  ["Nicolás Herrera", "nicolas.herrera@correo.cl", "+56 9 8765 9012", "Operador de Empaque", "Operario Calificado", "Externo", "Planta Puerto Aysén", "Logística", false, "Portal", "2026-10-14"],
];

const ofertas = [
  {
    cargo: "Técnico de Mantenimiento",
    familia: "Técnico A",
    departamento: "Mantenimiento",
    ubicacion: "Planta Magallanes",
    modalidad: "Presencial",
    vacantes: 2,
    fechaPublicacion: "2026-11-01",
    fechaCierre: "2026-12-15",
    estado: "Publicada",
    responsable: "Valeria Ospina",
    descripcion:
      "Mantenimiento preventivo y correctivo de equipos de planta, con turnos rotativos y foco en seguridad operacional.",
    funciones:
      "Ejecutar mantenciones preventivas y correctivas.\nRegistrar órdenes de trabajo en el sistema de gestión.\nApoyar la continuidad operativa de las líneas de proceso.\nCumplir los protocolos de seguridad y medioambiente.",
    requisitos:
      "Técnico en mecánica industrial o electricidad.\nExperiencia mínima de 2 años en plantas de proceso.\nManejo de herramientas de diagnóstico.\nLicencia de conducir clase B deseable.",
    beneficios:
      "Seguro complementario de salud.\nBono de turno y movilización.\nCapacitación técnica continua.\nCafetería en planta.",
    sueldo: "$850.000 - $1.050.000 líquido",
  },
  {
    cargo: "Analista de Calidad",
    familia: "Profesional A",
    departamento: "Calidad",
    ubicacion: "Oficina Central",
    modalidad: "Híbrida",
    vacantes: 1,
    fechaPublicacion: "2026-11-03",
    fechaCierre: "2026-12-05",
    estado: "Publicada",
    responsable: "Camila Reyes",
    descripcion:
      "Apoyo al sistema de gestión de calidad, auditorías internas y seguimiento de indicadores de proceso.",
    funciones:
      "Coordinar auditorías internas del sistema de gestión.\nAnalizar indicadores de calidad y proponer mejoras.\nMantener actualizada la documentación del sistema.\nCapacitar a los equipos en normas de inocuidad.",
    requisitos:
      "Título profesional en ingeniería, tecnología de alimentos o carrera afín.\nConocimiento de normas ISO y herramientas de mejora continua.\nManejo de planillas y reportes.",
    beneficios:
      "Modalidad híbrida con días flexibles.\nSeguro complementario de salud.\nBono anual por desempeño.\nPrograma de formación.",
    sueldo: "$1.200.000 - $1.450.000 bruto",
  },
  {
    cargo: "Operario de Empaque",
    familia: "Operario Calificado",
    departamento: "Logística",
    ubicacion: "Planta Puerto Aysén",
    modalidad: "Presencial",
    vacantes: 3,
    fechaPublicacion: "2026-11-05",
    fechaCierre: "2026-11-30",
    estado: "Publicada",
    responsable: "Camila Reyes",
    descripcion:
      "Acondicionamiento y empaque de producto terminado, cumpliendo estándares de inocuidad y trazabilidad.",
    funciones:
      "Empacar producto terminado según especificación.\nEtiquetar y registrar lotes para trazabilidad.\nMantener el orden y aseo de la línea.\nReportar desviaciones al supervisor de turno.",
    requisitos:
      "Enseñanza media completa.\nDisponibilidad para turnos rotativos.\nExperiencia en líneas de empaque deseable.",
    beneficios:
      "Turnos con colación y transporte.\nBono de producción.\nSeguro complementario de salud.\nCapacitación en inocuidad.",
    sueldo: "$620.000 - $720.000 líquido",
  },
  {
    cargo: "Jefe de Turno",
    familia: "Jefatura",
    departamento: "Operaciones",
    ubicacion: "Planta San Antonio",
    modalidad: "Presencial",
    vacantes: 1,
    fechaPublicacion: "2026-10-01",
    fechaCierre: "2026-10-30",
    estado: "Cerrada",
    responsable: "Valeria Ospina",
    descripcion:
      "Coordinación del equipo de turno y control de la operación diaria de planta.",
    funciones:
      "Coordinar el equipo de turno.\nControlar indicadores de producción.\nResolver contingencias operativas.\nVelar por el cumplimiento de seguridad.",
    requisitos:
      "Experiencia previa en supervisión de equipos operativos.\nFormación técnica o profesional en áreas afines.",
    beneficios:
      "Bono de turno.\nSeguro complementario.\nPlan de carrera interno.",
    sueldo: "$1.300.000 - $1.600.000 bruto",
  },
  {
    cargo: "Ingeniero de Procesos",
    familia: "Profesional A",
    departamento: "Calidad",
    ubicacion: "Centro de Distribución Rancagua",
    modalidad: "Híbrida",
    vacantes: 1,
    fechaPublicacion: null,
    fechaCierre: "2026-12-20",
    estado: "Borrador",
    responsable: "Camila Reyes",
    descripcion:
      "Optimización de procesos productivos, análisis de datos y liderazgo de proyectos de mejora.",
    funciones:
      "Analizar datos de proceso y detectar oportunidades de mejora.\nLiderar proyectos de optimización.\nDocumentar cambios y validar resultados.",
    requisitos:
      "Ingeniería civil industrial, química o afín.\nExperiencia en procesos productivos y manejo de indicadores.",
    beneficios:
      "Modalidad híbrida.\nBono por proyectos.\nSeguro complementario.",
    sueldo: "A convenir según experiencia",
  },
];

const solicitudes = [
  [1, null, null, "Analista de Calidad", "Profesional A", "2026-09-14", "Finalizada", "Valeria Ospina", "Media", "Postulante de la convocatoria interna de calidad.", "2026-09-20", "2026-09-24"],
  [2, null, null, "Técnico de Mantenimiento", "Técnico A", "2026-09-16", "En proceso", "Valeria Ospina", "Alta", "Cobertura urgente de turno en planta Magallanes.", "2026-10-05", ""],
  [3, null, null, "Jefe de Turno", "Jefatura", "2026-09-18", "Finalizada", "Valeria Ospina", "Alta", "Ascenso interno a cargo de jefatura de turno.", "2026-09-25", "2026-09-30"],
  [4, null, null, "Operario de Planta", "Operario Calificado", "2026-09-21", "Pendiente", "Valeria Ospina", "Baja", "Candidato de apoyo operativo para la temporada baja.", "", ""],
  [5, null, null, "Profesional de Remuneraciones", "Profesional B", "2026-09-23", "En proceso", "Valeria Ospina", "Media", "Refuerzo del equipo de remuneraciones en Oficina Central.", "2026-10-08", ""],
  [6, null, null, "Supervisor de Planta", "Técnico B", "2026-09-25", "Pendiente", "Valeria Ospina", "Media", "Ascenso interno al área de mantenimiento.", "", ""],
  [7, null, null, "Coordinador de Operaciones", "Profesional C", "2026-10-02", "En proceso", "Valeria Ospina", "Alta", "Coordinación de la operación multi-planta.", "2026-10-14", ""],
  [8, null, null, "Analista Técnico Senior", "Técnico C", "2026-10-06", "Pendiente", "Valeria Ospina", "Baja", "Apoyo al equipo de control de calidad.", "", ""],
];

const evaluaciones = [
  [1, "2026-09-24", "Apto", "Recomendado", "Buen análisis crítico y comunicación asertiva. Se recomienda incorporación al área de calidad.", "Valeria Ospina"],
  [3, "2026-09-30", "Apto", "Recomendado", "Experiencia sólida en gestión de turnos y prevención de riesgos. Perfil recomendado para la jefatura.", "Valeria Ospina"],
  [2, "2026-10-05", "Apto con observaciones", "Recomendado con observaciones", "Buen desempeño técnico. Se observa timidez al liderar equipos; requiere acompañamiento inicial.", "Valeria Ospina"],
];

const bitacora = [
  [1, "2026-09-14", null, "Pendiente", "Valeria Ospina"],
  [1, "2026-09-20", "Pendiente", "En proceso", "Valeria Ospina"],
  [1, "2026-09-24", "En proceso", "Finalizada", "Valeria Ospina"],
  [2, "2026-09-16", null, "Pendiente", "Valeria Ospina"],
  [2, "2026-10-05", "Pendiente", "En proceso", "Valeria Ospina"],
  [3, "2026-09-18", null, "Pendiente", "Valeria Ospina"],
  [3, "2026-09-25", "Pendiente", "En proceso", "Valeria Ospina"],
  [3, "2026-09-30", "En proceso", "Finalizada", "Valeria Ospina"],
  [4, "2026-09-21", null, "Pendiente", "Valeria Ospina"],
  [5, "2026-09-23", null, "Pendiente", "Valeria Ospina"],
  [5, "2026-10-08", "Pendiente", "En proceso", "Valeria Ospina"],
  [6, "2026-09-25", null, "Pendiente", "Valeria Ospina"],
  [7, "2026-10-02", null, "Pendiente", "Valeria Ospina"],
  [7, "2026-10-14", "Pendiente", "En proceso", "Valeria Ospina"],
  [8, "2026-10-06", null, "Pendiente", "Valeria Ospina"],
];

async function contar(db, tabla) {
  const resultado = await db.query(`SELECT COUNT(*)::int AS total FROM ${tabla}`);
  return resultado.rows[0].total;
}

/** Inserta datos demo una sola vez. Es idempotente por tabla. */
export async function seed(db) {
  if ((await contar(db, "usuarios")) === 0) {
    const hash = await bcrypt.hash(PASSWORD_DEMO, 10);
    for (const usuario of usuarios) {
      await db.query(
        "INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4)",
        [usuario.nombre, usuario.email, hash, usuario.rol],
      );
    }
  }

  if ((await contar(db, "candidatos")) === 0) {
    for (const c of candidatos) {
      await db.query(
        `INSERT INTO candidatos
          (nombre, correo, telefono, cargo, familia, origen, ubicacion, departamento, requiere_referencia, canal, fecha_postulacion)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        c,
      );
    }
  }

  if ((await contar(db, "ofertas")) === 0) {
    for (const o of ofertas) {
      await db.query(
        `INSERT INTO ofertas
          (cargo, familia, departamento, ubicacion, modalidad, vacantes, fecha_publicacion, fecha_cierre,
           estado, responsable, descripcion, funciones, requisitos, beneficios, sueldo)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          o.cargo,
          o.familia,
          o.departamento,
          o.ubicacion,
          o.modalidad,
          o.vacantes,
          o.fechaPublicacion,
          o.fechaCierre,
          o.estado,
          o.responsable,
          o.descripcion,
          o.funciones,
          o.requisitos,
          o.beneficios,
          o.sueldo,
        ],
      );
    }
  }

  if ((await contar(db, "solicitudes")) === 0) {
    for (const s of solicitudes) {
      await db.query(
        `INSERT INTO solicitudes
          (candidato_id, postulacion_id, oferta_id, cargo, familia, fecha_solicitud, estado,
           responsable, prioridad, observaciones, fecha_entrevista, fecha_informe)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        s,
      );
    }
  }

  if ((await contar(db, "evaluaciones")) === 0) {
    for (const e of evaluaciones) {
      await db.query(
        `INSERT INTO evaluaciones
          (solicitud_id, fecha_evaluacion, resultado, categoria, observaciones, evaluador)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        e,
      );
    }
  }

  if ((await contar(db, "bitacora")) === 0) {
    for (const b of bitacora) {
      await db.query(
        `INSERT INTO bitacora (solicitud_id, fecha, estado_anterior, estado_nuevo, responsable)
         VALUES ($1,$2,$3,$4,$5)`,
        b,
      );
    }
  }
}

export const CREDENCIALES_DEMO = {
  password: PASSWORD_DEMO,
  usuarios: usuarios.map(({ email, rol, nombre }) => ({ email, rol, nombre })),
};
