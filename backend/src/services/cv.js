import crypto from "node:crypto";
import path from "node:path";
import { HttpError } from "../middleware/errors.js";
import { config } from "../config.js";

const FIRMAS = {
  ".pdf": (buffer) => buffer.subarray(0, 5).toString("latin1") === "%PDF-",
  ".docx": (buffer) =>
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04,
  ".doc": (buffer) =>
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0,
};

const MIMES = {
  ".pdf": "application/pdf",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc": "application/msword",
};

export function validarArchivoCv(archivo) {
  if (!archivo || !archivo.buffer?.length) {
    throw new HttpError(400, "El currículum es obligatorio.");
  }
  if (archivo.size > config.maxCvBytes) {
    throw new HttpError(
      413,
      "El currículum supera el tamaño máximo permitido de 5 MB.",
    );
  }
  const extension = path.extname(archivo.originalname || "").toLowerCase();
  const firma = FIRMAS[extension];
  if (!firma) {
    throw new HttpError(
      422,
      "Formato no permitido. Sube tu currículum en PDF, DOC o DOCX.",
    );
  }
  if (!firma(archivo.buffer)) {
    throw new HttpError(
      422,
      "El contenido del archivo no coincide con su extensión. Verifica el currículum.",
    );
  }
  return {
    extension,
    mime: MIMES[extension],
    sha256: crypto.createHash("sha256").update(archivo.buffer).digest("hex"),
  };
}

export function slugCarpeta(nombre) {
  return (nombre || "postulante")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function codigoCarpeta(id, nombre) {
  return `CV-${new Date().getFullYear()}-${String(id).padStart(6, "0")}-${slugCarpeta(nombre)}`;
}
