import { describe, expect, it } from "vitest";
import { PERMISOS, estadoInicial, reducer, siguienteId } from "./motorEstado.js";

describe("siguienteId", () => {
  it("devuelve el siguiente id disponible", () => {
    expect(siguienteId([{ id: 1 }, { id: 5 }])).toBe(6);
    expect(siguienteId([])).toBe(1);
  });
});

describe("reducer: candidatos", () => {
  it("agrega un candidato con id correlativo", () => {
    const estado = reducer(estadoInicial, {
      type: "agregar-candidato",
      datos: { nombre: "Nuevo", correo: "n@x.cl" },
    });
    const ultimo = estado.candidatos[estado.candidatos.length - 1];
    expect(ultimo.id).toBe(11);
    expect(ultimo.nombre).toBe("Nuevo");
  });

  it("actualiza un candidato existente", () => {
    const estado = reducer(estadoInicial, {
      type: "actualizar-candidato",
      id: 1,
      datos: { nombre: "Modificado" },
    });
    expect(estado.candidatos.find((c) => c.id === 1).nombre).toBe("Modificado");
  });

  it("elimina el candidato y sus solicitudes, evaluaciones y bitácora", () => {
    const estado = reducer(estadoInicial, { type: "eliminar-candidato", id: 1 });
    expect(estado.candidatos.find((c) => c.id === 1)).toBeUndefined();
    expect(estado.solicitudes.find((s) => s.candidatoId === 1)).toBeUndefined();
    expect(estado.evaluaciones.find((e) => e.solicitudId === 1)).toBeUndefined();
    expect(estado.bitacora.find((b) => b.solicitudId === 1)).toBeUndefined();
  });
});

describe("reducer: solicitudes", () => {
  it("crea una solicitud pendiente y registra su bitácora", () => {
    const estado = reducer(estadoInicial, {
      type: "crear-solicitud",
      datos: {
        candidatoId: 9,
        cargo: "Ingeniero",
        familia: "Profesional A",
        fechaSolicitud: "2026-10-20",
        responsable: "Valeria Ospina",
      },
    });
    const nueva = estado.solicitudes[estado.solicitudes.length - 1];
    expect(nueva.estado).toBe("Pendiente");
    const registro = estado.bitacora[estado.bitacora.length - 1];
    expect(registro.solicitudId).toBe(nueva.id);
    expect(registro.estadoNuevo).toBe("Pendiente");
  });

  it("cambia el estado y agrega un registro en la bitácora", () => {
    const estado = reducer(estadoInicial, {
      type: "cambiar-estado",
      id: 4,
      estado: "En proceso",
      responsable: "Héctor Bustos",
      fecha: "2026-10-20",
    });
    expect(estado.solicitudes.find((s) => s.id === 4).estado).toBe("En proceso");
    const registro = estado.bitacora.find(
      (b) => b.solicitudId === 4 && b.estadoNuevo === "En proceso"
    );
    expect(registro.estadoAnterior).toBe("Pendiente");
  });

  it("no registra bitácora si el estado no cambia", () => {
    const antes = estadoInicial.bitacora.length;
    const estado = reducer(estadoInicial, {
      type: "cambiar-estado",
      id: 4,
      estado: "Pendiente",
      responsable: "X",
    });
    expect(estado.bitacora).toHaveLength(antes);
  });

  it("actualiza los campos de una solicitud", () => {
    const estado = reducer(estadoInicial, {
      type: "actualizar-solicitud",
      id: 2,
      datos: { fechaInforme: "2026-10-20" },
    });
    expect(estado.solicitudes.find((s) => s.id === 2).fechaInforme).toBe("2026-10-20");
  });
});

describe("reducer: evaluaciones", () => {
  it("crea una evaluación nueva cuando no existe", () => {
    const estado = reducer(estadoInicial, {
      type: "guardar-evaluacion",
      solicitudId: 2,
      datos: { resultado: "Apto", categoria: "Recomendado", observaciones: "Texto suficientemente largo." },
    });
    const creada = estado.evaluaciones.find((e) => e.solicitudId === 2);
    expect(creada.resultado).toBe("Apto");
  });

  it("actualiza una evaluación existente", () => {
    const estado = reducer(estadoInicial, {
      type: "guardar-evaluacion",
      solicitudId: 1,
      datos: { resultado: "No apto" },
    });
    const evaluacion = estado.evaluaciones.find((e) => e.solicitudId === 1);
    expect(evaluacion.resultado).toBe("No apto");
    expect(estado.evaluaciones.filter((e) => e.solicitudId === 1)).toHaveLength(1);
  });
});

describe("reducer: perfil", () => {
  it("cambia el perfil activo", () => {
    const estado = reducer(estadoInicial, { type: "cambiar-perfil", perfil: "evaluador" });
    expect(estado.perfilActivo).toBe("evaluador");
  });
});

describe("PERMISOS", () => {
  it("el analista gestiona candidatos y solicitudes pero no evaluaciones", () => {
    expect(PERMISOS.analista.crearCandidato).toBe(true);
    expect(PERMISOS.analista.crearSolicitud).toBe(true);
    expect(PERMISOS.analista.editarEvaluacion).toBe(false);
  });

  it("el evaluador edita evaluaciones pero no candidatos", () => {
    expect(PERMISOS.evaluador.editarEvaluacion).toBe(true);
    expect(PERMISOS.evaluador.cambiarEstado).toBe(true);
    expect(PERMISOS.evaluador.crearCandidato).toBe(false);
  });

  it("la jefatura es de solo consulta", () => {
    Object.values(PERMISOS.jefatura).forEach((valor) => expect(valor).toBe(false));
  });
});
