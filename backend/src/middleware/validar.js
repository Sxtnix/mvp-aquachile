import { HttpError } from "./errors.js";

/** Valida req[origen] con un esquema Zod y reemplaza el valor por el saneado. */
export function validar(esquema, origen = "body") {
  return (req, res, next) => {
    const resultado = esquema.safeParse(req[origen]);
    if (!resultado.success) {
      const detalles = resultado.error.issues.map((issue) => ({
        campo: (issue.path || []).join(".") || origen,
        mensaje: issue.message,
      }));
      return next(new HttpError(400, "Datos inválidos.", detalles));
    }
    if (origen === "query") {
      req.queryValidada = resultado.data;
    } else {
      req[origen] = resultado.data;
    }
    return next();
  };
}

export function idNumerico(parametro = "id") {
  return (req, res, next) => {
    const valor = Number(req.params[parametro]);
    if (!Number.isInteger(valor) || valor <= 0) {
      return next(new HttpError(400, "Identificador inválido."));
    }
    req.params[parametro] = valor;
    return next();
  };
}
