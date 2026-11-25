import fs from "node:fs";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { config } from "../src/config.js";
import {
  analizarConGroq,
  construirPrompt,
  extraerTexto,
  normalizarAnalisis,
} from "../src/services/ia.js";
import {
  codigoCarpeta,
  slugCarpeta,
  validarArchivoCv,
} from "../src/services/cv.js";
import { crearEntorno, iniciarSesion } from "./helpers.js";

const PDF_REAL = new URL(
  "../../implementar a Aquachile/DSY1104_Evaluacion_Parcial_3_AquaChile.pdf",
  import.meta.url,
);
const DOCX = new URL("./fixtures/cv-ejemplo.docx", import.meta.url);

const analisisDemo = {
  puntaje: 88,
  resumen: "Perfil con buen ajuste al cargo.",
  formacion: "Ingeniería en Alimentos.",
  experiencia: "3 años en control de calidad.",
  habilidades: ["Análisis de datos", "ISO 9001"],
  requisitos: [
    { requisito: "Ingeniería o carrera afín", estado: "cumple", detalle: "Título" },
    { requisito: "Experiencia ISO", estado: "parcial", detalle: "Parcial" },
    { requisito: "Licencia clase B", estado: "otro", detalle: "Sin dato" },
  ],
  preguntas: [{ pregunta: "¿Cómo aplicó ISO 9001?", objetivo: "Verificar experiencia" }],
  faltantes: ["Licencia de conducir"],
  limitaciones: "Información autoinformada.",
};

describe("servicio de archivos CV", () => {
  it("valida PDF y DOCX por firma real", () => {
    const pdf = fs.readFileSync(PDF_REAL);
    const resultado = validarArchivoCv({
      originalname: "cv.pdf",
      buffer: pdf,
      size: pdf.length,
    });
    expect(resultado.extension).toBe(".pdf");
    expect(resultado.mime).toBe("application/pdf");
    expect(resultado.sha256).toHaveLength(64);

    const docx = fs.readFileSync(DOCX);
    expect(
      validarArchivoCv({ originalname: "cv.docx", buffer: docx, size: docx.length })
        .extension,
    ).toBe(".docx");
  });

  it("rechaza archivo vacío, extensión no permitida, firma falsa y tamaño excesivo", () => {
    expect(() => validarArchivoCv(null)).toThrow(/obligatorio/i);
    expect(() =>
      validarArchivoCv({ originalname: "cv.txt", buffer: Buffer.from("x"), size: 1 }),
    ).toThrow(/Formato no permitido/i);
    expect(() =>
      validarArchivoCv({
        originalname: "cv.pdf",
        buffer: Buffer.from("no pdf"),
        size: 6,
      }),
    ).toThrow(/no coincide/i);
    expect(() =>
      validarArchivoCv({
        originalname: "cv.pdf",
        buffer: Buffer.from("%PDF-1.4"),
        size: config.maxCvBytes + 1,
      }),
    ).toThrow(/tamaño máximo/i);
  });

  it("genera slugs y códigos de carpeta legibles", () => {
    expect(slugCarpeta("Valentina Rojas Núñez")).toBe("VALENTINA-ROJAS-NUNEZ");
    expect(slugCarpeta("")).toBe("POSTULANTE");
    expect(slugCarpeta("  ***  ")).toBe("");
    expect(codigoCarpeta(12, "Valentina Rojas")).toMatch(
      /^CV-\d{4}-000012-VALENTINA-ROJAS$/,
    );
  });
});

describe("extracción de texto", () => {
  it("extrae texto de PDF y DOCX", async () => {
    const pdf = fs.readFileSync(PDF_REAL);
    const textoPdf = await extraerTexto({
      originalname: "documento.pdf",
      buffer: pdf,
    });
    expect(textoPdf.toLowerCase()).toContain("evaluación");

    const docx = fs.readFileSync(DOCX);
    const textoDocx = await extraerTexto({
      originalname: "cv.docx",
      buffer: docx,
    });
    expect(textoDocx).toContain("Curriculum de prueba");
  });

  it("rechaza el formato DOC antiguo", async () => {
    await expect(
      extraerTexto({
        originalname: "cv.doc",
        buffer: Buffer.from([0xd0, 0xcf, 0x11, 0xe0]),
      }),
    ).rejects.toThrow(/PDF o DOCX/i);
  });
});

