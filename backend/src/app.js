import fs from "node:fs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { load as cargarYaml } from "js-yaml";
import { config } from "./config.js";
import { getDb } from "./db/index.js";
import { authRouter } from "./routes/auth.js";
import { candidatosRouter } from "./routes/candidatos.js";
import { ofertasRouter } from "./routes/ofertas.js";
import { solicitudesRouter } from "./routes/solicitudes.js";
import { postulacionesRouter } from "./routes/postulaciones.js";
import { publicoRouter } from "./routes/publico.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { iaRouter } from "./routes/ia.js";
import {
  manejadorErrores,
  noEncontradoHandler,
} from "./middleware/errors.js";

function cargarOpenApi() {
  const archivo = new URL("./docs/openapi.yaml", import.meta.url);
  return cargarYaml(fs.readFileSync(archivo, "utf8"));
}

function limitador(max, windowMs, mensaje) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: () => config.rateLimitDisabled || config.env === "test",
    message: { error: mensaje },
  });
}

export async function createApp({ db } = {}) {
  const database = db || (await getDb());
  const app = express();
  app.locals.db = database;

  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(
    cors({
      origin(origen, callback) {
        if (!origen || config.corsOrigins.includes(origen)) {
          return callback(null, true);
        }
        return callback(new Error(`Origen no permitido: ${origen}`));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "12mb" }));
  app.use(express.urlencoded({ extended: true, limit: "12mb" }));

  const openapi = cargarOpenApi();
  app.get("/api/openapi.json", (req, res) => res.json(openapi));
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(openapi, {
      customSiteTitle: "AquaChile API",
      swaggerOptions: { persistAuthorization: true },
    }),
  );

  app.get("/api/health", (req, res) => {
    res.json({
      estado: "ok",
      servicio: "AquaChile Reclutamiento API",
      baseDatos: database.kind,
      iaConfigurada: Boolean(config.groqApiKey),
      fecha: new Date().toISOString(),
    });
  });

  const loginLimiter = limitador(
    20,
    15 * 60 * 1000,
    "Demasiados intentos de inicio de sesión. Espera unos minutos.",
  );
  const postulacionLimiter = limitador(
    30,
    60 * 60 * 1000,
    "Demasiadas postulaciones desde esta conexión. Intenta más tarde.",
  );

  app.use("/api/auth/login", loginLimiter);
  app.use("/api/publico/postulaciones", postulacionLimiter);
  app.use("/api/auth", authRouter());
  app.use("/api/publico", publicoRouter());
  app.use("/api/candidatos", candidatosRouter());
  app.use("/api/ofertas", ofertasRouter());
  app.use("/api/solicitudes", solicitudesRouter());
  app.use("/api/postulaciones", postulacionesRouter());
  app.use("/api/dashboard", dashboardRouter());
  app.use("/api/ia", iaRouter());

  app.use(noEncontradoHandler);
  app.use(manejadorErrores);
  return app;
}
