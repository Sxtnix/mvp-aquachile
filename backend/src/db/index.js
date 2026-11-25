import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import { config } from "../config.js";

let instancia = null;

/**
 * Crea un adaptador de base de datos con la misma interfaz para PGlite (local)
 * y PostgreSQL (nube). Ambos exponen query/exec/transaction.
 */
export async function createDatabase({
  databaseUrl = config.databaseUrl,
  pgliteDir = config.pgliteDir,
  memory = false,
} = {}) {
  /* v8 ignore start -- rama PostgreSQL cubierta en despliegue con DATABASE_URL */
  if (databaseUrl) {
    const pool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: /localhost|127\.0\.0\.1/.test(databaseUrl)
        ? false
        : { rejectUnauthorized: false },
    });
    return {
      kind: "postgres",
      query: (sql, params = []) => pool.query(sql, params),
      exec: (sql) => pool.query(sql),
      async transaction(fn) {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          const result = await fn({
            query: (sql, params = []) => client.query(sql, params),
          });
          await client.query("COMMIT");
          return result;
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        } finally {
          client.release();
        }
      },
      close: () => pool.end(),
    };
  }
  /* v8 ignore stop */

  if (!memory) fs.mkdirSync(path.resolve(pgliteDir), { recursive: true });
  const pglite = memory ? new PGlite() : new PGlite(path.resolve(pgliteDir));
  await pglite.waitReady;

  return {
    kind: "pglite",
    query: (sql, params = []) => pglite.query(sql, params),
    exec: (sql) => pglite.exec(sql),
    async transaction(fn) {
      await pglite.exec("BEGIN");
      try {
        const result = await fn({
          query: (sql, params = []) => pglite.query(sql, params),
        });
        await pglite.exec("COMMIT");
        return result;
      } catch (error) {
        await pglite.exec("ROLLBACK");
        throw error;
      }
    },
    close: () => pglite.close(),
  };
}

export async function getDb() {
  if (!instancia) instancia = await createDatabase();
  return instancia;
}

export function setDb(db) {
  instancia = db;
}

export async function closeDb() {
  const actual = instancia;
  instancia = null;
  if (actual) await actual.close();
}
