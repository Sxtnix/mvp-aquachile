export class HttpError extends Error {
  constructor(status, mensaje, detalles = undefined) {
    super(mensaje);
    this.name = "HttpError";
    this.status = status;
    this.detalles = detalles;
  }
}

export function noEncontrado(recurso = "Recurso") {
  return new HttpError(404, `${recurso} no encontrado`);
}

export function asincrono(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function manejadorErrores(error, req, res, _next) {
  if (error?.name === "MulterError") {
    const mensaje =
      error.code === "LIMIT_FILE_SIZE"
        ? "El archivo supera el tamaño máximo permitido (5 MB)."
        : "No fue posible procesar el archivo adjunto.";
    return res.status(400).json({ error: mensaje, codigo: error.code });
  }

  if (error?.type === "entity.too.large") {
    return res.status(413).json({ error: "La solicitud es demasiado grande." });
  }

  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo JSON no es válido." });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({
      error: error.message,
      ...(error.detalles ? { detalles: error.detalles } : {}),
    });
  }

  if (error?.code === "23505") {
    return res.status(409).json({ error: "El registro ya existe." });
  }

  if (error?.code === "23503") {
    return res
      .status(409)
      .json({ error: "El registro está siendo utilizado por otros datos." });
  }

  if (error?.code === "23514") {
    return res.status(400).json({ error: "Valor no permitido por el esquema." });
  }

  if (error?.code === "22P02") {
    return res.status(400).json({ error: "Identificador o valor inválido." });
  }

  console.error("[error]", error);
  return res.status(500).json({ error: "Error interno del servidor." });
}

export function noEncontradoHandler(req, res) {
  res.status(404).json({ error: "Ruta no encontrada." });
}