describe("normalización del análisis IA", () => {
  it("acota puntaje, estados y listas", () => {
    const normalizado = normalizarAnalisis({
      puntaje: 160,
      resumen: 123,
      habilidades: "no-es-lista",
      requisitos: [
        { requisito: "Uno", estado: "otro", detalle: 5 },
        { estado: "cumple" },
      ],
      preguntas: [{ pregunta: "¿Pregunta?", objetivo: "Validar" }, {}],
      faltantes: ["Dato"],
    });
    expect(normalizado.puntaje).toBe(100);
    expect(normalizado.requisitos).toHaveLength(1);
    expect(normalizado.requisitos[0].estado).toBe("no");
    expect(normalizado.preguntas).toHaveLength(1);
    expect(normalizado.habilidades).toEqual([]);
    expect(normalizado.modelo).toBe(config.groqModel);
  });

  it("maneja un objeto vacío sin fallar", () => {
    const normalizado = normalizarAnalisis();
    expect(normalizado.puntaje).toBe(0);
    expect(normalizado.requisitos).toEqual([]);
    expect(normalizado.limitaciones).toBe("");
  });

  it("construye un prompt con los datos de la oferta y el CV", () => {
    const prompt = construirPrompt(
      { cargo: "Analista", requisitos: "ISO 9001", departamento: "Calidad" },
      { nombre: "Valentina" },
      "texto del curriculum",
    );
    expect(prompt).toContain("CARGO: Analista");
    expect(prompt).toContain("ISO 9001");
    expect(prompt).toContain("texto del curriculum");
    expect(prompt).toContain("revisión humana");
  });
});

describe("cliente Groq", () => {
  const opciones = {
    oferta: { cargo: "Analista", requisitos: "ISO" },
    candidato: { nombre: "Valentina" },
    textoCv: "Experiencia suficiente en control de calidad y auditorías internas.",
  };

  it("exige API key y texto útil", async () => {
    await expect(analizarConGroq({ ...opciones, apiKey: "" })).rejects.toThrow(
      /no está configurada/i,
    );
    await expect(
      analizarConGroq({ ...opciones, apiKey: "x", textoCv: "corto" }),
    ).rejects.toThrow(/texto suficiente/i);
  });

  it("interpreta respuesta JSON, incluso con bloque markdown", async () => {
    const fetchFalso = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: `\`\`\`json\n${JSON.stringify(analisisDemo)}\n\`\`\``,
            },
          },
        ],
      }),
    });
    const resultado = await analizarConGroq({
      ...opciones,
      apiKey: "x",
      fetchImpl: fetchFalso,
    });
    expect(resultado.puntaje).toBe(88);
    expect(resultado.requisitos).toHaveLength(3);
    expect(fetchFalso).toHaveBeenCalledOnce();
  });

  it("interpreta JSON envuelto en texto adicional", async () => {
    const fetchFalso = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: `Aquí está: ${JSON.stringify(analisisDemo)}` } }],
      }),
    });
    const resultado = await analizarConGroq({
      ...opciones,
      apiKey: "x",
      fetchImpl: fetchFalso,
    });
    expect(resultado.resumen).toContain("buen ajuste");
  });

  it("reporta errores de la API, respuestas vacías y JSON inválido", async () => {
    const errorApi = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => "rate limit",
    });
    await expect(
      analizarConGroq({ ...opciones, apiKey: "x", fetchImpl: errorApi }),
    ).rejects.toThrow(/429/);

    const sinContenido = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] }),
    });
    await expect(
      analizarConGroq({ ...opciones, apiKey: "x", fetchImpl: sinContenido }),
    ).rejects.toThrow(/no devolvió contenido/i);

    const jsonMalo = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "sin json" } }] }),
    });
    await expect(
      analizarConGroq({ ...opciones, apiKey: "x", fetchImpl: jsonMalo }),
    ).rejects.toThrow(/no interpretable/i);
  });
});

