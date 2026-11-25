import request from "supertest";
import { createDatabase } from "../src/db/index.js";
import { prepararDb } from "../src/db/migrate.js";
import { createApp } from "../src/app.js";

export const CREDENCIALES = {
  ANALISTA: { email: "analista@aquachile.cl", password: "AquaChile2026!" },
  EVALUADOR: { email: "evaluador@aquachile.cl", password: "AquaChile2026!" },
  JEFATURA: { email: "jefatura@aquachile.cl", password: "AquaChile2026!" },
};

export async function crearEntorno({ seedData = true } = {}) {
  const db = await createDatabase({ memory: true });
  await prepararDb(db, { seedData });
  const app = await createApp({ db });
  return { db, app, api: request(app) };
}

export async function iniciarSesion(api, rol = "ANALISTA") {
  const credenciales = CREDENCIALES[rol];
  const respuesta = await api.post("/api/auth/login").send(credenciales);
  return {
    respuesta,
    token: respuesta.body.accessToken,
    usuario: respuesta.body.usuario,
    cabecera: { Authorization: `Bearer ${respuesta.body.accessToken}` },
  };
}

export const PDF_MINIMO = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF",
);

export const DOCX_MINIMO = Buffer.from([
  0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00,
]);
