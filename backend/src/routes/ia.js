import { Router } from "express";
import { config } from "../config.js";
import { autenticar } from "../middleware/auth.js";

export function iaRouter() {
  const router = Router();
  router.use(autenticar);

  router.get("/estado", (req, res) => {
    res.json({
      proveedor: "Groq",
      configurada: Boolean(config.groqApiKey),
      modelo: config.groqModel,
      modo: "apoyo con revisión humana obligatoria",
    });
  });

  return router;
}
