import { config } from "./config.js";
import { createApp } from "./app.js";
import { closeDb, getDb } from "./db/index.js";
import { prepararDb } from "./db/migrate.js";

async function main() {
  const db = await getDb();
  await prepararDb(db);
  const app = await createApp({ db });

  const servidor = app.listen(config.port, () => {
    console.log(`AquaChile API escuchando en http://localhost:${config.port}`);
    console.log(`Swagger UI: http://localhost:${config.port}/api/docs`);
    console.log(`Base de datos: ${db.kind}`);
    console.log(
      `IA Groq: ${config.groqApiKey ? `configurada (${config.groqModel})` : "no configurada"}`,
    );
  });

  const cerrar = async () => {
    servidor.close(async () => {
      await closeDb();
      process.exit(0);
    });
  };
  process.on("SIGINT", cerrar);
  process.on("SIGTERM", cerrar);
}

main().catch((error) => {
  console.error("No fue posible iniciar la API:", error);
  process.exit(1);
});
