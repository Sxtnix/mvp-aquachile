import { describe, expect, it } from "vitest";
import {
  esCorreoValido,
  esTelefonoValido,
  hayErrores,
  validarCandidato,
  validarCurriculum,
  validarEvaluacion,
  validarOferta,
  validarPostulacionPublica,
  validarSolicitud,
} from "./validaciones.js";

describe("esCorreoValido", () => {
  it("acepta un correo bien formado", () => {
    expect(esCorreoValido(" persona@correo.cl ")).toBe(true);
  });

  it("rechaza correos sin arroba o sin dominio", () => {
    expect(esCorreoValido("sin-arroba")).toBe(false);
    expect(esCorreoValido("a@b")).toBe(false);
    expect(esCorreoValido("")).toBe(false);
  });
});

describe("esTelefonoValido", () => {
  it("acepta teléfonos con código de país y espacios", () => {
    expect(esTelefonoValido("+56 9 1234 5678")).toBe(true);
    expect(esTelefonoValido("912345678")).toBe(true);
  });

  it("rechaza teléfonos con letras o muy cortos", () => {
    expect(esTelefonoValido("no-numerico")).toBe(false);
    expect(esTelefonoValido("123")).toBe(false);
  });
});

describe("validarCandidato", () => {
  const base = {
    nombre: "Persona de Prueba",
    correo: "persona@correo.cl",
    telefono: "+56 9 1111 2222",
    cargo: "Analista",
    familia: "Profesional A",
    origen: "Externo",
    ubicacion: "Oficina Central",
    unidad: "Calidad",
    fechaPostulacion: "2026-10-01",
  };

  it("no marca errores con datos válidos", () => {
    expect(hayErrores(validarCandidato(base))).toBe(false);
  });

  it("exige todos los campos obligatorios", () => {
    const errores = validarCandidato({});
    ["nombre", "correo", "telefono", "cargo", "familia", "origen", "ubicacion", "unidad", "fechaPostulacion"].forEach(
      (campo) => expect(errores[campo]).toBeTruthy()
    );
  });

  it("rechaza un correo duplicado", () => {
    const candidatos = [{ id: 1, correo: "persona@correo.cl" }];
    const errores = validarCandidato(base, { candidatos, idActual: 2 });
    expect(errores.correo).toMatch(/ya existe/i);
  });

  it("permite conservar el propio correo al editar", () => {
    const candidatos = [{ id: 1, correo: "persona@correo.cl" }];
    const errores = validarCandidato(base, { candidatos, idActual: 1 });
    expect(errores.correo).toBeUndefined();
  });

  it("rechaza una fecha de postulación futura", () => {
    const errores = validarCandidato({ ...base, fechaPostulacion: "2999-01-01" });
    expect(errores.fechaPostulacion).toMatch(/futura/i);
  });

  it("rechaza nombres muy cortos", () => {
    const errores = validarCandidato({ ...base, nombre: "Ab" });
    expect(errores.nombre).toBeTruthy();
  });
});

describe("validarSolicitud", () => {
  const candidatos = [{ id: 1, cargo: "Analista", familia: "Profesional A" }];
  const base = {
    candidatoId: "1",
    responsable: "Valeria Ospina",
    prioridad: "Media",
    fechaSolicitud: "2026-10-01",
  };

  it("no marca errores con datos válidos", () => {
    expect(hayErrores(validarSolicitud(base, { candidatos, solicitudes: [] }))).toBe(
      false
    );
  });

  it("rechaza un candidato inexistente", () => {
    const errores = validarSolicitud({ ...base, candidatoId: "99" }, { candidatos });
    expect(errores.candidatoId).toBeTruthy();
  });

  it("rechaza un candidato con solicitud activa", () => {
    const solicitudes = [{ candidatoId: 1, estado: "En proceso" }];
    const errores = validarSolicitud(base, { candidatos, solicitudes });
    expect(errores.candidatoId).toMatch(/en curso/i);
  });

  it("permite un candidato cuya solicitud ya fue finalizada", () => {
    const solicitudes = [{ candidatoId: 1, estado: "Finalizada" }];
    expect(hayErrores(validarSolicitud(base, { candidatos, solicitudes }))).toBe(false);
  });

  it("rechaza una fecha de solicitud futura", () => {
    const errores = validarSolicitud(
      { ...base, fechaSolicitud: "2999-01-01" },
      { candidatos, solicitudes: [] }
    );
    expect(errores.fechaSolicitud).toMatch(/futura/i);
  });
});

