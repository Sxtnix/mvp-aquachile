import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { HttpError } from "../middleware/errors.js";
import { asincrono } from "../middleware/errors.js";
import { validar } from "../middleware/validar.js";
import {
  autenticar,
  firmarAccessToken,
} from "../middleware/auth.js";
import {
  COOKIE_REFRESH,
  emitirRefresh,
  hashToken,
  leerCookie,
  opcionesCookieRefresh,
} from "../services/tokens.js";

const loginSchema = z.object({
  email: z.string().trim().email("Correo inválido.").max(200),
  password: z.string().min(1, "La contraseña es obligatoria.").max(200),
});

function aUsuario(r) {
  return { id: r.id, nombre: r.nombre, email: r.email, rol: r.rol };
}

export function authRouter() {
  const router = Router();

  router.post(
    "/login",
    validar(loginSchema),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const { email, password } = req.body;
      const { rows } = await db.query(
        "SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)",
        [email],
      );
      const usuario = rows[0];
      const valida =
        usuario && (await bcrypt.compare(password, usuario.password_hash));
      if (!valida) {
        throw new HttpError(401, "Credenciales incorrectas.");
      }
      if (!usuario.activo) {
        throw new HttpError(403, "La cuenta está deshabilitada.");
      }

      await emitirRefresh(db, usuario.id, res);
      res.json({
        accessToken: firmarAccessToken(usuario),
        usuario: aUsuario(usuario),
      });
    }),
  );

  router.post(
    "/refresh",
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const token = leerCookie(req, COOKIE_REFRESH);
      if (!token) throw new HttpError(401, "Sesión no disponible.");

      const hash = hashToken(token);
      const { rows } = await db.query(
        `SELECT rt.id AS token_id, u.*
           FROM refresh_tokens rt
           JOIN usuarios u ON u.id = rt.usuario_id
          WHERE rt.token_hash = $1
            AND rt.revocado = FALSE
            AND rt.expira_en > NOW()`,
        [hash],
      );
      const sesion = rows[0];
      if (!sesion || !sesion.activo) {
        res.clearCookie(COOKIE_REFRESH, opcionesCookieRefresh());
        throw new HttpError(401, "Sesión expirada. Inicia sesión nuevamente.");
      }

      await db.query("UPDATE refresh_tokens SET revocado = TRUE WHERE id = $1", [
        sesion.token_id,
      ]);
      await emitirRefresh(db, sesion.id, res);

      res.json({
        accessToken: firmarAccessToken(sesion),
        usuario: aUsuario(sesion),
      });
    }),
  );

  router.post(
    "/logout",
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const token = leerCookie(req, COOKIE_REFRESH);
      if (token) {
        await db.query(
          "UPDATE refresh_tokens SET revocado = TRUE WHERE token_hash = $1",
          [hashToken(token)],
        );
      }
      res.clearCookie(COOKIE_REFRESH, opcionesCookieRefresh());
      res.json({ mensaje: "Sesión cerrada correctamente." });
    }),
  );

  router.get(
    "/me",
    autenticar,
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const { rows } = await db.query(
        "SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = $1",
        [req.usuario.id],
      );
      if (!rows[0] || !rows[0].activo) {
        throw new HttpError(401, "Usuario no disponible.");
      }
      res.json({ usuario: aUsuario(rows[0]) });
    }),
  );

  return router;
}
