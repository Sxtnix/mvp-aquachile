import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { crearEntorno, iniciarSesion } from "./helpers.js";

let entorno;
let analista;
let evaluador;

beforeAll(async () => {
  entorno = await crearEntorno();
  analista = await iniciarSesion(entorno.api, "ANALISTA");
  evaluador = await iniciarSesion(entorno.api, "EVALUADOR");
});

afterAll(async () => {
  await entorno.db.close();
});

const nuevoCandidato = {
  nombre: "Prueba Automatizada",
  correo: "prueba.automatizada@correo.cl",
  telefono: "+56 9 1111 2222",
  cargo: "Analista de Calidad",
  familia: "Profesional A",
  origen: "Externo",
  ubicacion: "Oficina Central",
  departamento: "Calidad",
  requiereReferencia: true,
  fechaPostulacion: "2026-11-10",
};

describe("CRUD de candidatos", () => {
  it("lista y filtra candidatos", async () => {
    const todos = await entorno.api
      .get("/api/candidatos")
      .set(analista.cabecera);
    expect(todos.status).toBe(200);
    expect(todos.body.total).toBeGreaterThanOrEqual(10);

    const filtrado = await entorno.api
      .get("/api/candidatos?q=Valentina&familia=Profesional%20A&origen=Externo")
      .set(analista.cabecera);
    expect(filtrado.status).toBe(200);
    expect(filtrado.body.datos).toHaveLength(1);
    expect(filtrado.body.datos[0].departamento).toBe("Calidad");
  });

  it("crea, consulta, actualiza y elimina un candidato", async () => {
    const creado = await entorno.api
      .post("/api/candidatos")
      .set(analista.cabecera)
      .send(nuevoCandidato);
    expect(creado.status).toBe(201);
    const id = creado.body.datos.id;

    const detalle = await entorno.api
      .get(`/api/candidatos/${id}`)
      .set(evaluador.cabecera);
    expect(detalle.status).toBe(200);
    expect(detalle.body.datos.nombre).toBe(nuevoCandidato.nombre);

    const actualizado = await entorno.api
      .put(`/api/candidatos/${id}`)
      .set(analista.cabecera)
      .send({ ...nuevoCandidato, telefono: "+56 9 3333 4444" });
    expect(actualizado.status).toBe(200);
    expect(actualizado.body.datos.telefono).toBe("+56 9 3333 4444");

    const eliminado = await entorno.api
      .delete(`/api/candidatos/${id}`)
      .set(analista.cabecera);
    expect(eliminado.status).toBe(200);

    const inexistente = await entorno.api
      .get(`/api/candidatos/${id}`)
      .set(analista.cabecera);
    expect(inexistente.status).toBe(404);
  });

  it("impide que un evaluador cree o elimine candidatos", async () => {
    const crear = await entorno.api
      .post("/api/candidatos")
      .set(evaluador.cabecera)
      .send(nuevoCandidato);
    expect(crear.status).toBe(403);

    const eliminar = await entorno.api
      .delete("/api/candidatos/1")
      .set(evaluador.cabecera);
    expect(eliminar.status).toBe(403);
  });

  it("valida los datos y detecta correos duplicados", async () => {
    const invalido = await entorno.api
      .post("/api/candidatos")
      .set(analista.cabecera)
      .send({ ...nuevoCandidato, nombre: "A", correo: "malo" });
    expect(invalido.status).toBe(400);
    expect(invalido.body.detalles.length).toBeGreaterThanOrEqual(2);

    const duplicado = await entorno.api
      .post("/api/candidatos")
      .set(analista.cabecera)
      .send({
        ...nuevoCandidato,
        correo: "valentina.rojas@correo.cl",
      });
    expect(duplicado.status).toBe(409);
  });

  it("responde 404 y 400 en rutas con identificadores inválidos", async () => {
    const noExiste = await entorno.api
      .put("/api/candidatos/9999")
      .set(analista.cabecera)
      .send(nuevoCandidato);
    expect(noExiste.status).toBe(404);

    const malId = await entorno.api
      .get("/api/candidatos/abc")
      .set(analista.cabecera);
    expect(malId.status).toBe(400);

    const borrarInexistente = await entorno.api
      .delete("/api/candidatos/9999")
      .set(analista.cabecera);
    expect(borrarInexistente.status).toBe(404);
  });

  it("requiere autenticación para listar candidatos", async () => {
    const respuesta = await entorno.api.get("/api/candidatos");
    expect(respuesta.status).toBe(401);
  });
});
