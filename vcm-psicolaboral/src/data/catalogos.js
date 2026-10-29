export const ESTADOS_SOLICITUD = ["Pendiente", "En proceso", "Finalizada"];

export const RESULTADOS_EVALUACION = [
  "Apto",
  "Apto con observaciones",
  "No apto",
  "Sin resultado",
];

export const CATEGORIAS_EVALUADOR = [
  "Recomendado",
  "Recomendado con observaciones",
  "No recomendado",
];

export const PRIORIDADES = ["Alta", "Media", "Baja"];

export const ORIGENES = ["Externo", "Interno"];

export const FAMILIAS_CARGO = [
  "Profesional A",
  "Profesional B",
  "Profesional C",
  "Técnico A",
  "Técnico B",
  "Técnico C",
  "Jefatura",
  "Operario Calificado",
];

export const CARGOS_POR_FAMILIA = {
  "Profesional A": [
    "Analista de Recursos Humanos",
    "Analista de Calidad",
    "Ingeniero de Procesos",
  ],
  "Profesional B": [
    "Profesional de Remuneraciones",
    "Especialista en Seguridad",
    "Analista de Presupuesto",
  ],
  "Profesional C": [
    "Coordinador de Operaciones",
    "Coordinador de Logística",
    "Especialista Senior",
  ],
  "Técnico A": [
    "Técnico de Mantenimiento",
    "Técnico de Laboratorio",
    "Operador de Planta",
  ],
  "Técnico B": [
    "Técnico Superior de Mantenimiento",
    "Técnico de Instrumentación",
    "Supervisor de Planta",
  ],
  "Técnico C": ["Técnico Especialista", "Analista Técnico Senior"],
  "Jefatura": ["Jefe de Turno", "Jefe de Área", "Supervisor de Cuadrilla"],
  "Operario Calificado": [
    "Operario de Planta",
    "Ayudante de Bodega",
    "Operador de Empaque",
  ],
};

export const UBICACIONES = [
  "Oficina Central",
  "Planta Magallanes",
  "Planta Puerto Aysén",
  "Planta San Antonio",
  "Centro de Distribución Rancagua",
];

export const UNIDADES = [
  "Recursos Humanos",
  "Operaciones",
  "Mantenimiento",
  "Logística",
  "Calidad",
  "Administración",
];

export const RESPONSABLES = [
  "Valeria Ospina",
  "Héctor Bustos",
  "Ignacia Ferrer",
];

export const PERFILES = {
  analista: {
    nombre: "Camila Reyes",
    rol: "Analista de Reclutamiento",
    etiqueta: "Analista",
    descripcion:
      "Registra candidatos y crea solicitudes de evaluación psicolaboral.",
  },
  evaluador: {
    nombre: "Valeria Ospina",
    rol: "Profesional Evaluador",
    etiqueta: "Evaluador",
    descripcion:
      "Gestiona las solicitudes asignadas y registra la evaluación psicolaboral.",
  },
  jefatura: {
    nombre: "Alejandro Vidal",
    rol: "Jefatura (solo consulta)",
    etiqueta: "Jefatura",
    descripcion:
      "Consulta el estado del proceso sin modificar registros ni evaluaciones.",
  },
};
