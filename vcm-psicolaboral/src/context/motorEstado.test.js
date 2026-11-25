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

describe("reducer: ofertas", () => {
  it("crea una oferta publicada con id correlativo", () => {
    const estado = reducer(estadoInicial, {
      type: "crear-oferta",
      datos: {
        cargo: "Analista de Datos",
        familia: "Profesional A",
        ubicacion: "Oficina Central",
        unidad: "Calidad",
        vacantes: 1,
        fechaCierre: "2026-12-31",
        responsable: "Héctor Bustos",
        descripcion: "Análisis de datos para la operación.",
        requisitos: "Experiencia en análisis de datos.",
      },
    });
    const nueva = estado.ofertas[estado.ofertas.length - 1];
    expect(nueva.id).toBe(6);
    expect(nueva.estado).toBe("Publicada");
    expect(nueva.vacantes).toBe(1);
  });

  it("actualiza y cambia el estado de una oferta", () => {
    const actualizada = reducer(estadoInicial, {
      type: "actualizar-oferta",
      id: 1,
      datos: { vacantes: 5 },
    });
    expect(actualizada.ofertas.find((o) => o.id === 1).vacantes).toBe(5);

    const cerrada = reducer(estadoInicial, {
      type: "cambiar-estado-oferta",
      id: 1,
      estado: "Cerrada",
    });
    expect(cerrada.ofertas.find((o) => o.id === 1).estado).toBe("Cerrada");
  });
});

describe("reducer: postulación desde el portal público", () => {
  const datos = {
    nombre: "Persona Nueva",
    correo: "persona.nueva@correo.cl",
    telefono: "+56 9 1111 2222",
  };
  const curriculum = { nombre: "cv.pdf", tipo: "application/pdf", tamano: 2048 };

  it("crea candidato, solicitud pendiente y bitácora automáticamente", () => {
    const estado = reducer(estadoInicial, {
      type: "postular-oferta",
      ofertaId: 1,
      solicitudId: 99,
      datos,
      curriculum,
    });

    expect(estado.candidatos).toHaveLength(estadoInicial.candidatos.length + 1);
    const candidato = estado.candidatos.find(
      (c) => c.correo === datos.correo
    );
    expect(candidato.canal).toBe("Portal público");

    const solicitud = estado.solicitudes.find((s) => s.id === 99);
    expect(solicitud.estado).toBe("Pendiente");
    expect(solicitud.ofertaId).toBe(1);
    expect(solicitud.canal).toBe("Portal público");
    expect(solicitud.curriculum.nombre).toBe("cv.pdf");
    expect(solicitud.responsable).toBe(
      estadoInicial.ofertas.find((o) => o.id === 1).responsable
    );

    const registro = estado.bitacora[estado.bitacora.length - 1];
    expect(registro.solicitudId).toBe(99);
    expect(registro.responsable).toBe("Portal público");
  });

  it("reutiliza el candidato cuando el correo ya existe", () => {
    const estado = reducer(estadoInicial, {
      type: "postular-oferta",
      ofertaId: 2,
      solicitudId: 100,
      datos: {
        nombre: "Valentina Rojas",
        correo: "valentina.rojas@correo.cl",
        telefono: "+56 9 8123 4455",
      },
      curriculum,
    });

    expect(estado.candidatos).toHaveLength(estadoInicial.candidatos.length);
    const solicitud = estado.solicitudes.find((s) => s.id === 100);
    expect(solicitud.candidatoId).toBe(1);
  });

  it("no duplica la postulación del mismo correo a la misma oferta", () => {
    const primera = reducer(estadoInicial, {
      type: "postular-oferta",
      ofertaId: 1,
      solicitudId: 101,
      datos: {
        nombre: "Valentina Rojas",
        correo: "valentina.rojas@correo.cl",
        telefono: "+56 9 8123 4455",
      },
      curriculum,
    });

    const segunda = reducer(primera, {
      type: "postular-oferta",
      ofertaId: 1,
      solicitudId: 102,
      datos: {
        nombre: "Valentina Rojas",
        correo: "valentina.rojas@correo.cl",
        telefono: "+56 9 8123 4455",
      },
      curriculum,
    });

    expect(segunda.solicitudes).toHaveLength(primera.solicitudes.length);
  });

  it("rechaza postulaciones a ofertas cerradas", () => {
    const estado = reducer(estadoInicial, {
      type: "postular-oferta",
      ofertaId: 4,
      solicitudId: 103,
      datos,
      curriculum,
    });
    expect(estado).toBe(estadoInicial);
  });
});
