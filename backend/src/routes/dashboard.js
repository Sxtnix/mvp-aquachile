import { Router } from "express";
import { asincrono } from "../middleware/errors.js";
import { autenticar } from "../middleware/auth.js";
import { aSolicitud } from "../lib/serializers.js";

export function dashboardRouter() {
  const router = Router();
  router.use(autenticar);

  router.get(
    "/",
    asincrono(async (req, res) => {
      const db = req.app.locals.db;
      const esEvaluador = req.usuario.rol === "EVALUADOR";
      const filtro = esEvaluador ? "WHERE responsable = $1" : "";
      const valores = esEvaluador ? [req.usuario.nombre] : [];

      const [
        candidatos,
        ofertas,
        solicitudes,
        evaluaciones,
        postulaciones,
        analisis,
        ultimas,
        porOferta,
      ] = await Promise.all([
        db.query("SELECT COUNT(*)::int AS total FROM candidatos"),
        db.query(
          "SELECT estado, COUNT(*)::int AS total FROM ofertas GROUP BY estado",
        ),
        db.query(
          `SELECT estado, COUNT(*)::int AS total FROM solicitudes ${filtro} GROUP BY estado`,
          valores,
        ),
        db.query("SELECT COUNT(*)::int AS total FROM evaluaciones"),
        db.query("SELECT COUNT(*)::int AS total FROM postulaciones"),
        db.query(
          "SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE revisado_en IS NULL)::int AS pendientes FROM analisis_ia",
        ),
        db.query(
          `SELECT s.*, c.nombre AS candidato_nombre, c.correo AS candidato_correo
             FROM solicitudes s
             JOIN candidatos c ON c.id = s.candidato_id
             ${filtro}
            ORDER BY s.id DESC LIMIT 5`,
          valores,
        ),
        db.query(
          `SELECT o.cargo, COUNT(p.id)::int AS total
             FROM ofertas o
             LEFT JOIN postulaciones p ON p.oferta_id = o.id
            GROUP BY o.id, o.cargo
            ORDER BY total DESC, o.id DESC
            LIMIT 6`,
        ),
      ]);

      const contar = (filas, estado) =>
        filas.find((fila) => fila.estado === estado)?.total || 0;

      const ofertasFilas = ofertas.rows;
      const solicitudesFilas = solicitudes.rows;

      res.json({
        resumen: {
          candidatos: candidatos.rows[0].total,
          ofertasPublicadas: contar(ofertasFilas, "Publicada"),
          ofertasBorrador: contar(ofertasFilas, "Borrador"),
          ofertasCerradas: contar(ofertasFilas, "Cerrada"),
          postulaciones: postulaciones.rows[0].total,
          solicitudesPendientes: contar(solicitudesFilas, "Pendiente"),
          solicitudesEnProceso: contar(solicitudesFilas, "En proceso"),
          solicitudesFinalizadas: contar(solicitudesFilas, "Finalizada"),
          evaluaciones: evaluaciones.rows[0].total,
          analisisIa: analisis.rows[0].total,
          analisisPendientesRevision: analisis.rows[0].pendientes,
        },
        solicitudesPorEstado: solicitudesFilas,
        ofertasPorEstado: ofertasFilas,
        ultimasSolicitudes: ultimas.rows.map(aSolicitud),
        postulacionesPorOferta: porOferta.rows.map((fila) => ({
          cargo: fila.cargo,
          total: Number(fila.total),
        })),
      });
    }),
  );

  return router;
}
