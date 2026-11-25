import { describe, expect, it } from "vitest";
import {
  candidatosFiltrados,
  contarPorEstado,
  distribucionPorFamilia,
  ofertaVigente,
  ofertasFiltradas,
  ofertasPublicadas,
  postulacionesDeOferta,
  promedioDiasInforme,
  resumenEstados,
  resumenPortal,
  solicitudesFiltradas,
  tasaRecomendacion,
  vacantesDisponibles,
} from "./selectores.js";

const candidatos = [
  { id: 1, nombre: "Ana Pérez", cargo: "Analista", correo: "a@x.cl", familia: "Profesional A", origen: "Externo" },
  { id: 2, nombre: "Luis Soto", cargo: "Técnico", correo: "l@x.cl", familia: "Técnico A", origen: "Interno" },
  { id: 3, nombre: "Ana Ruiz", cargo: "Jefe", correo: "ar@x.cl", familia: "Jefatura", origen: "Externo" },
];

const solicitudes = [
  { id: 1, candidatoId: 1, cargo: "Analista", familia: "Profesional A", estado: "Finalizada", responsable: "Valeria Ospina", fechaSolicitud: "2026-09-14", fechaInforme: "2026-09-24" },
  { id: 2, candidatoId: 2, cargo: "Técnico", familia: "Técnico A", estado: "En proceso", responsable: "Héctor Bustos", fechaSolicitud: "2026-09-16", fechaInforme: "" },
  { id: 3, candidatoId: 3, cargo: "Jefe", familia: "Jefatura", estado: "Finalizada", responsable: "Valeria Ospina", fechaSolicitud: "2026-09-18", fechaInforme: "2026-09-26" },
];

const obtenerCandidato = (id) => candidatos.find((c) => c.id === Number(id));

describe("contarPorEstado y resumenEstados", () => {
  it("cuenta las solicitudes por estado", () => {
    expect(contarPorEstado(solicitudes, "Finalizada")).toBe(2);
    expect(contarPorEstado(solicitudes, "Pendiente")).toBe(0);
  });

  it("resume los tres estados", () => {
    const resumen = resumenEstados(solicitudes);
    expect(resumen).toHaveLength(3);
    expect(resumen.find((r) => r.estado === "Finalizada").cantidad).toBe(2);
  });
});

describe("promedioDiasInforme", () => {
  it("promedia los días entre solicitud e informe de las finalizadas", () => {
    expect(promedioDiasInforme(solicitudes)).toBe(9);
  });

  it("devuelve null si no hay informes", () => {
    expect(promedioDiasInforme([{ estado: "Pendiente", fechaSolicitud: "2026-10-01" }])).toBeNull();
  });
});

describe("tasaRecomendacion", () => {
  it("calcula el porcentaje de evaluaciones aptas", () => {
    const evaluaciones = [
      { resultado: "Apto" },
      { resultado: "Apto con observaciones" },
      { resultado: "No apto" },
    ];
    expect(tasaRecomendacion(evaluaciones)).toBe(33);
  });

  it("devuelve null sin evaluaciones con resultado", () => {
    expect(tasaRecomendacion([])).toBeNull();
  });
});

describe("distribucionPorFamilia", () => {
  it("agrupa candidatos por familia y ordena de mayor a menor", () => {
    const conDuplicado = [...candidatos, { ...candidatos[0] }];
    const dist = distribucionPorFamilia(conDuplicado);
    expect(dist[0]).toEqual({ familia: "Profesional A", cantidad: 2 });
    expect(dist).toHaveLength(3);
  });
});

describe("candidatosFiltrados", () => {
  it("filtra por texto en nombre o cargo", () => {
    expect(candidatosFiltrados(candidatos, { texto: "ana" })).toHaveLength(2);
  });

  it("filtra por familia y origen combinados", () => {
    const resultado = candidatosFiltrados(candidatos, {
      familia: "Profesional A",
      origen: "Externo",
    });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nombre).toBe("Ana Pérez");
  });

  it("devuelve todo si no hay filtros", () => {
    expect(candidatosFiltrados(candidatos, {})).toHaveLength(3);
  });
});

describe("solicitudesFiltradas", () => {
  it("filtra por estado", () => {
    const resultado = solicitudesFiltradas(solicitudes, { estado: "Finalizada" }, obtenerCandidato);
    expect(resultado).toHaveLength(2);
  });

  it("filtra por responsable", () => {
    const resultado = solicitudesFiltradas(solicitudes, { responsable: "Héctor Bustos" }, obtenerCandidato);
    expect(resultado).toHaveLength(1);
  });

  it("filtra por rango de fechas", () => {
    const resultado = solicitudesFiltradas(solicitudes, { desde: "2026-09-16", hasta: "2026-09-18" }, obtenerCandidato);
    expect(resultado).toHaveLength(2);
  });

  it("filtra por texto usando el nombre del candidato", () => {
    const resultado = solicitudesFiltradas(solicitudes, { texto: "luis" }, obtenerCandidato);
    expect(resultado).toHaveLength(1);
  });
});

describe("ofertas y portal público", () => {
  const ofertas = [
    { id: 1, cargo: "Técnico", familia: "Técnico A", ubicacion: "Planta", unidad: "Mantenimiento", vacantes: 2, estado: "Publicada", fechaCierre: "2099-01-01" },
    { id: 2, cargo: "Analista", familia: "Profesional A", ubicacion: "Oficina", unidad: "Calidad", vacantes: 1, estado: "Publicada", fechaCierre: "2020-01-01" },
    { id: 3, cargo: "Operario", familia: "Operario Calificado", ubicacion: "Planta", unidad: "Logística", vacantes: 3, estado: "Cerrada", fechaCierre: "2099-01-01" },
  ];

  it("determina si una oferta está vigente por estado y fecha", () => {
    expect(ofertaVigente(ofertas[0], "2026-11-14")).toBe(true);
    expect(ofertaVigente(ofertas[1], "2026-11-14")).toBe(false);
    expect(ofertaVigente(ofertas[2], "2026-11-14")).toBe(false);
  });

  it("lista y filtra solo ofertas publicadas y vigentes", () => {
    expect(ofertasPublicadas(ofertas)).toHaveLength(1);
    expect(ofertasFiltradas(ofertas, { texto: "técnico" })).toHaveLength(1);
    expect(ofertasFiltradas(ofertas, { familia: "Profesional A" })).toHaveLength(0);
  });

  it("cuenta vacantes, postulaciones y resume el portal", () => {
    expect(vacantesDisponibles(ofertas)).toBe(2);
    const solicitudes = [
      { id: 1, ofertaId: 1, candidatoId: 1 },
      { id: 2, ofertaId: 2, candidatoId: 2 },
      { id: 3, ofertaId: 1, candidatoId: 3 },
    ];
    expect(postulacionesDeOferta(solicitudes, 1)).toHaveLength(2);
    expect(resumenPortal(ofertas, solicitudes)).toEqual({
      ofertas: 1,
      vacantes: 2,
      postulaciones: 2,
    });
  });
});
