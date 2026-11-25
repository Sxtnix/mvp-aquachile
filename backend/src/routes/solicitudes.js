import { Router } from "express";
import { z } from "zod";
import {
  asincrono,
  HttpError,
  noEncontrado,
} from "../middleware/errors.js";
import { autorizar, autenticar } from "../middleware/auth.js";
import { idNumerico, validar } from "../middleware/validar.js";
import {
  aAnalisis,
  aBitacora,
  aEvaluacion,
  aSolicitud,
} from "../lib/serializers.js";
import { analizarConGroq, extraerTexto } from "../services/ia.js";

const fechaISO = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Usa el formato AAAA-MM-DD.");

const fechaOpcional = z.union([fechaISO, z.literal("")]).optional().default("");

const solicitudSchema = z.object({
  candidatoId: z.coerce.number().int().positive("Selecciona un candidato."),
  responsable: z.string().trim().max(120).optional().default(""),
  prioridad: z.enum(["Alta", "Media", "Baja"]),
  observaciones: z.string().trim().max(2000).optional().default(""),
  fechaEntrevista: fechaOpcional,
  fechaSolicitud: fechaISO,
});

const estadoSchema = z.object({
  estado: z.enum(["Pendiente", "En proceso", "Finalizada"]),
});

const evaluacionSchema = z.object({
  fechaEvaluacion: fechaISO,
  resultado: z.enum([
    "Apto",
    "Apto con observaciones",
    "No apto",
    "Sin resultado",
  ]),
  categoria: z.enum([
    "Recomendado",
    "Recomendado con observaciones",
    "No recomendado",
  ]),
  observaciones: z
    .string()
    .trim()
    .min(10, "La observación debe tener al menos 10 caracteres.")
    .max(4000),
  finalizar: z.boolean().optional().default(true),
});

const consultaSchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  estado: z.enum(["Pendiente", "En proceso", "Finalizada"]).optional(),
  prioridad: z.enum(["Alta", "Media", "Baja"]).optional(),
  responsable: z.string().trim().max(120).optional(),
});

const revisionSchema = z.object({
  revision: z.string().trim().max(1000).optional().default(""),
});

const SELECT_SOLICITUD = `
  SELECT s.*, c.nombre AS candidato_nombre, c.correo AS candidato_correo,
         c.telefono AS candidato_telefono, c.ubicacion AS candidato_ubicacion,
         c.departamento AS candidato_departamento
    FROM solicitudes s
    JOIN candidatos c ON c.id = s.candidato_id`;

async function cargarAutorizada(db, usuario, id) {
  const { rows } = await db.query(`${SELECT_SOLICITUD} WHERE s.id = $1`, [id]);
  const solicitud = rows[0];
  if (!solicitud) throw noEncontrado("Solicitud");
  if (
    usuario.rol === "EVALUADOR" &&
    solicitud.responsable !== usuario.nombre
  ) {
    throw new HttpError(403, "Esta solicitud no está asignada a tu usuario.");
  }
  return solicitud;
}

async function registrarBitacora(db, solicitudId, anterior, nuevo, responsable) {
  if (anterior === nuevo) return;
  await db.query(
    `INSERT INTO bitacora (solicitud_id, fecha, estado_anterior, estado_nuevo, responsable)
     VALUES ($1,$2,$3,$4,$5)`,
    [
      solicitudId,
      new Date().toISOString().slice(0, 10),
      anterior,
      nuevo,
      responsable,
    ],
  );
}

