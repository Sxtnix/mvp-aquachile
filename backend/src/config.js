import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(here, "..");

export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3001),
  databaseUrl: process.env.DATABASE_URL || "",
  pgliteDir: process.env.PGLITE_DIR || path.join(ROOT, "data", "aquachile"),
  jwtSecret: process.env.JWT_SECRET || "dev-access-secret-cambiar-en-produccion",
  refreshSecret:
    process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-cambiar-en-produccion",
  accessTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTtlDays: Number(process.env.REFRESH_TOKEN_DAYS || 7),
  corsOrigins: (
    process.env.CORS_ORIGIN ||
    "http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173"
  )
    .split(",")
    .map((origen) => origen.trim())
    .filter(Boolean),
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  groqUrl:
    process.env.GROQ_URL || "https://api.groq.com/openai/v1/chat/completions",
  cookieSecure: process.env.COOKIE_SECURE === "true",
  maxCvBytes: Number(process.env.MAX_CV_BYTES || 5 * 1024 * 1024),
  rateLimitDisabled: process.env.RATE_LIMIT_DISABLED === "true",
};
