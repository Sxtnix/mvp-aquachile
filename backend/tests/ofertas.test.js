import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { crearEntorno, iniciarSesion } from "./helpers.js";

let entorno;
let analista;
let evaluador;

const ofertaBase = {
  cargo: "Técnico de Laboratorio",
  familia: "Técnico A",
  departamento: "Calidad",
  ubicacion: "Oficina Central",
  modalidad: "Híbrida",
  descripcion: "Control de muestras y análisis de laboratorio en planta.",
  funciones: "Tomar muestras.\nRegistrar resultados de análisis.",
  requisitos: "Técnico en laboratorio químico.\nExperiencia de 1 año.",
  beneficios: "Seguro complementario.\nCapacitación continua.",
  sueldo: "$800.000 líquido",
  vacantes: 2,
  fechaCierre: "2026-12-31",
  estado: "Borrador",
  responsable: "Camila Reyes",
};

beforeAll(async () => {
  entorno = await crearEntorno();
  analista = await iniciarSesion(entorno.api, "ANALISTA");
  evaluador = await iniciarSesion(entorno.api, "EVALUADOR");
});

afterAll(async () => {
  await entorno.db.close();
});

describe("CRUD de ofertas", () => {
  it("lista ofertas con filtros y obtiene el detalle", async () => {
    const lista = await entorno.api.get("/api/ofertas").set(analista.cabecera);
    expect(lista.status).toBe(200);
    expect(lista.body.total).toBe(5);

    const filtrada = await entorno.api
      .get("/api/ofertas?estado=Publicada&familia=Profesional%20A&q=Calidad")
      .set(analista.cabecera);
    expect(filtrada.status).toBe(200);
    expect(filtrada.body.datos).toHaveLength(1);

    const modalidad = await entorno.api
      .get("/api/ofertas?modalidad=H%C3%ADbrida")
      .set(analista.cabecera);
    expect(modalidad.body.datos.length).toBeGreaterThan(0);

    const detalle = await entorno.api
      .get("/api/ofertas/1")
      .set(evaluador.cabecera);
    expect(detalle.status).toBe(200);
    expect(detalle.body.datos).toMatchObject({
      cargo: "Técnico de Mantenimiento",
      modalidad: "Presencial",
      departamento: "Mantenimiento",
    });
    expect(detalle.body.datos.funciones).toContain("mantenciones");
    expect(detalle.body.datos.beneficios).toBeTruthy();
    expect(detalle.body.datos.sueldo).toBeTruthy();
  });

  it("crea una oferta en borrador y la publica con fecha automática", async () => {
    const creada = await entorno.api
      .post("/api/ofertas")
      .set(analista.cabecera)
      .send(ofertaBase);
    expect(creada.status).toBe(201);
    expect(creada.body.datos.estado).toBe("Borrador");
    expect(creada.body.datos.fechaPublicacion).toBeNull();
    const id = creada.body.datos.id;

    const publicada = await entorno.api
      .patch(`/api/ofertas/${id}/estado`)
      .set(analista.cabecera)
      .send({ estado: "Publicada" });
    expect(publicada.status).toBe(200);
    expect(publicada.body.datos.estado).toBe("Publicada");
    expect(publicada.body.datos.fechaPublicacion).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const cerrada = await entorno.api
      .patch(`/api/ofertas/${id}/estado`)
      .set(analista.cabecera)
      .send({ estado: "Cerrada" });
    expect(cerrada.status).toBe(200);
    expect(cerrada.body.datos.fechaPublicacion).toBe(
      publicada.body.datos.fechaPublicacion,
    );

    const actualizada = await entorno.api
      .put(`/api/ofertas/${id}`)
      .set(analista.cabecera)
      .send({ ...ofertaBase, vacantes: 5, estado: "Publicada" });
    expect(actualizada.status).toBe(200);
    expect(actualizada.body.datos.vacantes).toBe(5);

    const eliminada = await entorno.api
      .delete(`/api/ofertas/${id}`)
      .set(analista.cabecera);
    expect(eliminada.status).toBe(200);
  });

  it("crea una oferta publicada con fecha si no se entrega", async () => {
    const creada = await entorno.api
      .post("/api/ofertas")
      .set(analista.cabecera)
      .send({
        ...ofertaBase,
        cargo: "Operador de Planta",
        estado: "Publicada",
        fechaPublicacion: "",
      });
    expect(creada.status).toBe(201);
    expect(creada.body.datos.fechaPublicacion).toBeTruthy();
    await entorno.api.delete(`/api/ofertas/${creada.body.datos.id}`).set(analista.cabecera);
  });

  it("valida campos obligatorios y permisos de rol", async () => {
    const invalida = await entorno.api
      .post("/api/ofertas")
      .set(analista.cabecera)
      .send({ ...ofertaBase, cargo: "", modalidad: "Teletrabajo" });
    expect(invalida.status).toBe(400);

    const sinPermiso = await entorno.api
      .post("/api/ofertas")
      .set(evaluador.cabecera)
      .send(ofertaBase);
    expect(sinPermiso.status).toBe(403);

    const patchSinPermiso = await entorno.api
      .patch("/api/ofertas/1/estado")
      .set(evaluador.cabecera)
      .send({ estado: "Cerrada" });
    expect(patchSinPermiso.status).toBe(403);

    const estadoInvalido = await entorno.api
      .patch("/api/ofertas/1/estado")
      .set(analista.cabecera)
      .send({ estado: "Archivada" });
    expect(estadoInvalido.status).toBe(400);
  });

  it("responde 404 para ofertas inexistentes", async () => {
    const detalle = await entorno.api
      .get("/api/ofertas/9999")
      .set(analista.cabecera);
    expect(detalle.status).toBe(404);

    const patch = await entorno.api
      .patch("/api/ofertas/9999/estado")
      .set(analista.cabecera)
      .send({ estado: "Cerrada" });
    expect(patch.status).toBe(404);

    const put = await entorno.api
      .put("/api/ofertas/9999")
      .set(analista.cabecera)
      .send(ofertaBase);
    expect(put.status).toBe(404);

    const del = await entorno.api
      .delete("/api/ofertas/9999")
      .set(analista.cabecera);
    expect(del.status).toBe(404);
  });

  it("lista postulaciones de una oferta e impide borrar ofertas con postulaciones", async () => {
    await entorno.db.query(
      `INSERT INTO postulaciones (folio, oferta_id, candidato_id, fecha, consentimiento)
       VALUES ('AQ-TEST-0001', 1, 1, '2026-11-01', TRUE)`,
    );

    const postulaciones = await entorno.api
      .get("/api/ofertas/1/postulaciones")
      .set(evaluador.cabecera);
    expect(postulaciones.status).toBe(200);
    expect(postulaciones.body.total).toBe(1);

    const eliminar = await entorno.api
      .delete("/api/ofertas/1")
      .set(analista.cabecera);
    expect(eliminar.status).toBe(409);

    const jefatura = await iniciarSesion(entorno.api, "JEFATURA");
    const sinPermiso = await entorno.api
      .get("/api/ofertas/1/postulaciones")
      .set(jefatura.cabecera);
    expect(sinPermiso.status).toBe(403);
  });
});
