import { Router } from "express";
import { z } from "zod";
import { asincrono, HttpError, noEncontrado } from "../middleware/errors.js";
import { autorizar, autenticar } from "../middleware/auth.js";
import { idNumerico, validar } from "../middleware/validar.js";
import { aOferta, aPostulacion } from "../lib/serializers.js";

const fechaISO = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Usa el formato AAAA-MM-DD.");

const fechaOpcional = z.union([fechaISO, z.literal(""), z.null()]).optional();

const ofertaSchema = z.object({
  cargo: z.string().trim().min(2, "El cargo es obligatorio.").max(120),
  familia: z.string().trim().min(2, "La familia es obligatoria.").max(80),
  departamento: z
    .string()
    .trim()
    .min(2, "El departamento es obligatorio.")
    .max(80),
  ubicacion: z.string().trim().min(2, "La ubicación es obligatoria.").max(120),
  modalidad: z.enum(["Presencial", "Híbrida", "Remota"]),
  descripcion: z.string().trim().min(10, "Describe la oferta.").max(3000),
  funciones: z.string().trim().min(5, "Agrega las funciones.").max(4000),
  requisitos: z.string().trim().min(5, "Agrega los requisitos.").max(4000),
  beneficios: z.string().trim().max(4000).optional().default(""),
  sueldo: z.string().trim().max(200).optional().default(""),
  vacantes: z.coerce.number().int().min(1).max(99),
  fechaPublicacion: fechaOpcional,
  fechaCierre: fechaOpcional,
  estado: z.enum(["Borrador", "Publicada", "Cerrada"]).optional(),
  responsable: z.string().trim().max(120).optional().default(""),
});

const estadoSchema = z.object({
  estado: z.enum(["Borrador", "Publicada", "Cerrada"]),
});

