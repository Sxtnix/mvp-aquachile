import fs from "node:fs";
import { seed } from "./seed.js";

export async function migrate(db) {
  const sql = fs.readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
  await db.exec(sql);
}

export async function prepararDb(db, { seedData = true } = {}) {
  await migrate(db);
  if (seedData) await seed(db);
  return db;
}
