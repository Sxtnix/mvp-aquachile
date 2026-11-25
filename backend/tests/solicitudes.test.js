import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { crearEntorno, iniciarSesion } from "./helpers.js";

let entorno;
let analista;
let evaluador;
let jefatura;

const nuevaSolicitud = {
  candidatoId: 9,
  responsable: "Valeria Ospina",
  prioridad: "Alta",
  observaciones: "Solicitud creada desde la suite de pruebas automatizadas.",
  fechaEntrevista: "2026-12-01",
  fechaSolicitud: "2026-11-20",
};

beforeAll(async () => {
  entorno = await crearEntorno();
  analista = await iniciarSesion(entorno.api, "ANALISTA");
  evaluador = await iniciarSesion(entorno.api, "EVALUADOR");
  jefatura = await iniciarSesion(entorno.api, "JEFATURA");
});

afterAll(async () => {
  await entorno.db.close();
});

describe("solicitudes y evaluaciones", () => {
  it("filtra las solicitudes según el rol autenticado", async () => {
    const todas = await entorno.api
      .get("/api/solicitudes")
      .set(analista.cabecera);
    expect(todas.status).toBe(200);
    expect(todas.body.total).toBe(8);

    const propias = await entorno.api
      .get("/api/solicitudes")
      .set(evaluador.cabecera);
    expect(propias.body.datos.every((s) => s.responsable === "Valeria Ospina")).toBe(
      true,
    );

    const jefe = await entorno.api.get("/api/solicitudes").set(jefatura.cabecera);
    expect(jefe.status).toBe(200);

    const filtrada = await entorno.api
      .get("/api/solicitudes?estado=Finalizada&prioridad=Alta")
      .set(analista.cabecera);
    expect(filtrada.body.total).toBe(1);

    const busqueda = await entorno.api
      .get("/api/solicitudes?q=Valentina")
      .set(analista.cabecera);
    expect(busqueda.body.total).toBe(1);

    const porResponsable = await entorno.api
      .get("/api/solicitudes?responsable=Valeria%20Ospina")
      .set(analista.cabecera);
    expect(porResponsable.body.datos.length).toBeGreaterThan(0);

    const invalida = await entorno.api
      .get("/api/solicitudes?estado=Nada")
      .set(analista.cabecera);
    expect(invalida.status).toBe(400);
  });

  it("obtiene el detalle con evaluación, bitácora y postulación", async () => {
    const detalle = await entorno.api
      .get("/api/solicitudes/1")
      .set(analista.cabecera);
    expect(detalle.status).toBe(200);
    expect(detalle.body.datos.evaluacion).toMatchObject({
      resultado: "Apto",
      categoria: "Recomendado",
    });
    expect(detalle.body.datos.bitacora).toHaveLength(3);
    expect(detalle.body.datos.candidato.nombre).toBe("Valentina Rojas");
    expect(detalle.body.datos.analisis).toBeNull();
    expect(detalle.body.datos.postulacion).toBeNull();

    const sinPermiso = await entorno.api
      .get("/api/solicitudes/1")
      .set(jefatura.cabecera);
    expect(sinPermiso.status).toBe(200);
  });

  it("crea, actualiza, cambia de estado y elimina una solicitud", async () => {
    const creada = await entorno.api
      .post("/api/solicitudes")
      .set(analista.cabecera)
      .send(nuevaSolicitud);
    expect(creada.status).toBe(201);
    expect(creada.body.datos.estado).toBe("Pendiente");
    expect(creada.body.datos.cargo).toBe("Ingeniero de Procesos");
    const id = creada.body.datos.id;

    const actualizada = await entorno.api
      .put(`/api/solicitudes/${id}`)
      .set(analista.cabecera)
      .send({ ...nuevaSolicitud, prioridad: "Baja", observaciones: "Actualizada." });
    expect(actualizada.status).toBe(200);
    expect(actualizada.body.datos.prioridad).toBe("Baja");

    const enProceso = await entorno.api
      .patch(`/api/solicitudes/${id}/estado`)
      .set(analista.cabecera)
      .send({ estado: "En proceso" });
    expect(enProceso.status).toBe(200);
    expect(enProceso.body.datos.estado).toBe("En proceso");

    const bitacora = await entorno.api
      .get(`/api/solicitudes/${id}/bitacora`)
      .set(analista.cabecera);
    expect(bitacora.body.datos.map((b) => b.estadoNuevo)).toEqual([
      "Pendiente",
      "En proceso",
    ]);

    const eliminada = await entorno.api
      .delete(`/api/solicitudes/${id}`)
      .set(analista.cabecera);
    expect(eliminada.status).toBe(200);

    const inexistente = await entorno.api
      .get(`/api/solicitudes/${id}`)
      .set(analista.cabecera);
    expect(inexistente.status).toBe(404);
  });

  it("crea sin responsable explícito y usa al analista", async () => {
    const creada = await entorno.api
      .post("/api/solicitudes")
      .set(analista.cabecera)
      .send({ ...nuevaSolicitud, responsable: "" });
    expect(creada.status).toBe(201);
    expect(creada.body.datos.responsable).toBe("Camila Reyes");
    await entorno.api
      .delete(`/api/solicitudes/${creada.body.datos.id}`)
      .set(analista.cabecera);
  });

  it("valida candidato existente y datos de entrada", async () => {
    const sinCandidato = await entorno.api
      .post("/api/solicitudes")
      .set(analista.cabecera)
      .send({ ...nuevaSolicitud, candidatoId: 9999 });
    expect(sinCandidato.status).toBe(404);

    const invalida = await entorno.api
      .post("/api/solicitudes")
      .set(analista.cabecera)
      .send({ ...nuevaSolicitud, prioridad: "Urgente" });
    expect(invalida.status).toBe(400);

    const sinPermiso = await entorno.api
      .post("/api/solicitudes")
      .set(evaluador.cabecera)
      .send(nuevaSolicitud);
    expect(sinPermiso.status).toBe(403);
  });

  it("el evaluador asignado registra y finaliza la evaluación", async () => {
    const respuesta = await entorno.api
      .put("/api/solicitudes/2/evaluacion")
      .set(evaluador.cabecera)
      .send({
        fechaEvaluacion: "2026-11-20",
        resultado: "Apto",
        categoria: "Recomendado",
        observaciones: "Evaluación completa con entrevista y pruebas psicolaborales.",
        finalizar: true,
      });
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.datos.resultado).toBe("Apto");

    const detalle = await entorno.api
      .get("/api/solicitudes/2")
      .set(analista.cabecera);
    expect(detalle.body.datos.estado).toBe("Finalizada");
    expect(detalle.body.datos.fechaInforme).toBe("2026-11-20");

    const bitacora = await entorno.api
      .get("/api/solicitudes/2/bitacora")
      .set(analista.cabecera);
    expect(bitacora.body.datos.at(-1).estadoNuevo).toBe("Finalizada");
  });

  it("permite guardar sin finalizar y consultar la evaluación", async () => {
    const respuesta = await entorno.api
      .put("/api/solicitudes/4/evaluacion")
      .set(evaluador.cabecera)
      .send({
        fechaEvaluacion: "2026-11-21",
        resultado: "Apto con observaciones",
        categoria: "Recomendado con observaciones",
        observaciones: "Requiere acompañamiento durante el primer mes.",
        finalizar: false,
      });
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.mensaje).toMatch(/guardada correctamente/i);

    const consulta = await entorno.api
      .get("/api/solicitudes/4/evaluacion")
      .set(analista.cabecera);
    expect(consulta.status).toBe(200);
    expect(consulta.body.datos.resultado).toBe("Apto con observaciones");
  });

  it("rechaza evaluar solicitudes no asignadas o con rol incorrecto", async () => {
    const noAsignada = await entorno.api
      .put("/api/solicitudes/1/evaluacion")
      .set(evaluador.cabecera)
      .send({
        fechaEvaluacion: "2026-11-20",
        resultado: "Apto",
        categoria: "Recomendado",
        observaciones: "Intento no autorizado sobre otra solicitud.",
      });
    expect(noAsignada.status).toBe(200);

    await entorno.db.query(
      "UPDATE solicitudes SET responsable = 'Otra Persona' WHERE id = 1",
    );
    const ajena = await entorno.api
      .get("/api/solicitudes/1")
      .set(evaluador.cabecera);
    expect(ajena.status).toBe(403);

    const analistaEvalua = await entorno.api
      .put("/api/solicitudes/5/evaluacion")
      .set(analista.cabecera)
      .send({
        fechaEvaluacion: "2026-11-20",
        resultado: "Apto",
        categoria: "Recomendado",
        observaciones: "El analista no debe registrar evaluaciones.",
      });
    expect(analistaEvalua.status).toBe(403);

    const datosInvalidos = await entorno.api
      .put("/api/solicitudes/5/evaluacion")
      .set(evaluador.cabecera)
      .send({
        fechaEvaluacion: "2026-11-20",
        resultado: "Apto",
        categoria: "Recomendado",
        observaciones: "corta",
      });
    expect(datosInvalidos.status).toBe(400);
  });

  it("jefatura consulta pero no modifica solicitudes", async () => {
    const lista = await entorno.api.get("/api/solicitudes").set(jefatura.cabecera);
    expect(lista.status).toBe(200);

    const modificar = await entorno.api
      .patch("/api/solicitudes/1/estado")
      .set(jefatura.cabecera)
      .send({ estado: "Pendiente" });
    expect(modificar.status).toBe(403);

    const eliminar = await entorno.api
      .delete("/api/solicitudes/1")
      .set(jefatura.cabecera);
    expect(eliminar.status).toBe(403);
  });

  it("maneja identificadores inválidos y solicitudes inexistentes", async () => {
    const malId = await entorno.api
      .get("/api/solicitudes/abc")
      .set(analista.cabecera);
    expect(malId.status).toBe(400);

    const inexistente = await entorno.api
      .get("/api/solicitudes/9999")
      .set(analista.cabecera);
    expect(inexistente.status).toBe(404);

    const estadoInvalido = await entorno.api
      .patch("/api/solicitudes/1/estado")
      .set(analista.cabecera)
      .send({ estado: "Archivada" });
    expect(estadoInvalido.status).toBe(400);
  });
});
