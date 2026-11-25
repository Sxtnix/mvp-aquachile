import crypto from "node:crypto";
import { config } from "../config.js";

export const COOKIE_REFRESH = "aq_refresh";

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function nuevoRefreshToken() {
  const token = crypto.randomBytes(48).toString("hex");
  const expira = new Date(
    Date.now() + config.refreshTtlDays * 24 * 60 * 60 * 1000,
  );
  return { token, hash: hashToken(token), expira };
}

export function leerCookie(req, nombre) {
  const crudo = req.headers.cookie || "";
  return crudo
    .split(";")
    .map((parte) => parte.trim())
    .find((parte) => parte.startsWith(`${nombre}=`))
    ?.slice(nombre.length + 1);
}

export function opcionesCookieRefresh() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: config.cookieSecure,
    path: "/api/auth",
    maxAge: config.refreshTtlDays * 24 * 60 * 60 * 1000,
  };
}

export async function emitirRefresh(db, usuarioId, res) {
  const { token, hash, expira } = nuevoRefreshToken();
  await db.query(
    "INSERT INTO refresh_tokens (usuario_id, token_hash, expira_en) VALUES ($1,$2,$3)",
    [usuarioId, hash, expira.toISOString()],
  );
  res.cookie(COOKIE_REFRESH, token, opcionesCookieRefresh());
  return token;
}
