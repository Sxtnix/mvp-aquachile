import fs from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { crearEntorno, PDF_MINIMO } from "./helpers.js";

let entorno;

const PDF_REAL = new URL(
  "../../implementar a Aquachile/DSY1104_Evaluacion_Parcial_3_AquaChile.pdf",
  import.meta.url,
);

beforeAll(async () => {
  entorno = await crearEntorno();
});

afterAll(async () => {
  await entorno.db.close();
});

function postular(api, campos = {}, archivo = PDF_MINIMO, nombreArchivo = "cv.pdf") {
  let peticion = api.post("/api/publico/postulaciones");
  for (const [clave, valor] of Object.entries(campos)) {
    peticion = peticion.field(clave, String(valor));
  }
  if (archivo) {
    peticion = peticion.attach("curriculum", archivo, {
      filename: nombreArchivo,
      contentType: "application/pdf",
    });
  }
  return peticion;
}

const datosBase = {
  ofertaId: 1,
  nombre: "Postulante Público",
  correo: "postulante.publico@correo.cl",
  telefono: "+56 9 7777 8888",
  consentimiento: true,
};

describe("portal público", () => {
  it("lista solo ofertas publicadas y aplica filtros", async () => {
    const todas = await entorno.api.get("/api/publico/ofertas");
    expect(todas.status).toBe(200);
    expect(todas.body.total).toBe(3);
    expect(todas.body.datos.every((o) => o.estado === "Publicada")).toBe(true);
    expect(todas.body.datos[0].postulable).toBe(true);

    const busqueda = await entorno.api.get(
      "/api/publico/ofertas?q=Magallanes&familia=T%C3%A9cnico%20A&modalidad=Presencial&departamento=Mantenimiento",
    );
    expect(busqueda.body.total).toBe(1);

    const hibridas = await entorno.api.get(
      "/api/publico/ofertas?modalidad=H%C3%ADbrida",
    );
    expect(hibridas.body.datos).toHaveLength(1);
  });

  it("obtiene el detalle público y oculta borradores", async () => {
    const detalle = await entorno.api.get("/api/publico/ofertas/1");
    expect(detalle.status).toBe(200);
    expect(detalle.body.datos.cargo).toBe("Técnico de Mantenimiento");
    expect(detalle.body.datos.beneficios).toBeTruthy();

    const borrador = await entorno.api.get("/api/publico/ofertas/5");
    expect(borrador.status).toBe(404);

    const invalida = await entorno.api.get("/api/publico/ofertas/abc");
    expect(invalida.status).toBe(400);

    const inexistente = await entorno.api.get("/api/publico/ofertas/9999");
    expect(inexistente.status).toBe(404);
  });

  it("registra una postulación con currículum, carpeta y solicitud", async () => {
    const respuesta = await postular(entorno.api, datosBase);
    expect(respuesta.status).toBe(201);
    expect(respuesta.body.datos.folio).toMatch(/^AQ-\d{4}-[A-F0-9]{6}$/);
    expect(respuesta.body.datos.carpeta).toMatch(
      /^CV-\d{4}-\d{6}-POSTULANTE-PUBLICO$/,
    );
    expect(respuesta.body.datos.archivo.sha256).toHaveLength(64);

    const { rows: carpetas } = await entorno.db.query(
      "SELECT * FROM carpetas_cv WHERE id = (SELECT carpeta_cv_id FROM postulaciones WHERE folio = $1)",
      [respuesta.body.datos.folio],
    );
    expect(carpetas).toHaveLength(1);
    expect(carpetas[0].nombre_postulante).toBe(datosBase.nombre);

    const { rows: archivos } = await entorno.db.query(
      "SELECT tamano, contenido FROM archivos_cv WHERE carpeta_id = $1",
      [carpetas[0].id],
    );
    expect(Number(archivos[0].tamano)).toBe(PDF_MINIMO.length);
    expect(archivos[0].contenido).toBeTruthy();

    const { rows: solicitudes } = await entorno.db.query(
      "SELECT * FROM solicitudes WHERE postulacion_id = (SELECT id FROM postulaciones WHERE folio = $1)",
      [respuesta.body.datos.folio],
    );
    expect(solicitudes[0].estado).toBe("Pendiente");
    expect(solicitudes[0].postulacion_id).toBe(respuesta.body.datos.id);
  });

  it("reutiliza el candidato si el correo ya existe y evita duplicados", async () => {
    const duplicada = await postular(entorno.api, datosBase, PDF_MINIMO);
    expect(duplicada.status).toBe(409);
    expect(duplicada.body.error).toMatch(/Ya registramos/);

    const otraOferta = await postular(entorno.api, {
      ...datosBase,
      ofertaId: 2,
      nombre: "Postulante Público Actualizado",
    });
    expect(otraOferta.status).toBe(201);

    const { rows } = await entorno.db.query(
      "SELECT COUNT(*)::int AS total FROM candidatos WHERE correo = $1",
      [datosBase.correo],
    );
    expect(rows[0].total).toBe(1);
  });

  it("exige currículum y valida tipo y contenido del archivo", async () => {
    const sinArchivo = await postular(
      entorno.api,
      { ...datosBase, correo: "sinarchivo@correo.cl" },
      null,
    );
    expect(sinArchivo.status).toBe(400);

    const tipoInvalido = await postular(
      entorno.api,
      { ...datosBase, correo: "tipo@correo.cl" },
      Buffer.from("texto plano"),
      "cv.txt",
    );
    expect(tipoInvalido.status).toBe(422);

    const firmaInvalida = await postular(
      entorno.api,
      { ...datosBase, correo: "firma@correo.cl" },
      Buffer.from("no es un pdf real"),
      "cv.pdf",
    );
    expect(firmaInvalida.status).toBe(422);

    const vacio = await postular(
      entorno.api,
      { ...datosBase, correo: "vacio@correo.cl" },
      Buffer.alloc(0),
      "cv.pdf",
    );
    expect(vacio.status).toBe(400);
  });

  it("valida los campos del formulario y la oferta", async () => {
    const invalido = await postular(entorno.api, {
      ...datosBase,
      correo: "mal-correo",
      consentimiento: false,
    });
    expect(invalido.status).toBe(400);
    expect(invalido.body.detalles.length).toBeGreaterThan(0);

    const ofertaInexistente = await postular(entorno.api, {
      ...datosBase,
      correo: "nooferta@correo.cl",
      ofertaId: 9999,
    });
    expect(ofertaInexistente.status).toBe(404);
  });

  it("rechaza postulaciones a ofertas vencidas", async () => {
    await entorno.db.query(
      "UPDATE ofertas SET fecha_cierre = '2020-01-01' WHERE id = 2",
    );
    const vencida = await postular(entorno.api, {
      ...datosBase,
      correo: "vencida@correo.cl",
      ofertaId: 2,
    });
    expect(vencida.status).toBe(409);
    await entorno.db.query(
      "UPDATE ofertas SET fecha_cierre = '2026-12-05' WHERE id = 2",
    );
  });

  it("consulta el estado por folio y correo", async () => {
    const creada = await postular(entorno.api, {
      ...datosBase,
      correo: "consulta@correo.cl",
      ofertaId: 3,
    });
    expect(creada.status).toBe(201);

    const consulta = await entorno.api.get(
      `/api/publico/postulaciones/${creada.body.datos.folio}?correo=consulta@correo.cl`,
    );
    expect(consulta.status).toBe(200);
    expect(consulta.body.datos.estadoSolicitud).toBe("Pendiente");

    const correoIncorrecto = await entorno.api.get(
      `/api/publico/postulaciones/${creada.body.datos.folio}?correo=otro@correo.cl`,
    );
    expect(correoIncorrecto.status).toBe(404);

    const sinCorreo = await entorno.api.get(
      `/api/publico/postulaciones/${creada.body.datos.folio}`,
    );
    expect(sinCorreo.status).toBe(400);

    const folioInexistente = await entorno.api.get(
      "/api/publico/postulaciones/AQ-2026-FFFFFF?correo=consulta@correo.cl",
    );
    expect(folioInexistente.status).toBe(404);
  });

  it("rechaza archivos que superan el límite de 5 MB", async () => {
    const grande = Buffer.concat([
      Buffer.from("%PDF-1.4\n"),
      Buffer.alloc(5 * 1024 * 1024 + 10, 0x20),
    ]);
    const respuesta = await postular(
      entorno.api,
      { ...datosBase, correo: "grande@correo.cl" },
      grande,
    );
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toMatch(/tamaño máximo/i);
  });

  it("acepta un PDF real con texto", async () => {
    const pdf = fs.readFileSync(PDF_REAL);
    const respuesta = await postular(
      entorno.api,
      {
        ...datosBase,
        ofertaId: 1,
        nombre: "Curriculum Real",
        correo: "cv.real@correo.cl",
      },
      pdf,
      "curriculum-real.pdf",
    );
    expect(respuesta.status).toBe(201);
  });
});
