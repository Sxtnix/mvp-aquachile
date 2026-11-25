import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { crearEntorno, CREDENCIALES } from "./helpers.js";

let entorno;

beforeAll(async () => {
  entorno = await crearEntorno();
});

afterAll(async () => {
  await entorno.db.close();
});

describe("auth", () => {
  it("inicia sesión con credenciales válidas y devuelve access token", async () => {
    const respuesta = await entorno.api
      .post("/api/auth/login")
      .send(CREDENCIALES.ANALISTA);
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.accessToken).toEqual(expect.any(String));
    expect(respuesta.body.usuario).toMatchObject({
      rol: "ANALISTA",
      nombre: "Camila Reyes",
    });
    expect(respuesta.headers["set-cookie"].join(";")).toContain("aq_refresh=");
  });

  it("rechaza credenciales incorrectas y usuarios inexistentes", async () => {
    const incorrecta = await entorno.api
      .post("/api/auth/login")
      .send({ email: "analista@aquachile.cl", password: "mala" });
    expect(incorrecta.status).toBe(401);

    const inexistente = await entorno.api
      .post("/api/auth/login")
      .send({ email: "nadie@aquachile.cl", password: "x" });
    expect(inexistente.status).toBe(401);
  });

  it("valida el formato del correo y la contraseña", async () => {
    const respuesta = await entorno.api
      .post("/api/auth/login")
      .send({ email: "no-es-correo", password: "" });
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.detalles.length).toBeGreaterThan(0);
  });

  it("rechaza cuentas deshabilitadas", async () => {
    await entorno.db.query(
      "UPDATE usuarios SET activo = FALSE WHERE email = $1",
      ["evaluador@aquachile.cl"],
    );
    const respuesta = await entorno.api
      .post("/api/auth/login")
      .send(CREDENCIALES.EVALUADOR);
    expect(respuesta.status).toBe(403);
    await entorno.db.query(
      "UPDATE usuarios SET activo = TRUE WHERE email = $1",
      ["evaluador@aquachile.cl"],
    );
  });

  it("renueva la sesión con la cookie, rota el refresh y permite logout", async () => {
    const agente = request.agent(entorno.app);
    const login = await agente.post("/api/auth/login").send(CREDENCIALES.ANALISTA);
    expect(login.status).toBe(200);

    const refresh = await agente.post("/api/auth/refresh");
    expect(refresh.status).toBe(200);
    expect(refresh.body.accessToken).toBeTruthy();

    const me = await agente
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${refresh.body.accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.usuario.email).toBe("analista@aquachile.cl");

    const logout = await agente.post("/api/auth/logout");
    expect(logout.status).toBe(200);

    const despues = await agente.post("/api/auth/refresh");
    expect(despues.status).toBe(401);
  });

  it("rechaza refresh sin cookie o con cookie inválida", async () => {
    const sinCookie = await entorno.api.post("/api/auth/refresh");
    expect(sinCookie.status).toBe(401);

    const invalida = await entorno.api
      .post("/api/auth/refresh")
      .set("Cookie", "aq_refresh=token-inventado");
    expect(invalida.status).toBe(401);
  });

  it("protege /me con token válido e inválido", async () => {
    const login = await entorno.api
      .post("/api/auth/login")
      .send(CREDENCIALES.EVALUADOR);
    const ok = await entorno.api
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${login.body.accessToken}`);
    expect(ok.status).toBe(200);
    expect(ok.body.usuario.rol).toBe("EVALUADOR");

    const sinToken = await entorno.api.get("/api/auth/me");
    expect(sinToken.status).toBe(401);

    const falso = await entorno.api
      .get("/api/auth/me")
      .set("Authorization", "Bearer token-falso");
    expect(falso.status).toBe(401);

    const esquemaIncorrecto = await entorno.api
      .get("/api/auth/me")
      .set("Authorization", "Basic abc");
    expect(esquemaIncorrecto.status).toBe(401);
  });

  it("logout sin cookie responde igual y limpia la sesión", async () => {
    const respuesta = await entorno.api.post("/api/auth/logout");
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.mensaje).toMatch(/cerrada/i);
  });

  it("me falla si el usuario fue eliminado después del login", async () => {
    const login = await entorno.api
      .post("/api/auth/login")
      .send(CREDENCIALES.JEFATURA);
    await entorno.db.query("UPDATE usuarios SET activo = FALSE WHERE id = $1", [
      login.body.usuario.id,
    ]);
    const respuesta = await entorno.api
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${login.body.accessToken}`);
    expect(respuesta.status).toBe(401);
    await entorno.db.query("UPDATE usuarios SET activo = TRUE WHERE id = $1", [
      login.body.usuario.id,
    ]);
  });
});
