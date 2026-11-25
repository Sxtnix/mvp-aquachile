import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { HttpError } from "./errors.js";

export function firmarAccessToken(usuario) {
  return jwt.sign(
    {
      sub: String(usuario.id),
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
    },
    config.jwtSecret,
    { expiresIn: config.accessTtl, issuer: "aquachile-api" },
  );
}

export function autenticar(req, res, next) {
  const encabezado = req.headers.authorization || "";
  const [tipo, token] = encabezado.split(" ");
  if (tipo !== "Bearer" || !token) {
    return next(new HttpError(401, "Token de acceso requerido."));
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret, {
      issuer: "aquachile-api",
    });
    req.usuario = {
      id: Number(payload.sub),
      email: payload.email,
      nombre: payload.nombre,
      rol: payload.rol,
    };
    return next();
  } catch {
    return next(new HttpError(401, "Token inválido o expirado."));
  }
}

export function autorizar(...roles) {
  return (req, res, next) => {
    if (!req.usuario) return next(new HttpError(401, "No autenticado."));
    if (roles.length && !roles.includes(req.usuario.rol)) {
      return next(
        new HttpError(403, "No tienes permisos para realizar esta acción."),
      );
    }
    return next();
  };
}

export function soloRoles(...roles) {
  return [autenticar, autorizar(...roles)];
}