export function solicitudesRouter() {
  const router = Router();
  router.use(autenticar);

  router.get(
    "/",
    validar(consultaSchema, "query"),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const { q, estado, prioridad, responsable } = req.queryValidada;
      const filtros = [];
      const valores = [];

      if (req.usuario.rol === "EVALUADOR") {
        valores.push(req.usuario.nombre);
        filtros.push(`s.responsable = $${valores.length}`);
      } else if (responsable) {
        valores.push(responsable);
        filtros.push(`s.responsable = $${valores.length}`);
      }
      if (estado) {
        valores.push(estado);
        filtros.push(`s.estado = $${valores.length}`);
      }
      if (prioridad) {
        valores.push(prioridad);
        filtros.push(`s.prioridad = $${valores.length}`);
      }
      if (q) {
        valores.push(`%${q}%`);
        filtros.push(
          `(s.cargo ILIKE $${valores.length} OR c.nombre ILIKE $${valores.length} OR c.correo ILIKE $${valores.length})`,
        );
      }
      const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";
      const { rows } = await db.query(
        `${SELECT_SOLICITUD} ${where} ORDER BY s.id DESC`,
        valores,
      );
      res.json({ datos: rows.map(aSolicitud), total: rows.length });
    }),
  );

  router.get(
    "/:id",
    idNumerico(),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const fila = await cargarAutorizada(db, req.usuario, req.params.id);
      const [evaluacion, bitacora, analisis, postulacion] = await Promise.all([
        db.query("SELECT * FROM evaluaciones WHERE solicitud_id = $1", [
          req.params.id,
        ]),
        db.query(
          "SELECT * FROM bitacora WHERE solicitud_id = $1 ORDER BY id ASC",
          [req.params.id],
        ),
        db.query(
          "SELECT * FROM analisis_ia WHERE solicitud_id = $1 ORDER BY id DESC LIMIT 1",
          [req.params.id],
        ),
        db.query(
          `SELECT p.*, cc.codigo AS carpeta, a.nombre_original, a.tamano
             FROM postulaciones p
             LEFT JOIN carpetas_cv cc ON cc.id = p.carpeta_cv_id
             LEFT JOIN archivos_cv a ON a.carpeta_id = cc.id
            WHERE p.id = $1`,
          [fila.postulacion_id || 0],
        ),
      ]);

      res.json({
        datos: {
          ...aSolicitud(fila),
          evaluacion: evaluacion.rows[0]
            ? aEvaluacion(evaluacion.rows[0])
            : null,
          bitacora: bitacora.rows.map(aBitacora),
          analisis: analisis.rows[0] ? aAnalisis(analisis.rows[0]) : null,
          postulacion: postulacion.rows[0]
            ? {
                id: postulacion.rows[0].id,
                folio: postulacion.rows[0].folio,
                carpeta: postulacion.rows[0].carpeta,
                archivo: postulacion.rows[0].nombre_original
                  ? {
                      nombreOriginal: postulacion.rows[0].nombre_original,
                      tamano: Number(postulacion.rows[0].tamano),
                    }
                  : null,
              }
            : null,
        },
      });
    }),
  );

  router.post(
    "/",
    autorizar("ANALISTA"),
    validar(solicitudSchema),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const s = req.body;
      const { rows: candidatos } = await db.query(
        "SELECT * FROM candidatos WHERE id = $1",
        [s.candidatoId],
      );
      const candidato = candidatos[0];
      if (!candidato) throw noEncontrado("Candidato");

      const responsable = s.responsable || req.usuario.nombre;
      const { rows } = await db.query(
        `INSERT INTO solicitudes
          (candidato_id, cargo, familia, fecha_solicitud, estado, responsable,
           prioridad, observaciones, fecha_entrevista)
         VALUES ($1,$2,$3,$4,'Pendiente',$5,$6,$7,$8)
         RETURNING *`,
        [
          s.candidatoId,
          candidato.cargo,
          candidato.familia,
          s.fechaSolicitud,
          responsable,
          s.prioridad,
          s.observaciones,
          s.fechaEntrevista,
        ],
      );
      await registrarBitacora(
        db,
        rows[0].id,
        null,
        "Pendiente",
        responsable,
      );
      const detalle = await cargarAutorizada(db, req.usuario, rows[0].id);
      res.status(201).json({ datos: aSolicitud(detalle) });
    }),
  );

  router.put(
    "/:id",
    autorizar("ANALISTA"),
    idNumerico(),
    validar(solicitudSchema),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const s = req.body;
      const actual = await cargarAutorizada(db, req.usuario, req.params.id);
      const { rows: candidatos } = await db.query(
        "SELECT * FROM candidatos WHERE id = $1",
        [s.candidatoId],
      );
      const candidato = candidatos[0];
      if (!candidato) throw noEncontrado("Candidato");

      const { rows } = await db.query(
        `UPDATE solicitudes SET
           candidato_id = $1, cargo = $2, familia = $3, fecha_solicitud = $4,
           responsable = $5, prioridad = $6, observaciones = $7,
           fecha_entrevista = $8
         WHERE id = $9 RETURNING *`,
        [
          s.candidatoId,
          candidato.cargo,
          candidato.familia,
          s.fechaSolicitud,
          s.responsable || actual.responsable,
          s.prioridad,
          s.observaciones,
          s.fechaEntrevista,
          req.params.id,
        ],
      );
      await registrarBitacora(
        db,
        req.params.id,
        actual.estado,
        rows[0].estado,
        req.usuario.nombre,
      );
      const detalle = await cargarAutorizada(db, req.usuario, req.params.id);
      res.json({ datos: aSolicitud(detalle) });
    }),
  );

  router.patch(
    "/:id/estado",
    autorizar("ANALISTA", "EVALUADOR"),
    idNumerico(),
    validar(estadoSchema),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const actual = await cargarAutorizada(db, req.usuario, req.params.id);
      const { rows } = await db.query(
        "UPDATE solicitudes SET estado = $1 WHERE id = $2 RETURNING *",
        [req.body.estado, req.params.id],
      );
      await registrarBitacora(
        db,
        req.params.id,
        actual.estado,
        rows[0].estado,
        req.usuario.nombre,
      );
      const detalle = await cargarAutorizada(db, req.usuario, req.params.id);
      res.json({ datos: aSolicitud(detalle) });
    }),
  );

  router.delete(
    "/:id",
    autorizar("ANALISTA"),
    idNumerico(),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      await cargarAutorizada(db, req.usuario, req.params.id);
      await db.query("DELETE FROM solicitudes WHERE id = $1", [req.params.id]);
      res.json({ mensaje: "Solicitud eliminada correctamente." });
    }),
  );

  router.get(
    "/:id/bitacora",
    idNumerico(),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      await cargarAutorizada(db, req.usuario, req.params.id);
      const { rows } = await db.query(
        "SELECT * FROM bitacora WHERE solicitud_id = $1 ORDER BY id ASC",
        [req.params.id],
      );
      res.json({ datos: rows.map(aBitacora) });
    }),
  );

  router.get(
    "/:id/evaluacion",
    idNumerico(),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      await cargarAutorizada(db, req.usuario, req.params.id);
      const { rows } = await db.query(
        "SELECT * FROM evaluaciones WHERE solicitud_id = $1",
        [req.params.id],
      );
      res.json({ datos: rows[0] ? aEvaluacion(rows[0]) : null });
    }),
  );

  router.put(
    "/:id/evaluacion",
    autorizar("EVALUADOR"),
    idNumerico(),
    validar(evaluacionSchema),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const actual = await cargarAutorizada(db, req.usuario, req.params.id);
      const e = req.body;

      const { rows } = await db.query(
        `INSERT INTO evaluaciones
          (solicitud_id, fecha_evaluacion, resultado, categoria, observaciones, evaluador)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (solicitud_id) DO UPDATE SET
           fecha_evaluacion = EXCLUDED.fecha_evaluacion,
           resultado = EXCLUDED.resultado,
           categoria = EXCLUDED.categoria,
           observaciones = EXCLUDED.observaciones,
           evaluador = EXCLUDED.evaluador,
           actualizado_en = NOW()
         RETURNING *`,
        [
          req.params.id,
          e.fechaEvaluacion,
          e.resultado,
          e.categoria,
          e.observaciones,
          req.usuario.nombre,
        ],
      );

      const nuevoEstado = e.finalizar ? "Finalizada" : actual.estado;
      if (nuevoEstado !== actual.estado) {
        await db.query(
          `UPDATE solicitudes SET estado = $1, fecha_informe = $2 WHERE id = $3`,
          [
            nuevoEstado,
            e.finalizar ? e.fechaEvaluacion : actual.fecha_informe,
            req.params.id,
          ],
        );
        await registrarBitacora(
          db,
          req.params.id,
          actual.estado,
          nuevoEstado,
          req.usuario.nombre,
        );
      }

      res.json({
        datos: aEvaluacion(rows[0]),
        mensaje: e.finalizar
          ? "Evaluación guardada y solicitud finalizada."
          : "Evaluación guardada correctamente.",
      });
    }),
  );

  router.get(
    "/:id/analisis",
    idNumerico(),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      await cargarAutorizada(db, req.usuario, req.params.id);
      const { rows } = await db.query(
        "SELECT * FROM analisis_ia WHERE solicitud_id = $1 ORDER BY id DESC LIMIT 1",
        [req.params.id],
      );
      res.json({ datos: rows[0] ? aAnalisis(rows[0]) : null });
    }),
  );

  router.post(
    "/:id/analisis",
    autorizar("ANALISTA", "EVALUADOR"),
    idNumerico(),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const solicitud = await cargarAutorizada(
        db,
        req.usuario,
        req.params.id,
      );

      const { rows: postulaciones } = await db.query(
        `SELECT p.*, cc.codigo AS carpeta
           FROM postulaciones p
           LEFT JOIN carpetas_cv cc ON cc.id = p.carpeta_cv_id
          WHERE p.candidato_id = $1
          ORDER BY p.id DESC LIMIT 1`,
        [solicitud.candidato_id],
      );
      const postulacion = postulaciones[0];
      if (!postulacion) {
        throw new HttpError(
          422,
          "La solicitud no tiene una postulación con currículum asociado.",
        );
      }

      const { rows: archivos } = await db.query(
        "SELECT * FROM archivos_cv WHERE carpeta_id = $1 ORDER BY id DESC LIMIT 1",
        [postulacion.carpeta_cv_id || 0],
      );
      const archivo = archivos[0];
      if (!archivo) {
        throw new HttpError(
          422,
          "No se encontró el archivo de currículum de esta postulación.",
        );
      }

      let oferta = null;
      if (postulacion.oferta_id) {
        const { rows } = await db.query("SELECT * FROM ofertas WHERE id = $1", [
          postulacion.oferta_id,
        ]);
        oferta = rows[0] || null;
      }

      const texto = await extraerTexto({
        buffer: Buffer.from(archivo.contenido),
        originalname: archivo.nombre_original,
      });
      const analisis = await analizarConGroq({
        oferta,
        candidato: {
          nombre: solicitud.candidato_nombre,
          cargo: solicitud.cargo,
        },
        textoCv: texto,
      });

      const { rows } = await db.query(
        `INSERT INTO analisis_ia
          (solicitud_id, puntaje, resumen, formacion, experiencia, habilidades,
           requisitos, preguntas, faltantes, limitaciones, modelo, prompt_version, creado_por)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING *`,
        [
          req.params.id,
          analisis.puntaje,
          analisis.resumen,
          analisis.formacion,
          analisis.experiencia,
          JSON.stringify(analisis.habilidades),
          JSON.stringify(analisis.requisitos),
          JSON.stringify(analisis.preguntas),
          JSON.stringify(analisis.faltantes),
          analisis.limitaciones,
          analisis.modelo,
          analisis.promptVersion,
          req.usuario.nombre,
        ],
      );
      res.status(201).json({
        datos: aAnalisis(rows[0]),
        aviso:
          "Análisis generado con IA como apoyo. Requiere revisión humana antes de cualquier decisión.",
      });
    }),
  );

  router.patch(
    "/:id/analisis/revision",
    autorizar("ANALISTA", "EVALUADOR"),
    idNumerico(),
    validar(revisionSchema),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      await cargarAutorizada(db, req.usuario, req.params.id);
      const { rows: existentes } = await db.query(
        "SELECT * FROM analisis_ia WHERE solicitud_id = $1 ORDER BY id DESC LIMIT 1",
        [req.params.id],
      );
      if (!existentes[0]) throw noEncontrado("Análisis de IA");
      const { rows } = await db.query(
        `UPDATE analisis_ia
            SET revisado_por = $1, revisado_en = NOW()
          WHERE id = $2 RETURNING *`,
        [req.usuario.nombre, existentes[0].id],
      );
      res.json({
        datos: aAnalisis(rows[0]),
        mensaje: `Análisis revisado por ${req.usuario.nombre}.`,
      });
    }),
  );

  return router;
}
