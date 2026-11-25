import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { crearEntorno, iniciarSesion } from "./helpers.js";

let entorno;
let analista;
let evaluador;
let jefatura;

beforeAll(async () => {
  entorno = await crearEntorno();
  analista = await iniciarSesion(entorno.api, "ANALISTA");
  evaluador = await iniciarSesion(entorno.api, "EVALUADOR");
  jefatura = await iniciarSesion(entorno.api, "JEFATURA");
});

afterAll(async () => {
  await entorno.db.close();
});

describe("dashboard", () => {
  it("entrega métricas completas al analista", async () => {
    const respuesta = await entorno.api
      .get("/api/dashboard")
      .set(analista.cabecera);
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.resumen).toMatchObject({
      candidatos: 10,
      ofertasPublicadas: 3,
      ofertasBorrador: 1,
      ofertasCerradas: 1,
      solicitudesPendientes: 3,
      solicitudesEnProceso: 3,
      solicitudesFinalizadas: 2,
      evaluaciones: 3,
    });
    expect(respuesta.body.ofertasPorEstado).toHaveLength(3);
    expect(respuesta.body.solicitudesPorEstado).toHaveLength(3);
    expect(respuesta.body.ultimasSolicitudes).toHaveLength(5);
    expect(respuesta.body.ultimasSolicitudes[0].candidato.nombre).toBeTruthy();
    expect(respuesta.body.postulacionesPorOferta.length).toBeGreaterThan(0);
  });

  it("filtra las métricas del evaluador por sus solicitudes", async () => {
    await entorno.db.query(
      "UPDATE solicitudes SET responsable = 'Otra Persona' WHERE id IN (1,2)",
    );
    const respuesta = await entorno.api
      .get("/api/dashboard")
      .set(evaluador.cabecera);
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.resumen.solicitudesPendientes).toBe(3);
    expect(respuesta.body.resumen.solicitudesFinalizadas).toBe(1);
    expect(respuesta.body.ultimasSolicitudes.every((s) => s.responsable === "Valeria Ospina")).toBe(
      true,
    );
    await entorno.db.query(
      "UPDATE solicitudes SET responsable = 'Valeria Ospina' WHERE id IN (1,2)",
    );
  });

  it("permite consulta a jefatura y exige autenticación", async () => {
    const jefe = await entorno.api.get("/api/dashboard").set(jefatura.cabecera);
    expect(jefe.status).toBe(200);

    const anonimo = await entorno.api.get("/api/dashboard");
    expect(anonimo.status).toBe(401);
  });
});

describe("salud, documentación y errores", () => {
  it("expone el estado del servicio y OpenAPI", async () => {
    const salud = await entorno.api.get("/api/health");
    expect(salud.status).toBe(200);
    expect(salud.body).toMatchObject({ estado: "ok", baseDatos: "pglite" });

    const openapi = await entorno.api.get("/api/openapi.json");
    expect(openapi.status).toBe(200);
    expect(openapi.body.info.title).toContain("AquaChile");
    expect(openapi.body.paths["/solicitudes/{id}/analisis"]).toBeTruthy();
    expect(openapi.body.components.securitySchemes.bearerAuth).toBeTruthy();

    const docs = await entorno.api.get("/api/docs/");
    expect(docs.status).toBe(200);
    expect(docs.text).toContain("swagger-ui");
  });

  it("responde 404 en rutas desconocidas", async () => {
    const respuesta = await entorno.api.get("/api/no-existe");
    expect(respuesta.status).toBe(404);
    expect(respuesta.body.error).toMatch(/Ruta no encontrada/);
  });

  it("responde 400 ante JSON malformado", async () => {
    const respuesta = await entorno.api
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email":');
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toMatch(/JSON/i);
  });

  it("rechaza orígenes no permitidos por CORS", async () => {
    const respuesta = await entorno.api
      .get("/api/health")
      .set("Origin", "http://sitio-malicioso.cl");
    expect(respuesta.status).toBe(500);
  });

  it("acepta el origen del frontend local", async () => {
    const respuesta = await entorno.api
      .get("/api/health")
      .set("Origin", "http://localhost:5173");
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers["access-control-allow-credentials"]).toBe("true");
  });
});