describe("endpoints de IA", () => {
  let entorno;
  let analista;
  let evaluador;
  let jefatura;
  let solicitudId;

  beforeAll(async () => {
    entorno = await crearEntorno();
    analista = await iniciarSesion(entorno.api, "ANALISTA");
    evaluador = await iniciarSesion(entorno.api, "EVALUADOR");
    jefatura = await iniciarSesion(entorno.api, "JEFATURA");

    const pdf = fs.readFileSync(PDF_REAL);
    const creada = await entorno.api
      .post("/api/publico/postulaciones")
      .field("ofertaId", "1")
      .field("nombre", "Candidata IA")
      .field("correo", "candidata.ia@correo.cl")
      .field("telefono", "+56 9 5555 6666")
      .field("consentimiento", "true")
      .attach("curriculum", pdf, {
        filename: "cv-ia.pdf",
        contentType: "application/pdf",
      });
    expect(creada.status).toBe(201);
    solicitudId = creada.body.datos.solicitudId;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    config.groqApiKey = "";
  });

  afterAll(async () => {
    await entorno.db.close();
  });

  it("indica el estado de configuración de Groq", async () => {
    const respuesta = await entorno.api
      .get("/api/ia/estado")
      .set(analista.cabecera);
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toMatchObject({ proveedor: "Groq", configurada: false });
  });

  it("genera, consulta y revisa un análisis con revisión humana", async () => {
    config.groqApiKey = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(analisisDemo) } }],
        }),
      }),
    );

    const generado = await entorno.api
      .post(`/api/solicitudes/${solicitudId}/analisis`)
      .set(analista.cabecera);
    expect(generado.status).toBe(201);
    expect(generado.body.datos.puntaje).toBe(88);
    expect(generado.body.datos.pendienteRevision).toBe(true);
    expect(generado.body.aviso).toMatch(/revisión humana/i);

    const consulta = await entorno.api
      .get(`/api/solicitudes/${solicitudId}/analisis`)
      .set(analista.cabecera);
    expect(consulta.status).toBe(200);
    expect(consulta.body.datos.requisitos).toHaveLength(3);

    const revision = await entorno.api
      .patch(`/api/solicitudes/${solicitudId}/analisis/revision`)
      .set(analista.cabecera)
      .send({ revision: "Revisado con la evaluadora." });
    expect(revision.status).toBe(200);
    expect(revision.body.datos.pendienteRevision).toBe(false);
    expect(revision.body.datos.revisadoPor).toBe("Camila Reyes");

    const detalle = await entorno.api
      .get(`/api/solicitudes/${solicitudId}`)
      .set(analista.cabecera);
    expect(detalle.body.datos.analisis.puntaje).toBe(88);
  });

  it("informa cuando la IA no está configurada", async () => {
    config.groqApiKey = "";
    const respuesta = await entorno.api
      .post(`/api/solicitudes/${solicitudId}/analisis`)
      .set(analista.cabecera);
    expect(respuesta.status).toBe(503);
    expect(respuesta.body.error).toMatch(/GROQ_API_KEY/);
  });

  it("rechaza solicitudes sin postulación o sin currículum", async () => {
    const sinPostulacion = await entorno.api
      .post("/api/solicitudes/1/analisis")
      .set(analista.cabecera);
    expect(sinPostulacion.status).toBe(422);
    expect(sinPostulacion.body.error).toMatch(/postulación/i);

    const sinArchivo = await entorno.api
      .post("/api/solicitudes/3/analisis")
      .set(analista.cabecera);
    expect(sinArchivo.status).toBe(422);
  });

  it("protege la IA por rol y asignación", async () => {
    const jefe = await entorno.api
      .post(`/api/solicitudes/${solicitudId}/analisis`)
      .set(jefatura.cabecera);
    expect(jefe.status).toBe(403);

    const evaluadorNoAsignado = await entorno.api
      .get(`/api/solicitudes/${solicitudId}/analisis`)
      .set(evaluador.cabecera);
    expect(evaluadorNoAsignado.status).toBe(403);

    const revisionSinAnalisis = await entorno.api
      .patch("/api/solicitudes/1/analisis/revision")
      .set(analista.cabecera)
      .send({});
    expect(revisionSinAnalisis.status).toBe(404);

    const idInvalido = await entorno.api
      .post("/api/solicitudes/abc/analisis")
      .set(analista.cabecera);
    expect(idInvalido.status).toBe(400);
  });
});