describe("validarEvaluacion", () => {
  const solicitud = { fechaSolicitud: "2026-10-01" };
  const base = {
    fechaEvaluacion: "2026-10-05",
    resultado: "Apto",
    categoria: "Recomendado",
    observaciones: "Buen desempeño general y actitud colaborativa.",
  };

  it("no marca errores con datos válidos", () => {
    expect(hayErrores(validarEvaluacion(base, { solicitud }))).toBe(false);
  });

  it("exige todos los campos", () => {
    const errores = validarEvaluacion({}, { solicitud });
    ["fechaEvaluacion", "resultado", "categoria", "observaciones"].forEach(
      (campo) => expect(errores[campo]).toBeTruthy()
    );
  });

  it("rechaza la evaluación anterior a la solicitud", () => {
    const errores = validarEvaluacion(
      { ...base, fechaEvaluacion: "2026-09-01" },
      { solicitud }
    );
    expect(errores.fechaEvaluacion).toMatch(/anterior/i);
  });

  it("rechaza el resultado Sin resultado", () => {
    const errores = validarEvaluacion({ ...base, resultado: "Sin resultado" }, { solicitud });
    expect(errores.resultado).toBeTruthy();
  });

  it("exige más detalle cuando el resultado es negativo", () => {
    const errores = validarEvaluacion(
      { ...base, resultado: "No apto", categoria: "No recomendado", observaciones: "Corto." },
      { solicitud }
    );
    expect(errores.observaciones).toBeTruthy();
  });
});

describe("validarOferta", () => {
  const base = {
    cargo: "Técnico de Mantenimiento",
    familia: "Técnico A",
    ubicacion: "Planta Magallanes",
    unidad: "Mantenimiento",
    modalidad: "Presencial",
    vacantes: "2",
    fechaPublicacion: "2026-11-01",
    fechaCierre: "2026-12-15",
    responsable: "Valeria Ospina",
    descripcion: "Mantenimiento preventivo de equipos de planta.",
    funciones: "Ejecutar mantenciones preventivas y correctivas.",
    requisitos: "Experiencia mínima de dos años en mantenimiento industrial.",
  };

  it("acepta una oferta completa", () => {
    expect(hayErrores(validarOferta(base))).toBe(false);
  });

  it("exige vacantes y fechas coherentes", () => {
    const errores = validarOferta({
      ...base,
      vacantes: "0",
      fechaCierre: "2026-10-01",
    });
    expect(errores.vacantes).toBeTruthy();
    expect(errores.fechaCierre).toMatch(/anterior/i);
  });

  it("exige descripción y requisitos", () => {
    const errores = validarOferta({ ...base, descripcion: "", requisitos: "" });
    expect(errores.descripcion).toBeTruthy();
    expect(errores.requisitos).toBeTruthy();
  });
});

describe("validarPostulacionPublica", () => {
  const oferta = { id: 1, estado: "Publicada" };
  const base = {
    nombre: "Persona Postulante",
    correo: "nueva.persona@correo.cl",
    telefono: "+56 9 1234 5678",
    curriculum: { nombre: "cv.pdf", tamano: 2048 },
    consentimiento: true,
  };

  it("acepta una postulación válida", () => {
    expect(
      hayErrores(validarPostulacionPublica(base, { oferta }))
    ).toBe(false);
  });

  it("rechaza ofertas cerradas y datos incompletos", () => {
    const errores = validarPostulacionPublica(
      { nombre: "A", correo: "mal", telefono: "x", curriculum: null },
      { oferta: { id: 2, estado: "Cerrada" } }
    );
    expect(errores.oferta).toBeTruthy();
    expect(errores.nombre).toBeTruthy();
    expect(errores.correo).toBeTruthy();
    expect(errores.telefono).toBeTruthy();
    expect(errores.curriculum).toBeTruthy();
    expect(errores.consentimiento).toBeTruthy();
  });

  it("bloquea dos postulaciones del mismo correo a la misma oferta", () => {
    const errores = validarPostulacionPublica(base, {
      oferta,
      candidatos: [{ id: 1, correo: base.correo }],
      solicitudes: [{ id: 99, ofertaId: 1, candidatoId: 1 }],
    });
    expect(errores.correo).toMatch(/ya recibimos/i);
  });
});

describe("validarCurriculum", () => {
  it("acepta PDF, DOC y DOCX dentro del tamaño", () => {
    expect(validarCurriculum({ nombre: "cv.pdf", tamano: 1024 })).toBe("");
    expect(validarCurriculum({ nombre: "cv.doc", tamano: 1024 })).toBe("");
    expect(validarCurriculum({ nombre: "cv.docx", tamano: 1024 })).toBe("");
  });

  it("rechaza formatos no permitidos y archivos vacíos o muy grandes", () => {
    expect(validarCurriculum({ nombre: "cv.exe", tamano: 1024 })).toMatch(/PDF/i);
    expect(validarCurriculum({ nombre: "cv.pdf", tamano: 0 })).toMatch(/vacío/i);
    expect(
      validarCurriculum({ nombre: "cv.pdf", tamano: 6 * 1024 * 1024 })
    ).toMatch(/5 MB/i);
  });
});
