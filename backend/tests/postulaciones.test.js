import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  crearEntorno,
  iniciarSesion,
  PDF_MINIMO,
} from "./helpers.js";

let entorno;
let analista;
let evaluador;
let jefatura;
let postulacionId;
let folio;

beforeAll(async () => {
  entorno = await crearEntorno();
  analista = await iniciarSesion(entorno.api, "ANALISTA");
  evaluador = await iniciarSesion(entorno.api, "EVALUADOR");
  jefatura = await iniciarSesion(entorno.api, "JEFATURA");

  const creada = await entorno.api
    .post("/api/publico/postulaciones")
    .field("ofertaId", "1")
    .field("nombre", "Valentina Rojas")
    .field("correo", "valentina.rojas@correo.cl")
    .field("telefono", "+56 9 8123 4455")
    .field("consentimiento", "true")
    .attach("curriculum", PDF_MINIMO, {
      filename: "cv-valentina.pdf",
      contentType: "application/pdf",
    });
  expect(creada.status).toBe(201);
  postulacionId = creada.body.datos.id;
  folio = creada.body.datos.folio;

  // La postulación pública crea una solicitud sin asignar; se asigna al evaluador demo.
  await entorno.db.query(
    "UPDATE solicitudes SET responsable = 'Valeria Ospina' WHERE postulacion_id = $1",
    [postulacionId],
  );
});

afterAll(async () => {
  await entorno.db.close();
});

describe("postulaciones y currículum privado", () => {
  it("lista postulaciones con su carpeta y permite filtrar", async () => {
    const lista = await entorno.api
      .get("/api/postulaciones")
      .set(analista.cabecera);
    expect(lista.status).toBe(200);
    expect(lista.body.datos[0]).toMatchObject({
      folio,
      tieneCv: true,
      carpeta: expect.stringMatching(/^CV-/),
      candidato: { correo: "valentina.rojas@correo.cl" },
      oferta: { cargo: "Técnico de Mantenimiento" },
    });

    const filtrada = await entorno.api
      .get("/api/postulaciones?q=valentina")
      .set(analista.cabecera);
    expect(filtrada.body.total).toBe(1);

    const delEvaluador = await entorno.api
      .get("/api/postulaciones")
      .set(evaluador.cabecera);
    expect(delEvaluador.status).toBe(200);
    expect(delEvaluador.body.total).toBe(1);
  });

  it("obtiene el detalle de la postulación", async () => {
    const detalle = await entorno.api
      .get(`/api/postulaciones/${postulacionId}`)
      .set(analista.cabecera);
    expect(detalle.status).toBe(200);
    expect(detalle.body.datos.archivo.nombreOriginal).toBe("cv-valentina.pdf");

    const inexistente = await entorno.api
      .get("/api/postulaciones/9999")
      .set(analista.cabecera);
    expect(inexistente.status).toBe(404);
  });

  it("descarga el CV solo para usuarios autorizados", async () => {
    const descarga = await entorno.api
      .get(`/api/postulaciones/${postulacionId}/cv`)
      .set(analista.cabecera);
    expect(descarga.status).toBe(200);
    expect(descarga.headers["content-type"]).toContain("application/pdf");
    expect(descarga.headers["content-disposition"]).toContain("attachment");
    expect(descarga.headers["cache-control"]).toContain("no-store");
    expect(descarga.body.length).toBe(PDF_MINIMO.length);

    const evaluadorAsignado = await entorno.api
      .get(`/api/postulaciones/${postulacionId}/cv`)
      .set(evaluador.cabecera);
    expect(evaluadorAsignado.status).toBe(200);

    const sinToken = await entorno.api.get(
      `/api/postulaciones/${postulacionId}/cv`,
    );
    expect(sinToken.status).toBe(401);

    const prohibido = await entorno.api
      .get(`/api/postulaciones/${postulacionId}/cv`)
      .set(jefatura.cabecera);
    expect(prohibido.status).toBe(403);

    const otraPostulacion = await entorno.api
      .get("/api/postulaciones")
      .set(analista.cabecera);
    expect(otraPostulacion.body.datos[0].id).toBe(postulacionId);
  });

  it("oculta postulaciones a evaluadores no asignados y sin CV", async () => {
    await entorno.db.query(
      "UPDATE solicitudes SET responsable = 'Otra Persona' WHERE candidato_id IN (SELECT candidato_id FROM postulaciones WHERE id = $1)",
      [postulacionId],
    );
    const ajena = await entorno.api
      .get(`/api/postulaciones/${postulacionId}`)
      .set(evaluador.cabecera);
    expect(ajena.status).toBe(404);

    const lista = await entorno.api
      .get("/api/postulaciones")
      .set(evaluador.cabecera);
    expect(lista.body.total).toBe(0);

    await entorno.db.query(
      "UPDATE solicitudes SET responsable = 'Valeria Ospina' WHERE candidato_id IN (SELECT candidato_id FROM postulaciones WHERE id = $1)",
      [postulacionId],
    );
  });

  it("responde 404 cuando no existe archivo de currículum", async () => {
    const { rows } = await entorno.db.query(
      "SELECT candidato_id FROM postulaciones WHERE id = $1",
      [postulacionId],
    );
    const { rows: nueva } = await entorno.db.query(
      `INSERT INTO postulaciones (folio, oferta_id, candidato_id, fecha, consentimiento)
       VALUES ('AQ-TEST-SIN-CV', 2, $1, '2026-11-01', TRUE) RETURNING id`,
      [rows[0].candidato_id],
    );
    const respuesta = await entorno.api
      .get(`/api/postulaciones/${nueva[0].id}/cv`)
      .set(analista.cabecera);
    expect(respuesta.status).toBe(404);
  });
});
