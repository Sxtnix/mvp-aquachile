export const ESTADOS_SOLICITUD = ["Pendiente", "En proceso", "Finalizada"];

export const RESULTADOS_EVALUACION = [
  "Apto",
  "Apto con observaciones",
  "No apto",
  "Sin resultado",
];

export const RESPONSABLES = ["Laura Pérez", "Carlos Díaz", "María Fuentes"];

export const FAMILIAS_CARGO = [
  "Administrativo",
  "Operaciones",
  "Técnico",
  "Jefatura",
];

export const PERFILES = {
  analista: {
    nombre: "Camila Rojas",
    rol: "Analista de Reclutamiento",
    descripcion: "Registra candidatos y crea solicitudes de evaluación.",
  },
  evaluador: {
    nombre: "Laura Pérez",
    rol: "Profesional Evaluador",
    descripcion: "Gestiona las solicitudes asignadas y registra la evaluación.",
  },
};

export const candidatosIniciales = [
  {
    id: 1,
    nombre: "Ana Torres",
    correo: "ana.torres@correo.cl",
    telefono: "+56 9 8765 4321",
    cargo: "Analista de Reclutamiento",
    familia: "Administrativo",
  },
  {
    id: 2,
    nombre: "Diego Soto",
    correo: "diego.soto@correo.cl",
    telefono: "+56 9 5544 3322",
    cargo: "Supervisor de Cuadrilla",
    familia: "Jefatura",
  },
  {
    id: 3,
    nombre: "Camila Rojas",
    correo: "camila.rojas@correo.cl",
    telefono: "+56 9 2211 3344",
    cargo: "Operador de Planta",
    familia: "Operaciones",
  },
  {
    id: 4,
    nombre: "Rodrigo Fuentes",
    correo: "rodrigo.fuentes@correo.cl",
    telefono: "+56 9 7788 1122",
    cargo: "Técnico de Mantenimiento",
    familia: "Técnico",
  },
  {
    id: 5,
    nombre: "Paula Contreras",
    correo: "paula.contreras@correo.cl",
    telefono: "+56 9 3344 5566",
    cargo: "Administrativa de Bodega",
    familia: "Administrativo",
  },
  {
    id: 6,
    nombre: "Luis Mardones",
    correo: "luis.mardones@correo.cl",
    telefono: "+56 9 6655 4477",
    cargo: "Jefe de Turno",
    familia: "Jefatura",
  },
];

export const solicitudesIniciales = [
  {
    id: 1,
    candidatoId: 1,
    cargo: "Analista de Reclutamiento",
    familia: "Administrativo",
    fechaSolicitud: "2026-09-14",
    estado: "Pendiente",
    responsable: "Laura Pérez",
  },
  {
    id: 2,
    candidatoId: 2,
    cargo: "Supervisor de Cuadrilla",
    familia: "Jefatura",
    fechaSolicitud: "2026-09-16",
    estado: "En proceso",
    responsable: "Laura Pérez",
  },
  {
    id: 3,
    candidatoId: 3,
    cargo: "Operador de Planta",
    familia: "Operaciones",
    fechaSolicitud: "2026-09-18",
    estado: "Finalizada",
    responsable: "Carlos Díaz",
  },
  {
    id: 4,
    candidatoId: 4,
    cargo: "Técnico de Mantenimiento",
    familia: "Técnico",
    fechaSolicitud: "2026-09-21",
    estado: "Pendiente",
    responsable: "María Fuentes",
  },
  {
    id: 5,
    candidatoId: 5,
    cargo: "Administrativa de Bodega",
    familia: "Administrativo",
    fechaSolicitud: "2026-09-23",
    estado: "En proceso",
    responsable: "Laura Pérez",
  },
  {
    id: 6,
    candidatoId: 6,
    cargo: "Jefe de Turno",
    familia: "Jefatura",
    fechaSolicitud: "2026-09-25",
    estado: "Pendiente",
    responsable: "Carlos Díaz",
  },
];

export const evaluacionesIniciales = [
  {
    id: 1,
    solicitudId: 3,
    fechaEvaluacion: "2026-09-24",
    observaciones:
      "Buen manejo de conflictos y comunicación asertiva. Se recomienda incorporación al área de operaciones.",
    resultado: "Apto",
  },
];
