import crypto from "node:crypto";
import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { config } from "../config.js";
import {
  asincrono,
  HttpError,
  noEncontrado,
} from "../middleware/errors.js";
import { aOferta } from "../lib/serializers.js";
import { codigoCarpeta, validarArchivoCv } from "../services/cv.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxCvBytes, files: 1 },
});

const booleanDesdeFormulario = z.preprocess(
  (valor) => valor === true || valor === "true" || valor === "on" || valor === "1",
  z.boolean(),
);

const postulacionSchema = z.object({
  ofertaId: z.coerce.number().int().positive("La oferta es obligatoria."),
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre completo es obligatorio.")
    .max(120),
  correo: z.string().trim().toLowerCase().email("Correo inválido.").max(200),
  telefono: z.string().trim().min(6, "El teléfono es obligatorio.").max(40),
  consentimiento: booleanDesdeFormulario,
});

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function generarFolio() {
  return `AQ-${new Date().getFullYear()}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;
}

export function publicoRouter() {
  const router = Router();

  router.get(
    "/ofertas",
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const { q = "", familia = "", modalidad = "", departamento = "" } =
        req.query;
      const filtros = ["estado = 'Publicada'"];
      const valores = [];
      if (q) {
        valores.push(`%${q}%`);
        filtros.push(
          `(cargo ILIKE $${valores.length} OR ubicacion ILIKE $${valores.length} OR departamento ILIKE $${valores.length})`,
        );
      }
      for (const [campo, valor] of [
        ["familia", familia],
        ["modalidad", modalidad],
        ["departamento", departamento],
      ]) {
        if (valor) {
          valores.push(valor);
          filtros.push(`${campo} = $${valores.length}`);
        }
      }
      const { rows } = await db.query(
        `SELECT * FROM ofertas WHERE ${filtros.join(" AND ")}
         ORDER BY fecha_publicacion DESC NULLS LAST, id DESC`,
        valores,
      );
      res.json({
        datos: rows.map((fila) => {
          const oferta = aOferta(fila);
          return {
            ...oferta,
            postulable: !oferta.fechaCierre || oferta.fechaCierre >= hoyISO(),
          };
        }),
        total: rows.length,
      });
    }),
  );

  router.get(
    "/ofertas/:id",
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        throw new HttpError(400, "Identificador inválido.");
      }
      const { rows } = await db.query(
        "SELECT * FROM ofertas WHERE id = $1 AND estado = 'Publicada'",
        [id],
      );
      if (!rows[0]) throw noEncontrado("Oferta");
      const oferta = aOferta(rows[0]);
      res.json({
        datos: {
          ...oferta,
          postulable: !oferta.fechaCierre || oferta.fechaCierre >= hoyISO(),
        },
      });
    }),
  );

  router.post(
    "/postulaciones",
    upload.single("curriculum"),
    validarPostulacion,
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const datos = req.body;
      const archivoInfo = validarArchivoCv(req.file);

      const { rows: ofertas } = await db.query(
        "SELECT * FROM ofertas WHERE id = $1 AND estado = 'Publicada'",
        [datos.ofertaId],
      );
      const oferta = ofertas[0];
      if (!oferta) throw noEncontrado("Oferta");
      if (oferta.fecha_cierre && oferta.fecha_cierre < hoyISO()) {
        throw new HttpError(
          409,
          "La oferta ya cerró sus postulaciones. Revisa las ofertas vigentes.",
        );
      }

      const { rows: candidatos } = await db.query(
        `INSERT INTO candidatos
          (nombre, correo, telefono, cargo, familia, origen, ubicacion, departamento,
           requiere_referencia, canal, fecha_postulacion)
         VALUES ($1,$2,$3,$4,$5,'Externo',$6,$7,FALSE,'Portal',$8)
         ON CONFLICT (correo) DO UPDATE SET
           nombre = EXCLUDED.nombre,
           telefono = EXCLUDED.telefono,
           cargo = EXCLUDED.cargo,
           familia = EXCLUDED.familia,
           ubicacion = EXCLUDED.ubicacion,
           departamento = EXCLUDED.departamento,
           fecha_postulacion = EXCLUDED.fecha_postulacion
         RETURNING *`,
        [
          datos.nombre,
          datos.correo,
          datos.telefono,
          oferta.cargo,
          oferta.familia,
          oferta.ubicacion,
          oferta.departamento,
          hoyISO(),
        ],
      );
      const candidato = candidatos[0];

      const { rows: existentes } = await db.query(
        "SELECT folio FROM postulaciones WHERE oferta_id = $1 AND candidato_id = $2",
        [oferta.id, candidato.id],
      );
      if (existentes[0]) {
        throw new HttpError(
          409,
          `Ya registramos una postulación tuya a esta oferta (folio ${existentes[0].folio}).`,
        );
      }

      const creada = await db.transaction(async (tx) => {
        const { rows: carpetas } = await tx.query(
          "INSERT INTO carpetas_cv (codigo, nombre_postulante, candidato_id) VALUES ($1,$2,$3) RETURNING id",
          [`TMP-${crypto.randomUUID()}`, datos.nombre, candidato.id],
        );
        const carpetaId = carpetas[0].id;
        const codigo = codigoCarpeta(carpetaId, datos.nombre);
        await tx.query("UPDATE carpetas_cv SET codigo = $1 WHERE id = $2", [
          codigo,
          carpetaId,
        ]);

        await tx.query(
          `INSERT INTO archivos_cv
            (carpeta_id, nombre_original, mime, tamano, sha256, contenido)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            carpetaId,
            req.file.originalname,
            archivoInfo.mime,
            req.file.size,
            archivoInfo.sha256,
            req.file.buffer,
          ],
        );

        const folio = generarFolio();
        const { rows: postulaciones } = await tx.query(
          `INSERT INTO postulaciones
            (folio, oferta_id, candidato_id, carpeta_cv_id, fecha, estado, consentimiento)
           VALUES ($1,$2,$3,$4,$5,'Recibida',TRUE)
           RETURNING *`,
          [folio, oferta.id, candidato.id, carpetaId, hoyISO()],
        );

        const { rows: solicitudes } = await tx.query(
          `INSERT INTO solicitudes
            (candidato_id, postulacion_id, oferta_id, cargo, familia, fecha_solicitud,
             estado, responsable, prioridad, observaciones)
           VALUES ($1,$2,$3,$4,$5,$6,'Pendiente',NULL,'Media',$7)
           RETURNING *`,
          [
            candidato.id,
            postulaciones[0].id,
            oferta.id,
            oferta.cargo,
            oferta.familia,
            hoyISO(),
            "Postulación en línea recibida desde el portal público.",
          ],
        );

        await tx.query(
          `INSERT INTO bitacora (solicitud_id, fecha, estado_anterior, estado_nuevo, responsable)
           VALUES ($1,$2,NULL,'Pendiente','Sistema (portal público)')`,
          [solicitudes[0].id, hoyISO()],
        );

        return {
          postulacion: postulaciones[0],
          solicitud: solicitudes[0],
          carpeta: codigo,
        };
      });

      res.status(201).json({
        datos: {
          id: creada.postulacion.id,
          folio: creada.postulacion.folio,
          carpeta: creada.carpeta,
          solicitudId: creada.solicitud.id,
          candidato: {
            id: candidato.id,
            nombre: candidato.nombre,
            correo: candidato.correo,
          },
          oferta: {
            id: oferta.id,
            cargo: oferta.cargo,
            departamento: oferta.departamento,
            ubicacion: oferta.ubicacion,
          },
          archivo: {
            nombreOriginal: req.file.originalname,
            tamano: req.file.size,
            mime: archivoInfo.mime,
            sha256: archivoInfo.sha256,
          },
          mensaje:
            "Postulación recibida. El equipo de Reclutamiento y Selección revisará tus antecedentes.",
        },
      });
    }),
  );

  router.get(
    "/postulaciones/:folio",
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const correo = String(req.query.correo || "")
        .trim()
        .toLowerCase();
      if (!correo) {
        throw new HttpError(
          400,
          "Indica el correo con el que postulaste para consultar el estado.",
        );
      }
      const { rows } = await db.query(
        `SELECT p.folio, p.fecha, p.estado, s.estado AS estado_solicitud,
                o.cargo, o.departamento, o.ubicacion, cc.codigo AS carpeta
           FROM postulaciones p
           JOIN candidatos c ON c.id = p.candidato_id
           JOIN ofertas o ON o.id = p.oferta_id
           LEFT JOIN carpetas_cv cc ON cc.id = p.carpeta_cv_id
           LEFT JOIN solicitudes s ON s.postulacion_id = p.id
          WHERE p.folio = $1 AND LOWER(c.correo) = $2`,
        [req.params.folio.toUpperCase(), correo],
      );
      if (!rows[0]) throw noEncontrado("Postulación");
      res.json({
        datos: {
          folio: rows[0].folio,
          fecha: rows[0].fecha,
          estadoPostulacion: rows[0].estado,
          estadoSolicitud: rows[0].estado_solicitud,
          cargo: rows[0].cargo,
          departamento: rows[0].departamento,
          ubicacion: rows[0].ubicacion,
          carpeta: rows[0].carpeta,
        },
      });
    }),
  );

  return router;
}

function validarPostulacion(req, res, next) {
  const resultado = postulacionSchema.safeParse(req.body);
  if (!resultado.success) {
    const detalles = resultado.error.issues.map((issue) => ({
      campo: issue.path.join("."),
      mensaje: issue.message,
    }));
    return next(new HttpError(400, "Datos inválidos.", detalles));
  }
  req.body = resultado.data;
  return next();
}
