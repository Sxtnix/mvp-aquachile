import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  closeDb,
  createDatabase,
  getDb,
  setDb,
} from "../src/db/index.js";
import { migrate, prepararDb } from "../src/db/migrate.js";
import { seed, CREDENCIALES_DEMO } from "../src/db/seed.js";
import { aAnalisis, aCandidato } from "../src/lib/serializers.js";

describe("capa de base de datos", () => {
  it("crea una base en memoria, migra y siembra de forma idempotente", async () => {
    const db = await createDatabase({ memory: true });
    await migrate(db);
    await seed(db);
    await seed(db);

    const usuarios = await db.query("SELECT COUNT(*)::int AS total FROM usuarios");
    expect(usuarios.rows[0].total).toBe(3);
    expect(CREDENCIALES_DEMO.usuarios).toHaveLength(3);

    const candidatos = await db.query(
      "SELECT COUNT(*)::int AS total FROM candidatos",
    );
    expect(candidatos.rows[0].total).toBe(10);
    await db.close();
  });

  it("prepara la base con seed opcional", async () => {
    const db = await createDatabase({ memory: true });
    await prepararDb(db, { seedData: false });
    const usuarios = await db.query("SELECT COUNT(*)::int AS total FROM usuarios");
    expect(usuarios.rows[0].total).toBe(0);
    await db.close();
  });

  it("hace commit y rollback de transacciones", async () => {
    const db = await createDatabase({ memory: true });
    await db.exec("CREATE TABLE tx_demo (id SERIAL PRIMARY KEY, valor TEXT)");

    await db.transaction(async (tx) => {
      await tx.query("INSERT INTO tx_demo (valor) VALUES ($1)", ["ok"]);
    });
    let total = await db.query("SELECT COUNT(*)::int AS total FROM tx_demo");
    expect(total.rows[0].total).toBe(1);

    await expect(
      db.transaction(async (tx) => {
        await tx.query("INSERT INTO tx_demo (valor) VALUES ($1)", ["rollback"]);
        throw new Error("falla intencional");
      }),
    ).rejects.toThrow("falla intencional");
    total = await db.query("SELECT COUNT(*)::int AS total FROM tx_demo");
    expect(total.rows[0].total).toBe(1);
    await db.close();
  });

  it("persiste en un directorio local", async () => {
    const directorio = path.join(
      os.tmpdir(),
      `aquachile-test-${crypto.randomUUID()}`,
    );
    const db = await createDatabase({ pgliteDir: directorio, databaseUrl: "" });
    expect(db.kind).toBe("pglite");
    await migrarYInsertar(db, directorio);
    await db.close();
    expect(fs.existsSync(directorio)).toBe(true);
  });

  it("mantiene una instancia global con setDb/getDb/closeDb", async () => {
    const db = await createDatabase({ memory: true });
    setDb(db);
    expect(await getDb()).toBe(db);
    await closeDb();
  });

  it("crea la instancia global por defecto si no existe", async () => {
    const directorio = path.join(
      os.tmpdir(),
      `aquachile-global-${crypto.randomUUID()}`,
    );
    await closeDb();
    const { config } = await import("../src/config.js");
    const anterior = config.pgliteDir;
    config.pgliteDir = directorio;
    try {
      const db = await getDb();
      expect(db.kind).toBe("pglite");
      const respuesta = await db.query("SELECT 1 AS valor");
      expect(respuesta.rows[0].valor).toBe(1);
      await closeDb();
    } finally {
      config.pgliteDir = anterior;
    }
  });
});

async function migrarYInsertar(db, directorio) {
  await migrate(db);
  await db.query("INSERT INTO candidatos (nombre, correo, fecha_postulacion) VALUES ($1,$2,$3)", [
    "Persistente",
    "persistente@correo.cl",
    "2026-01-01",
  ]);
  const respuesta = await db.query(
    "SELECT COUNT(*)::int AS total FROM candidatos WHERE correo = $1",
    ["persistente@correo.cl"],
  );
  expect(respuesta.rows[0].total).toBe(1);
  expect(fs.existsSync(directorio)).toBe(true);
}

describe("serializadores", () => {
  it("normaliza booleanos y el alias unidad/departamento", () => {
    const candidato = aCandidato({
      id: 1,
      nombre: "Ana",
      correo: "ana@correo.cl",
      telefono: "123",
      cargo: "Analista",
      familia: "Profesional A",
      origen: "Externo",
      ubicacion: "Oficina",
      departamento: "Calidad",
      requiere_referencia: 1,
      canal: "Portal",
      fecha_postulacion: "2026-01-01",
    });
    expect(candidato.requiereReferencia).toBe(true);
    expect(candidato.unidad).toBe("Calidad");
  });

  it("interpreta JSON almacenado como texto y campos nulos", () => {
    const analisis = aAnalisis({
      id: 1,
      solicitud_id: 2,
      puntaje: "75",
      resumen: "ok",
      formacion: "",
      experiencia: "",
      habilidades: '["a","b"]',
      requisitos: "no-json",
      preguntas: [{ pregunta: "p", objetivo: "o" }],
      faltantes: null,
      limitaciones: "",
      modelo: "m",
      prompt_version: "v1",
      creado_por: "Camila",
      revisado_por: null,
      revisado_en: null,
      creado_en: "2026-01-01",
    });
    expect(analisis.puntaje).toBe(75);
    expect(analisis.habilidades).toEqual(["a", "b"]);
    expect(analisis.requisitos).toEqual([]);
    expect(analisis.preguntas).toHaveLength(1);
    expect(analisis.faltantes).toEqual([]);
    expect(analisis.pendienteRevision).toBe(true);
  });
});
