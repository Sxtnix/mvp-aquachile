import { Router } from "express";
import { asincrono, noEncontrado } from "../middleware/errors.js";
import { autorizar, autenticar } from "../middleware/auth.js";
import { idNumerico } from "../middleware/validar.js";
import { aPostulacion } from "../lib/serializers.js";

const SELECT_POSTULACION = `
  SELECT p.*, ca.nombre AS candidato_nombre, ca.correo AS candidato_correo,
         ca.telefono AS candidato_telefono, cc.codigo AS carpeta,
         a.id AS archivo_id, a.nombre_original, a.mime, a.tamano, a.sha256,
         o.cargo AS oferta_cargo, o.departamento AS oferta_departamento,
         o.ubicacion AS oferta_ubicacion
    FROM postulaciones p
    JOIN candidatos ca ON ca.id = p.candidato_id
    JOIN ofertas o ON o.id = p.oferta_id
    LEFT JOIN carpetas_cv cc ON cc.id = p.carpeta_cv_id
    LEFT JOIN archivos_cv a ON a.carpeta_id = cc.id`;

async function accesoPostulacion(db, usuario, id) {
  const { rows } = await db.query(
    `${SELECT_POSTULACION} WHERE p.id = $1`,
    [id],
  );
  const postulacion = rows[0];
  if (!postulacion) throw noEncontrado("Postulación");
  if (usuario.rol === "EVALUADOR") {
    const { rows: asignadas } = await db.query(
      `SELECT 1 FROM solicitudes
        WHERE candidato_id = $1 AND responsable = $2 LIMIT 1`,
      [postulacion.candidato_id, usuario.nombre],
    );
    if (!asignadas[0]) {
      throw noEncontrado("Postulación");
    }
  }
  return postulacion;
}

export function postulacionesRouter() {
  const router = Router();
  router.use(autenticar);

  router.get(
    "/",
    autorizar("ANALISTA", "EVALUADOR"),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const filtros = [];
      const valores = [];
      if (req.usuario.rol === "EVALUADOR") {
        valores.push(req.usuario.nombre);
        filtros.push(
          `EXISTS (SELECT 1 FROM solicitudes s
                    WHERE s.candidato_id = p.candidato_id AND s.responsable = $${valores.length})`,
        );
      }
      const { q = "" } = req.query;
      if (q) {
        valores.push(`%${q}%`);
        filtros.push(
          `(ca.nombre ILIKE $${valores.length} OR ca.correo ILIKE $${valores.length} OR o.cargo ILIKE $${valores.length})`,
        );
      }
      const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";
      const { rows } = await db.query(
        `${SELECT_POSTULACION} ${where} ORDER BY p.id DESC`,
        valores,
      );
      res.json({ datos: rows.map(aPostulacion), total: rows.length });
    }),
  );

  router.get(
    "/:id",
    autorizar("ANALISTA", "EVALUADOR"),
    idNumerico(),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const postulacion = await accesoPostulacion(
        db,
        req.usuario,
        req.params.id,
      );
      res.json({ datos: aPostulacion(postulacion) });
    }),
  );

  router.get(
    "/:id/cv",
    autorizar("ANALISTA", "EVALUADOR"),
    idNumerico(),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const postulacion = await accesoPostulacion(
        db,
        req.usuario,
        req.params.id,
      );
      if (!postulacion.carpeta_cv_id) throw noEncontrado("Currículum");

      const { rows } = await db.query(
        "SELECT * FROM archivos_cv WHERE carpeta_id = $1 ORDER BY id DESC LIMIT 1",
        [postulacion.carpeta_cv_id],
      );
      const archivo = rows[0];
      if (!archivo) throw noEncontrado("Currículum");

      res.setHeader("Content-Type", archivo.mime);
      res.setHeader("Content-Length", String(archivo.tamano));
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(archivo.nombre_original)}"`,
      );
      res.send(Buffer.from(archivo.contenido));
    }),
  );

  return router;
}
