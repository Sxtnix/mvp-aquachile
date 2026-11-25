import { vi } from "vitest";

export const USUARIO_DEMO = {
  id: 1,
  nombre: "Camila Reyes",
  email: "analista@aquachile.cl",
  rol: "ANALISTA",
};

export const ANALISIS_DEMO = {
  id: 10,
  solicitudId: 1,
  puntaje: 88,
  resumen: "Perfil con buen ajuste al cargo.",
  formacion: "Ingeniería en Alimentos.",
  experiencia: "3 años en control de calidad.",
  habilidades: ["Análisis de datos", "ISO 9001"],
  requisitos: [
    { requisito: "Ingeniería o carrera afín", estado: "cumple", detalle: "Título" },
    { requisito: "Experiencia ISO", estado: "parcial", detalle: "Parcial" },
    { requisito: "Licencia clase B", estado: "no", detalle: "Sin dato" },
  ],
  preguntas: [
    { pregunta: "¿Cómo aplicó ISO 9001?", objetivo: "Verificar experiencia" },
  ],
  faltantes: ["Licencia de conducir"],
  limitaciones: "Información autoinformada.",
  modelo: "openai/gpt-oss-120b",
  revisadoPor: null,
  revisadoEn: null,
  pendienteRevision: true,
};

export const DATOS_DEMO = {
  candidatos: [
    {
      id: 1,
      nombre: "Valentina Rojas",
      correo: "valentina.rojas@correo.cl",
      telefono: "+56 9 8123 4455",
      cargo: "Analista de Calidad",
      familia: "Profesional A",
      origen: "Externo",
      ubicacion: "Oficina Central",
      departamento: "Calidad",
      unidad: "Calidad",
      requiereReferencia: true,
      fechaPostulacion: "2026-09-10",
    },
  ],
  ofertas: [
    {
      id: 1,
      cargo: "Analista de Calidad",
      familia: "Profesional A",
      departamento: "Calidad",
      unidad: "Calidad",
      ubicacion: "Oficina Central",
      modalidad: "Híbrida",
      descripcion: "Apoyo al sistema de gestión de calidad.",
      funciones: "Coordinar auditorías internas.",
      requisitos: "Ingeniería o carrera afín.",
      beneficios: "Seguro complementario.",
      sueldo: "$1.200.000 bruto",
      vacantes: 1,
      fechaPublicacion: "2026-11-03",
      fechaCierre: "2099-12-05",
      estado: "Publicada",
      responsable: "Camila Reyes",
    },
  ],
  solicitudes: [
    {
      id: 1,
      candidatoId: 1,
      ofertaId: 1,
      cargo: "Analista de Calidad",
      familia: "Profesional A",
      fechaSolicitud: "2026-09-14",
      estado: "En proceso",
      responsable: "Camila Reyes",
      prioridad: "Media",
      observaciones: "Seguimiento del proceso.",
      fechaEntrevista: "2026-09-20",
      fechaInforme: "",
      evaluacion: {
        id: 1,
        solicitudId: 1,
        fechaEvaluacion: "2026-09-24",
        resultado: "Apto",
        categoria: "Recomendado",
        observaciones: "Buen análisis crítico y comunicación asertiva.",
        evaluador: "Camila Reyes",
      },
      bitacora: [
        {
          id: 1,
          solicitudId: 1,
          fecha: "2026-09-14",
          estadoAnterior: null,
          estadoNuevo: "Pendiente",
          responsable: "Sistema",
        },
      ],
      analisis: ANALISIS_DEMO,
      postulacion: {
        id: 5,
        folio: "AQ-2026-ABC123",
        carpeta: "CV-2026-000005-VALENTINA-ROJAS",
        archivo: {
          nombreOriginal: "cv-valentina.pdf",
          tamano: 1024,
        },
      },
    },
  ],
  evaluaciones: [
    {
      id: 1,
      solicitudId: 1,
      fechaEvaluacion: "2026-09-24",
      resultado: "Apto",
      categoria: "Recomendado",
      observaciones: "Buen análisis crítico y comunicación asertiva.",
      evaluador: "Camila Reyes",
    },
  ],
  bitacora: [
    {
      id: 1,
      solicitudId: 1,
      fecha: "2026-09-14",
      estadoAnterior: null,
      estadoNuevo: "Pendiente",
      responsable: "Sistema",
    },
  ],
  postulaciones: [
    {
      id: 5,
      folio: "AQ-2026-ABC123",
      candidatoId: 1,
      ofertaId: 1,
      fecha: "2026-11-10",
      estado: "Recibida",
      tieneCv: true,
      carpeta: "CV-2026-000005-VALENTINA-ROJAS",
      archivo: { nombreOriginal: "cv-valentina.pdf", mime: "application/pdf" },
      candidato: { id: 1, nombre: "Valentina Rojas", correo: "valentina.rojas@correo.cl" },
      oferta: { id: 1, cargo: "Analista de Calidad", departamento: "Calidad" },
    },
  ],
  iaEstado: {
    proveedor: "Groq",
    configurada: true,
    modelo: "openai/gpt-oss-120b",
  },
};

export function crearServicioFalso(overrides = {}) {
  return {
    modo: "api",
    refrescarSesion: vi.fn().mockResolvedValue(USUARIO_DEMO),
    iniciarSesion: vi.fn().mockResolvedValue(USUARIO_DEMO),
    cerrarSesion: vi.fn().mockResolvedValue(undefined),
    cargarOfertasPublicas: vi.fn().mockResolvedValue([DATOS_DEMO.ofertas[0]]),
    cargarTodo: vi.fn().mockResolvedValue(DATOS_DEMO),
    peticion: vi.fn().mockResolvedValue({ datos: {} }),
    postularPublico: vi.fn().mockResolvedValue({
      folio: "AQ-2026-ABC123",
      carpeta: "CV-2026-000009-NUEVA-PERSONA",
      oferta: { id: 1, cargo: "Analista de Calidad" },
    }),
    analizarIa: vi.fn().mockResolvedValue(ANALISIS_DEMO),
    revisarIa: vi.fn().mockResolvedValue({
      ...ANALISIS_DEMO,
      pendienteRevision: false,
      revisadoPor: "Camila Reyes",
    }),
    descargarCv: vi
      .fn()
      .mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" })),
    ...overrides,
  };
}
