import { Router } from "express";
import { z } from "zod";
import { asincrono, HttpError, noEncontrado } from "../middleware/errors.js";
import { autorizar, autenticar } from "../middleware/auth.js";
import { idNumerico, validar } from "../middleware/validar.js";
import { aCandidato } from "../lib/serializers.js";

const fechaISO = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Usa el formato AAAA-MM-DD.");

const candidatoSchema = z.object({
  nombre: z.string().trim().min(3, "El nombre es obligatorio.").max(120),
  correo: z.string().trim().email("Correo inválido.").max(200),
  telefono: z.string().trim().min(6, "El teléfono es obligatorio.").max(40),
  cargo: z.string().trim().min(2, "El cargo es obligatorio.").max(120),
  familia: z.string().trim().min(2, "La familia es obligatoria.").max(80),
  origen: z.enum(["Externo", "Interno"]),
  ubicacion: z.string().trim().min(2, "La ubicación es obligatoria.").max(120),
  departamento: z
    .string()
    .trim()
    .min(2, "El departamento es obligatorio.")
    .max(80),
  requiereReferencia: z.boolean().optional().default(false),
  fechaPostulacion: fechaISO,
});

export function candidatosRouter() {
  const router = Router();
  router.use(autenticar);

  router.get(
    "/",
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const { q = "", familia = "", origen = "" } = req.query;
      const filtros = [];
      const valores = [];
      if (q) {
        valores.push(`%${q}%`);
        filtros.push(
          `(nombre ILIKE $${valores.length} OR correo ILIKE $${valores.length} OR cargo ILIKE $${valores.length})`,
        );
      }
      if (familia) {
        valores.push(familia);
        filtros.push(`familia = $${valores.length}`);
      }
      if (origen) {
        valores.push(origen);
        filtros.push(`origen = $${valores.length}`);
      }
      const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";
      const { rows } = await db.query(
        `SELECT * FROM candidatos ${where} ORDER BY id DESC`,
        valores,
      );
      res.json({ datos: rows.map(aCandidato), total: rows.length });
    }),
  );

  router.get(
    "/:id",
    idNumerico(),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const { rows } = await db.query("SELECT * FROM candidatos WHERE id = $1", [
        req.params.id,
      ]);
      if (!rows[0]) throw noEncontrado("Candidato");
      res.json({ datos: aCandidato(rows[0]) });
    }),
  );

  router.post(
    "/",
    autorizar("ANALISTA"),
    validar(candidatoSchema),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const c = req.body;
      const { rows } = await db.query(
        `INSERT INTO candidatos
          (nombre, correo, telefono, cargo, familia, origen, ubicacion, departamento,
           requiere_referencia, canal, fecha_postulacion)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Interno',$10)
         RETURNING *`,
        [
          c.nombre,
          c.correo,
          c.telefono,
          c.cargo,
          c.familia,
          c.origen,
          c.ubicacion,
          c.departamento,
          c.requiereReferencia,
          c.fechaPostulacion,
        ],
      );
      res.status(201).json({ datos: aCandidato(rows[0]) });
    }),
  );

  router.put(
    "/:id",
    autorizar("ANALISTA"),
    idNumerico(),
    validar(candidatoSchema),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const c = req.body;
      const { rows } = await db.query(
        `UPDATE candidatos SET
           nombre = $1, correo = $2, telefono = $3, cargo = $4, familia = $5,
           origen = $6, ubicacion = $7, departamento = $8,
           requiere_referencia = $9, fecha_postulacion = $10
         WHERE id = $11 RETURNING *`,
        [
          c.nombre,
          c.correo,
          c.telefono,
          c.cargo,
          c.familia,
          c.origen,
          c.ubicacion,
          c.departamento,
          c.requiereReferencia,
          c.fechaPostulacion,
          req.params.id,
        ],
      );
      if (!rows[0]) throw noEncontrado("Candidato");
      res.json({ datos: aCandidato(rows[0]) });
    }),
  );

  router.delete(
    "/:id",
    autorizar("ANALISTA"),
    idNumerico(),
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const { rows } = await db.query(
        "DELETE FROM candidatos WHERE id = $1 RETURNING id",
        [req.params.id],
      );
      if (!rows[0]) throw noEncontrado("Candidato");
      res.json({ mensaje: "Candidato eliminado correctamente." });
    }),
  );

  return router;
}
