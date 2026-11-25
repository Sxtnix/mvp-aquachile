import { beforeEach, describe, expect, it, vi } from "vitest";

function json(datos, { ok = true, status = 200, tipo = "application/json" } = {}) {
  return {
    ok,
    status,
    headers: { get: () => tipo },
    json: async () => datos,
    text: async () => (typeof datos === "string" ? datos : JSON.stringify(datos)),
    blob: async () => new Blob([JSON.stringify(datos)]),
  };
}

async function cargarCliente() {
  vi.resetModules();
  return import("./cliente.js");
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("cliente API", () => {
  it("inicia sesión, guarda el token y cierra sesión", async () => {
    const cliente = await cargarCliente();
    const fetchFalso = vi.fn().mockResolvedValue(
      json({ accessToken: "token-1", usuario: { nombre: "Camila", rol: "ANALISTA" } }),
    );
    vi.stubGlobal("fetch", fetchFalso);

    const usuario = await cliente.iniciarSesion("analista@aquachile.cl", "clave");
    expect(usuario.nombre).toBe("Camila");
    expect(cliente.hayToken()).toBe(true);

    const [url, opciones] = fetchFalso.mock.calls[0];
    expect(url).toContain("/auth/login");
    expect(opciones.method).toBe("POST");
    expect(opciones.body).toContain("analista@aquachile.cl");

    fetchFalso.mockResolvedValue(json({ mensaje: "ok" }));
    await cliente.cerrarSesion();
    expect(cliente.hayToken()).toBe(false);
  });

  it("propaga el error de credenciales del backend", async () => {
    const cliente = await cargarCliente();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        json({ error: "Credenciales incorrectas." }, { ok: false, status: 401 }),
      ),
    );
    await expect(cliente.iniciarSesion("x@x.cl", "mala")).rejects.toThrow(
      "Credenciales incorrectas.",
    );
    expect(cliente.hayToken()).toBe(false);
  });

  it("envía el token y renueva la sesión automáticamente ante un 401", async () => {
    const cliente = await cargarCliente();
    const fetchFalso = vi
      .fn()
      .mockResolvedValueOnce(json({ accessToken: "token-1", usuario: { nombre: "A" } }))
      .mockResolvedValueOnce(json({ error: "expirado" }, { ok: false, status: 401 }))
      .mockResolvedValueOnce(json({ accessToken: "token-2", usuario: { nombre: "A" } }))
      .mockResolvedValueOnce(json({ datos: [{ id: 1 }] }));
    vi.stubGlobal("fetch", fetchFalso);

    await cliente.iniciarSesion("a@a.cl", "clave");
    const resultado = await cliente.peticion("/candidatos");

    expect(resultado.datos).toEqual([{ id: 1 }]);
    expect(fetchFalso).toHaveBeenCalledTimes(4);
    const [urlRefresh, opcionesRefresh] = fetchFalso.mock.calls[2];
    expect(urlRefresh).toContain("/auth/refresh");
    expect(opcionesRefresh.method).toBe("POST");
    const [, opcionesReintento] = fetchFalso.mock.calls[3];
    expect(opcionesReintento.headers.Authorization).toBe("Bearer token-2");
  });

  it("falla cuando el refresh no es válido", async () => {
    const cliente = await cargarCliente();
    const fetchFalso = vi
      .fn()
      .mockResolvedValueOnce(json({ error: "expirado" }, { ok: false, status: 401 }))
      .mockResolvedValueOnce(json({ error: "sin sesión" }, { ok: false, status: 401 }));
    vi.stubGlobal("fetch", fetchFalso);

    const error = await cliente.peticion("/candidatos").catch((fallo) => fallo);
    expect(error.status).toBe(401);
    expect(error.message).toMatch(/expirado/i);
    expect(fetchFalso).toHaveBeenCalledTimes(2);
  });

  it("refrescarSesion devuelve null ante error de red o respuesta inválida", async () => {
    const cliente = await cargarCliente();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await cliente.refrescarSesion()).toBeNull();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(json({ error: "no" }, { ok: false, status: 401 })),
    );
    expect(await cliente.refrescarSesion()).toBeNull();
  });

  it("traduce los errores HTTP a mensajes claros", async () => {
    const cliente = await cargarCliente();
    const casos = [
      [403, "No tienes permisos"],
      [404, "no existe"],
      [500, "error en el servidor"],
      [418, "No fue posible"],
    ];
    for (const [status, mensaje] of casos) {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(json({}, { ok: false, status })),
      );
      const error = await cliente.peticion("/x", { auth: false }).catch((e) => e);
      expect(error.message).toMatch(new RegExp(mensaje, "i"));
      expect(error.status).toBe(status);
    }
  });

  it("acepta respuestas de texto plano y adjunta detalles de validación", async () => {
    const cliente = await cargarCliente();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(json("texto plano", { tipo: "text/plain" })),
    );
    const respuesta = await cliente.peticion("/ping", { auth: false });
    expect(respuesta.datos).toBe("texto plano");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        json(
          { error: "Datos inválidos.", detalles: [{ campo: "nombre" }] },
          { ok: false, status: 400 },
        ),
      ),
    );
    const error = await cliente
      .peticion("/candidatos", { method: "POST", body: {}, auth: false })
      .catch((e) => e);
    expect(error.message).toBe("Datos inválidos.");
    expect(error.detalles).toHaveLength(1);
  });

  it("carga todos los datos, incluidas evaluaciones y bitácora", async () => {
    const cliente = await cargarCliente();
    const rutas = {
      "/candidatos": [{ id: 1, nombre: "Ana" }],
      "/ofertas": [{ id: 1, cargo: "Analista" }],
      "/solicitudes": [{ id: 7 }],
      "/solicitudes/7": {
        id: 7,
        evaluacion: { id: 1, resultado: "Apto" },
        bitacora: [{ id: 1, estadoNuevo: "Pendiente" }],
        analisis: { puntaje: 80 },
        postulacion: { id: 3 },
      },
      "/postulaciones": [{ id: 3, folio: "AQ-1" }],
      "/ia/estado": { configurada: true },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => {
        const ruta = Object.keys(rutas).find((clave) =>
          new URL(url).pathname.endsWith(clave),
        );
        return json({ datos: rutas[ruta] ?? null });
      }),
    );

    const datos = await cliente.cargarTodo();
    expect(datos.candidatos).toHaveLength(1);
    expect(datos.solicitudes[0].evaluacion.resultado).toBe("Apto");
    expect(datos.evaluaciones[0].solicitudId).toBe(7);
    expect(datos.bitacora[0].solicitudId).toBe(7);
    expect(datos.postulaciones).toHaveLength(1);
    expect(datos.iaEstado.configurada).toBe(true);
  });

  it("tolera fallos en detalle, postulaciones y estado de IA", async () => {
    const cliente = await cargarCliente();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => {
        if (url.endsWith("/candidatos")) return json({ datos: [] });
        if (url.endsWith("/ofertas")) return json({ datos: [] });
        if (url.endsWith("/solicitudes")) return json({ datos: [{ id: 1, cargo: "X" }] });
        return json({ error: "no" }, { ok: false, status: 403 });
      }),
    );

    const datos = await cliente.cargarTodo();
    expect(datos.solicitudes[0].cargo).toBe("X");
    expect(datos.postulaciones).toEqual([]);
    expect(datos.iaEstado).toBeNull();
  });

  it("consulta ofertas públicas y su detalle", async () => {
    const cliente = await cargarCliente();
    const fetchFalso = vi
      .fn()
      .mockResolvedValueOnce(json({ datos: [{ id: 1, cargo: "Analista" }] }))
      .mockResolvedValueOnce(json({ datos: { id: 1, cargo: "Analista" } }));
    vi.stubGlobal("fetch", fetchFalso);

    const ofertas = await cliente.cargarOfertasPublicas();
    expect(ofertas[0].estado).toBe("Publicada");
    const detalle = await cliente.obtenerOfertaPublica(1);
    expect(detalle.cargo).toBe("Analista");
    expect(fetchFalso.mock.calls[0][0]).toContain("/publico/ofertas");
  });

  it("envía una postulación multipart con el archivo real", async () => {
    const cliente = await cargarCliente();
    const fetchFalso = vi.fn().mockResolvedValue(json({ datos: { folio: "AQ-1" } }));
    vi.stubGlobal("fetch", fetchFalso);

    const archivo = new File(["contenido"], "cv.pdf", { type: "application/pdf" });
    const resultado = await cliente.postularPublico({
      ofertaId: 1,
      nombre: "Ana",
      correo: "ana@correo.cl",
      telefono: "+56 9 1111 2222",
      consentimiento: true,
      archivo,
    });

    expect(resultado.folio).toBe("AQ-1");
    const [url, opciones] = fetchFalso.mock.calls[0];
    expect(url).toContain("/publico/postulaciones");
    expect(opciones.body).toBeInstanceOf(FormData);
    expect(opciones.body.get("curriculum")).toBe(archivo);
    expect(opciones.body.get("ofertaId")).toBe("1");
    expect(opciones.headers?.["Content-Type"]).toBeUndefined();
  });

  it("descarga el CV como blob y gestiona IA", async () => {
    const cliente = await cargarCliente();
    const fetchFalso = vi
      .fn()
      .mockResolvedValueOnce(json({ archivo: true }, { tipo: "application/pdf" }))
      .mockResolvedValueOnce(json({ datos: { puntaje: 90 } }))
      .mockResolvedValueOnce(json({ datos: { pendienteRevision: false } }));
    vi.stubGlobal("fetch", fetchFalso);

    const blob = await cliente.descargarCv(3);
    expect(blob).toBeInstanceOf(Blob);
    const analisis = await cliente.analizarIa(7);
    expect(analisis.puntaje).toBe(90);
    const revision = await cliente.revisarIa(7);
    expect(revision.pendienteRevision).toBe(false);
    expect(fetchFalso.mock.calls[1][1].method).toBe("POST");
    expect(fetchFalso.mock.calls[2][1].method).toBe("PATCH");
  });

  it("expone el servicio agregado con el modo api", async () => {
    const { servicioApi } = await cargarCliente();
    expect(servicioApi.modo).toBe("api");
    expect(typeof servicioApi.cargarTodo).toBe("function");
    expect(typeof servicioApi.peticion).toBe("function");
  });
});