export function ofertasRouter() {
  const router = Router();
  router.use(autenticar);

  router.get(
    "/",
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const { q = "", estado = "", familia = "", modalidad = "" } = req.query;
      const filtros = [];
      const valores = [];
      if (q) {
        valores.push(`%${q}%`);
        filtros.push(
          `(cargo ILIKE $${valores.length} OR departamento ILIKE $${valores.length} OR ubicacion ILIKE $${valores.length})`,
        );
      }
      for (const [campo, valor] of [
        ["estado", estado],
        ["familia", familia],
        ["modalidad", modalidad],
      ]) {
        if (valor) {
          valores.push(valor);
          filtros.push(`${campo} = $${valores.length}`);
        }
      }
      const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";
      const { rows } = await db.query(
        `SELECT * FROM ofertas ${where} ORDER BY id DESC`,
        valores,
      );
      res.json({ datos: rows.map(aOferta), total: rows.length });
    }),
  );

  router.get(
    "/:id",
    idNumerico(),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const { rows } = await db.query("SELECT * FROM ofertas WHERE id = $1", [
        req.params.id,
      ]);
      if (!rows[0]) throw noEncontrado("Oferta");
      res.json({ datos: aOferta(rows[0]) });
    }),
  );

  router.get(
    "/:id/postulaciones",
    autorizar("ANALISTA", "EVALUADOR"),
    idNumerico(),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const { rows } = await db.query(
        `SELECT p.*, ca.nombre AS candidato_nombre, ca.correo AS candidato_correo,
                ca.telefono AS candidato_telefono, cc.codigo AS carpeta,
                a.id AS archivo_id, a.nombre_original, a.mime, a.tamano, a.sha256,
                o.cargo AS oferta_cargo, o.departamento AS oferta_departamento,
                o.ubicacion AS oferta_ubicacion
           FROM postulaciones p
           JOIN candidatos ca ON ca.id = p.candidato_id
           JOIN ofertas o ON o.id = p.oferta_id
           LEFT JOIN carpetas_cv cc ON cc.id = p.carpeta_cv_id
           LEFT JOIN archivos_cv a ON a.carpeta_id = cc.id
          WHERE p.oferta_id = $1
          ORDER BY p.id DESC`,
        [req.params.id],
      );
      res.json({ datos: rows.map(aPostulacion), total: rows.length });
    }),
  );

  router.post(
    "/",
    autorizar("ANALISTA"),
    validar(ofertaSchema),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const o = req.body;
      const estado = o.estado || "Borrador";
      const fechaPublicacion =
        estado === "Publicada" && !o.fechaPublicacion
          ? new Date().toISOString().slice(0, 10)
          : o.fechaPublicacion || null;
      const { rows } = await db.query(
        `INSERT INTO ofertas
          (cargo, familia, departamento, ubicacion, modalidad, descripcion, funciones,
           requisitos, beneficios, sueldo, vacantes, fecha_publicacion, fecha_cierre,
           estado, responsable)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         RETURNING *`,
        [
          o.cargo,
          o.familia,
          o.departamento,
          o.ubicacion,
          o.modalidad,
          o.descripcion,
          o.funciones,
          o.requisitos,
          o.beneficios,
          o.sueldo,
          o.vacantes,
          fechaPublicacion,
          o.fechaCierre || null,
          estado,
          o.responsable || req.usuario.nombre,
        ],
      );
      res.status(201).json({ datos: aOferta(rows[0]) });
    }),
  );

  router.put(
    "/:id",
    autorizar("ANALISTA"),
    idNumerico(),
    validar(ofertaSchema),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const o = req.body;
      const estado = o.estado || "Borrador";
      const { rows } = await db.query(
        `UPDATE ofertas SET
           cargo = $1, familia = $2, departamento = $3, ubicacion = $4,
           modalidad = $5, descripcion = $6, funciones = $7, requisitos = $8,
           beneficios = $9, sueldo = $10, vacantes = $11, fecha_publicacion = $12,
           fecha_cierre = $13, estado = $14, responsable = $15,
           actualizado_en = NOW()
         WHERE id = $16 RETURNING *`,
        [
          o.cargo,
          o.familia,
          o.departamento,
          o.ubicacion,
          o.modalidad,
          o.descripcion,
          o.funciones,
          o.requisitos,
          o.beneficios,
          o.sueldo,
          o.vacantes,
          o.fechaPublicacion || null,
          o.fechaCierre || null,
          estado,
          o.responsable || req.usuario.nombre,
          req.params.id,
        ],
      );
      if (!rows[0]) throw noEncontrado("Oferta");
      res.json({ datos: aOferta(rows[0]) });
    }),
  );

  router.patch(
    "/:id/estado",
    autorizar("ANALISTA"),
    idNumerico(),
    validar(estadoSchema),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const { rows: actuales } = await db.query(
        "SELECT * FROM ofertas WHERE id = $1",
        [req.params.id],
      );
      const oferta = actuales[0];
      if (!oferta) throw noEncontrado("Oferta");

      const fechaPublicacion =
        req.body.estado === "Publicada" && !oferta.fecha_publicacion
          ? new Date().toISOString().slice(0, 10)
          : oferta.fecha_publicacion;

      const { rows } = await db.query(
        `UPDATE ofertas SET estado = $1, fecha_publicacion = $2, actualizado_en = NOW()
         WHERE id = $3 RETURNING *`,
        [req.body.estado, fechaPublicacion, req.params.id],
      );
      res.json({ datos: aOferta(rows[0]) });
    }),
  );

  router.delete(
    "/:id",
    autorizar("ANALISTA"),
    idNumerico(),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const { rows: postulaciones } = await db.query(
        "SELECT COUNT(*)::int AS total FROM postulaciones WHERE oferta_id = $1",
        [req.params.id],
      );
      if (postulaciones[0].total > 0) {
        throw new HttpError(
          409,
          "No se puede eliminar una oferta con postulaciones registradas. Ciérrala en su lugar.",
        );
      }
      const { rows } = await db.query(
        "DELETE FROM ofertas WHERE id = $1 RETURNING id",
        [req.params.id],
      );
      if (!rows[0]) throw noEncontrado("Oferta");
      res.json({ mensaje: "Oferta eliminada correctamente." });
    }),
  );

  return router;
}
