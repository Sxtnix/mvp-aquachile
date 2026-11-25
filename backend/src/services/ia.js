import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { config } from "../config.js";
import { HttpError } from "../middleware/errors.js";

export const PROMPT_VERSION = "cv-v1";
const MAX_TEXTO = 14000;

export async function extraerTexto(archivo) {
  const extension = (archivo.originalname || "")
    .toLowerCase()
    .split(".")
    .pop();

  if (extension === "pdf") {
    const parser = new PDFParse({ data: new Uint8Array(archivo.buffer) });
    try {
      const resultado = await parser.getText();
      return normalizar(resultado.text || "");
    } finally {
      await parser.destroy().catch(() => {});
    }
  }

  if (extension === "docx") {
    const { value } = await mammoth.extractRawText({
      buffer: archivo.buffer,
    });
    return normalizar(value || "");
  }

  throw new HttpError(
    422,
    "Para el análisis con IA sube el currículum en PDF o DOCX. El formato DOC antiguo no permite extraer texto de forma confiable.",
  );
}

function normalizar(texto) {
  return texto.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function construirPrompt(oferta, candidato, textoCv) {
  const requisitos = oferta?.requisitos || "No especificados";
  return `Eres un asistente de apoyo para el equipo de Reclutamiento y Selección de AquaChile.
Tu tarea es analizar un currículum frente a una oferta laboral y entregar información
orientativa. NUNCA decides la contratación: una persona del equipo debe realizar la revisión humana final de tu salida.

CARGO: ${oferta?.cargo || "No informado"}
DEPARTAMENTO: ${oferta?.departamento || "No informado"}
UBICACIÓN: ${oferta?.ubicacion || "No informada"}
MODALIDAD: ${oferta?.modalidad || "No informada"}
DESCRIPCIÓN: ${oferta?.descripcion || "No informada"}
FUNCIONES: ${oferta?.funciones || "No informadas"}
REQUISITOS: ${requisitos}

POSTULANTE: ${candidato?.nombre || "No informado"}

CURRÍCULUM:
"""${textoCv.slice(0, MAX_TEXTO)}"""

Responde SOLO con un objeto JSON válido, en español, con esta estructura exacta:
{
  "puntaje": número entero de 0 a 100,
  "resumen": "una frase que resuma el ajuste al cargo",
  "formacion": "formación detectada",
  "experiencia": "experiencia relevante detectada",
  "habilidades": ["habilidad 1", "habilidad 2"],
  "requisitos": [
    { "requisito": "texto del requisito", "estado": "cumple|parcial|no", "detalle": "explicación breve" }
  ],
  "preguntas": [
    { "pregunta": "pregunta para la entrevista", "objetivo": "qué se busca verificar" }
  ],
  "faltantes": ["dato faltante o no verificable"],
  "limitaciones": "limitaciones del análisis"
}
Incluye una entrada en "requisitos" por cada requisito real de la oferta. Usa "no" cuando no haya información suficiente.
Incluye entre 4 y 6 preguntas de entrevista. No inventes datos que no aparezcan en el currículum.
Si el currículum no contiene texto útil, indícalo en "limitaciones" y asigna un puntaje bajo.`;
}

export function normalizarAnalisis(payload) {
  const puntaje = Math.max(
    0,
    Math.min(100, Math.round(Number(payload?.puntaje) || 0)),
  );
  const lista = (valor) => (Array.isArray(valor) ? valor : []);
  const requisitos = lista(payload?.requisitos)
    .map((item) => ({
      requisito: String(item?.requisito || "").slice(0, 300),
      estado: ["cumple", "parcial", "no"].includes(item?.estado)
        ? item.estado
        : "no",
      detalle: String(item?.detalle || "").slice(0, 800),
    }))
    .filter((item) => item.requisito)
    .slice(0, 30);
  const preguntas = lista(payload?.preguntas)
    .map((item) => ({
      pregunta: String(item?.pregunta || "").slice(0, 500),
      objetivo: String(item?.objetivo || "").slice(0, 500),
    }))
    .filter((item) => item.pregunta)
    .slice(0, 10);

  return {
    puntaje,
    resumen: String(payload?.resumen || "").slice(0, 1000),
    formacion: String(payload?.formacion || "").slice(0, 2000),
    experiencia: String(payload?.experiencia || "").slice(0, 2000),
    habilidades: lista(payload?.habilidades)
      .map((h) => String(h).slice(0, 120))
      .slice(0, 20),
    requisitos,
    preguntas,
    faltantes: lista(payload?.faltantes)
      .map((f) => String(f).slice(0, 300))
      .slice(0, 20),
    limitaciones: String(payload?.limitaciones || "").slice(0, 1500),
    modelo: config.groqModel,
    promptVersion: PROMPT_VERSION,
  };
}

function extraerJson(contenido) {
  const limpio = String(contenido || "")
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(limpio);
  } catch {
    const inicio = limpio.indexOf("{");
    const fin = limpio.lastIndexOf("}");
    if (inicio >= 0 && fin > inicio) {
      return JSON.parse(limpio.slice(inicio, fin + 1));
    }
    throw new HttpError(502, "La IA entregó una respuesta no interpretable.");
  }
}

export async function analizarConGroq({
  oferta,
  candidato,
  textoCv,
  apiKey = config.groqApiKey,
  model = config.groqModel,
  fetchImpl = fetch,
}) {
  if (!apiKey) {
    throw new HttpError(
      503,
      "La IA no está configurada. Agrega GROQ_API_KEY en backend/.env para habilitarla.",
    );
  }
  if (!textoCv || textoCv.trim().length < 40) {
    throw new HttpError(
      422,
      "No se pudo extraer texto suficiente del currículum para analizarlo.",
    );
  }

  const respuesta = await fetchImpl(config.groqUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente de reclutamiento. Respondes únicamente JSON válido.",
        },
        {
          role: "user",
          content: construirPrompt(oferta, candidato, textoCv),
        },
      ],
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => "");
    throw new HttpError(
      502,
      `No fue posible obtener el análisis de IA (${respuesta.status}). ${detalle.slice(0, 200)}`.trim(),
    );
  }

  const datos = await respuesta.json();
  const contenido = datos?.choices?.[0]?.message?.content;
  if (!contenido) {
    throw new HttpError(502, "La IA no devolvió contenido.");
  }
  return { ...normalizarAnalisis(extraerJson(contenido)), modelo: model };
}
