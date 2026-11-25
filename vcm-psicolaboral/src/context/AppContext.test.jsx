import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProvider, useApp } from "./AppContext.jsx";
import {
  crearServicioFalso,
  DATOS_DEMO,
} from "../test/servicioFalso.js";

let clickOriginal;

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:cv");
  URL.revokeObjectURL = vi.fn();
  clickOriginal = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = vi.fn();
});

afterEach(() => {
  HTMLAnchorElement.prototype.click = clickOriginal;
});

function Sonda() {
  const app = useApp();
  const [mensaje, setMensaje] = useState("");
  const ejecutar = (fn) => () => {
    Promise.resolve(fn())
      .then((valor) =>
        setMensaje(
          valor === undefined
            ? "ok"
            : typeof valor === "object"
              ? JSON.stringify(valor)
              : String(valor),
        ),
      )
      .catch((error) => setMensaje(error.message));
  };

  return (
    <div>
      <span data-testid="usuario">{app.usuario?.nombre || "sin usuario"}</span>
      <span data-testid="perfil">{app.perfil.nombre}</span>
      <span data-testid="rol">{app.perfil.rol}</span>
      <span data-testid="usa-api">{String(app.usaApi)}</span>
      <span data-testid="autenticado">{String(app.autenticado)}</span>
      <span data-testid="cargando">{String(app.cargandoSesion)}</span>
      <span data-testid="solicitudes">{app.solicitudes.length}</span>
      <span data-testid="solicitudes-visibles">
        {app.solicitudesVisibles.length}
      </span>
      <span data-testid="ofertas">{app.ofertas.length}</span>
      <span data-testid="postulaciones">{app.postulaciones.length}</span>
      <span data-testid="ia">{String(app.iaEstado?.configurada)}</span>
      <span data-testid="oferta">{app.obtenerOferta(1)?.cargo || "-"}</span>
      <span data-testid="solicitud">{app.obtenerSolicitud(1)?.cargo || "-"}</span>
      <span data-testid="candidato">
        {app.obtenerCandidato(1)?.nombre || "-"}
      </span>
      <span data-testid="de-oferta">{app.postulacionesDeOferta(1).length}</span>
      <span data-testid="evaluacion">
        {app.evaluacionDe(1)?.resultado || "-"}
      </span>
      <span data-testid="bitacora">{app.bitacoraDe(1).length}</span>
      <span data-testid="error">{app.errorSync}</span>
      <span data-testid="notificacion">{app.notificacion}</span>
      <span data-testid="mensaje">{mensaje}</span>

      <button
        type="button"
        onClick={ejecutar(() =>
          app.dispatch({
            type: "agregar-candidato",
            datos: {
              nombre: "Nuevo Candidato",
              correo: "nuevo@correo.cl",
              telefono: "+56 9 1111 1111",
              cargo: "Analista",
              familia: "Profesional A",
              origen: "Externo",
              ubicacion: "Oficina Central",
              unidad: "Calidad",
              requiereReferencia: true,
              fechaPostulacion: "2026-11-01",
            },
          }),
        )}
      >
        agregar candidato
      </button>
      <button
        type="button"
        onClick={ejecutar(() =>
          app.dispatch({
            type: "actualizar-candidato",
            id: 1,
            datos: {
              nombre: "Valentina Rojas",
              correo: "valentina.rojas@correo.cl",
              telefono: "+56 9 8123 4455",
              cargo: "Analista de Calidad",
              familia: "Profesional A",
              origen: "Externo",
              ubicacion: "Oficina Central",
              departamento: "Calidad",
              fechaPostulacion: "2026-09-10",
            },
          }),
        )}
      >
        actualizar candidato
      </button>
      <button
        type="button"
        onClick={ejecutar(() =>
          app.dispatch({ type: "eliminar-candidato", id: 1 }),
        )}
      >
        eliminar candidato
      </button>
      <button
        type="button"
        onClick={ejecutar(() =>
          app.dispatch({
            type: "crear-solicitud",
            datos: {
              candidatoId: "1",
              responsable: "Camila Reyes",
              prioridad: "Alta",
              observaciones: "Nueva",
              fechaEntrevista: "",
              fechaSolicitud: "2026-11-01",
            },
          }),
        )}
      >
        crear solicitud
      </button>
      <button
        type="button"
        onClick={ejecutar(() =>
          app.dispatch({
            type: "actualizar-solicitud",
            id: 1,
            datos: {
              candidatoId: 1,
              responsable: "Camila Reyes",
              prioridad: "Media",
              observaciones: "Actualizada",
              fechaEntrevista: "",
              fechaSolicitud: "2026-11-02",
            },
          }),
        )}
      >
        actualizar solicitud
      </button>
      <button
        type="button"
        onClick={ejecutar(() =>
          app.dispatch({
            type: "actualizar-solicitud",
            id: 1,
            datos: { fechaInforme: "2026-11-03" },
          }),
        )}
      >
        actualizar informe
      </button>
      <button
        type="button"
        onClick={ejecutar(() =>
          app.dispatch({ type: "cambiar-estado", id: 1, estado: "Finalizada" }),
        )}
      >
        cambiar estado
      </button>
      <button
        type="button"
        onClick={ejecutar(() =>
          app.dispatch({
            type: "guardar-evaluacion",
            solicitudId: 1,
            datos: {
              fechaEvaluacion: "2026-11-02",
              resultado: "Apto",
              categoria: "Recomendado",
              observaciones: "Evaluación completa del postulante.",
            },
            finalizar: true,
          }),
        )}
      >
        guardar evaluacion
      </button>
      <button
        type="button"
        onClick={ejecutar(() =>
          app.dispatch({
            type: "crear-oferta",
            datos: {
              cargo: "Nueva oferta",
              familia: "Técnico A",
              ubicacion: "Planta Magallanes",
              vacantes: "2",
              fechaPublicacion: "2026-11-01",
              fechaCierre: "2026-12-01",
              estado: "Borrador",
              responsable: "Camila Reyes",
              descripcion: "Descripción suficiente de la nueva oferta.",
              requisitos: "Requisitos suficientes para la oferta.",
            },
          }),
        )}
      >
        crear oferta
      </button>
      <button
        type="button"
        onClick={ejecutar(() =>
          app.dispatch({ type: "actualizar-oferta", id: 1, datos: DATOS_DEMO.ofertas[0] }),
        )}
      >
        actualizar oferta
      </button>
      <button
        type="button"
        onClick={ejecutar(() =>
          app.dispatch({
            type: "cambiar-estado-oferta",
            id: 1,
            estado: "Cerrada",
          }),
        )}
      >
        estado oferta
      </button>
      <button
        type="button"
        onClick={ejecutar(() =>
          app.dispatch({ type: "eliminar-oferta", id: 1 }),
        )}
      >
        eliminar oferta
      </button>
      <button
        type="button"
        onClick={ejecutar(() =>
          app.dispatch({ type: "accion-desconocida" }),
        )}
      >
        accion desconocida
      </button>

      <button
        type="button"
        onClick={ejecutar(() =>
          app.postularPublico({
            oferta: { id: 1, cargo: "Analista de Calidad" },
            datos: {
              nombre: "Nueva Persona",
              correo: "nueva@correo.cl",
              telefono: "+56 9 2222 2222",
              consentimiento: true,
              curriculum: { nombre: "cv.pdf", tamano: 10 },
            },
            archivo: new File(["pdf"], "cv.pdf", { type: "application/pdf" }),
          }),
        )}
      >
        postular
      </button>
      <button type="button" onClick={ejecutar(() => app.analizarIa(1))}>
        analizar ia
      </button>
      <button type="button" onClick={ejecutar(() => app.revisarIa(1))}>
        revisar ia
      </button>
      <button type="button" onClick={ejecutar(() => app.descargarCv(5, "cv.pdf"))}>
        descargar cv
      </button>
      <button type="button" onClick={ejecutar(() => app.recargar())}>
        recargar
      </button>
      <button type="button" onClick={ejecutar(() => app.login("a@a.cl", "clave"))}>
        login
      </button>
      <button type="button" onClick={ejecutar(() => app.logout())}>
        logout
      </button>
      <button type="button" onClick={() => app.limpiarError()}>
        limpiar error
      </button>
      <button type="button" onClick={() => app.limpiarNotificacion()}>
        limpiar notificacion
      </button>
    </div>
  );
}

function pintar(servicio, datos = {}) {
  return render(
    <MemoryRouter>
      <AppProvider servicio={servicio}>
        <Sonda {...datos} />
      </AppProvider>
    </MemoryRouter>,
  );
}

function pintarLocal() {
  return render(
    <MemoryRouter>
      <AppProvider>
        <Sonda />
      </AppProvider>
    </MemoryRouter>,
  );
}

describe("AppContext en modo API", () => {
  it("hidrata la sesión y expone los selectores de datos", async () => {
    pintar(crearServicioFalso());

    await waitFor(() =>
      expect(screen.getByTestId("usuario")).toHaveTextContent("Camila Reyes"),
    );
    expect(screen.getByTestId("perfil")).toHaveTextContent("Camila Reyes");
    expect(screen.getByTestId("rol")).toHaveTextContent(
      "Analista de Reclutamiento",
    );
    expect(screen.getByTestId("usa-api")).toHaveTextContent("true");
    expect(screen.getByTestId("autenticado")).toHaveTextContent("true");
    expect(screen.getByTestId("cargando")).toHaveTextContent("false");
    expect(screen.getByTestId("solicitudes")).toHaveTextContent("1");
    expect(screen.getByTestId("solicitudes-visibles")).toHaveTextContent("1");
    expect(screen.getByTestId("ofertas")).toHaveTextContent("1");
    expect(screen.getByTestId("postulaciones")).toHaveTextContent("1");
    expect(screen.getByTestId("ia")).toHaveTextContent("true");
    expect(screen.getByTestId("oferta")).toHaveTextContent("Analista de Calidad");
    expect(screen.getByTestId("solicitud")).toHaveTextContent(
      "Analista de Calidad",
    );
    expect(screen.getByTestId("candidato")).toHaveTextContent("Valentina Rojas");
    expect(screen.getByTestId("de-oferta")).toHaveTextContent("1");
    expect(screen.getByTestId("evaluacion")).toHaveTextContent("Apto");
    expect(screen.getByTestId("bitacora")).toHaveTextContent("1");
  });

  it("persiste cada mutación con el verbo y la ruta correctos", async () => {
    const servicio = crearServicioFalso();
    pintar(servicio);
    await waitFor(() =>
      expect(screen.getByTestId("usuario")).toHaveTextContent("Camila Reyes"),
    );

    const esperar = (ruta, method) =>
      waitFor(() =>
        expect(servicio.peticion).toHaveBeenCalledWith(
          ruta,
          expect.objectContaining({ method }),
        ),
      );

    fireEvent.click(screen.getByRole("button", { name: "agregar candidato" }));
    await esperar("/candidatos", "POST");
    const alta = servicio.peticion.mock.calls.at(-1)[1].body;
    expect(alta.departamento).toBe("Calidad");
    expect(alta.requiereReferencia).toBe(true);

    fireEvent.click(
      screen.getByRole("button", { name: "actualizar candidato" }),
    );
    await esperar("/candidatos/1", "PUT");

    fireEvent.click(screen.getByRole("button", { name: "eliminar candidato" }));
    await esperar("/candidatos/1", "DELETE");

    fireEvent.click(screen.getByRole("button", { name: "crear solicitud" }));
    await esperar("/solicitudes", "POST");
    const solicitud = servicio.peticion.mock.calls.at(-1)[1].body;
    expect(solicitud.candidatoId).toBe(1);

    fireEvent.click(
      screen.getByRole("button", { name: "actualizar solicitud" }),
    );
    await esperar("/solicitudes/1", "PUT");

    const llamadasAntes = servicio.peticion.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "actualizar informe" }));
    await waitFor(() =>
      expect(screen.getByTestId("mensaje")).toHaveTextContent("ok"),
    );
    expect(servicio.peticion.mock.calls.length).toBe(llamadasAntes);

    fireEvent.click(screen.getByRole("button", { name: "cambiar estado" }));
    await esperar("/solicitudes/1/estado", "PATCH");

    fireEvent.click(screen.getByRole("button", { name: "guardar evaluacion" }));
    await esperar("/solicitudes/1/evaluacion", "PUT");
    expect(servicio.peticion.mock.calls.at(-1)[1].body.finalizar).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "crear oferta" }));
    await esperar("/ofertas", "POST");
    const oferta = servicio.peticion.mock.calls.at(-1)[1].body;
    expect(oferta.modalidad).toBe("Presencial");
    expect(oferta.departamento).toBe("");
    expect(oferta.beneficios).toBe("Beneficios por definir.");
    expect(oferta.sueldo).toBe("A convenir");
    expect(oferta.funciones).toBe(
      "Descripción suficiente de la nueva oferta.",
    );

    fireEvent.click(screen.getByRole("button", { name: "actualizar oferta" }));
    await esperar("/ofertas/1", "PUT");

    fireEvent.click(screen.getByRole("button", { name: "estado oferta" }));
    await esperar("/ofertas/1/estado", "PATCH");

    fireEvent.click(screen.getByRole("button", { name: "eliminar oferta" }));
    await esperar("/ofertas/1", "DELETE");

    const total = servicio.peticion.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "accion desconocida" }));
    await waitFor(() =>
      expect(screen.getByTestId("mensaje")).toHaveTextContent("ok"),
    );
    expect(servicio.peticion.mock.calls.length).toBe(total);
  });

  it("registra un error y recarga si la persistencia falla", async () => {
    const servicio = crearServicioFalso();
    servicio.peticion.mockRejectedValueOnce(new Error("falló la red"));
    pintar(servicio);
    await waitFor(() =>
      expect(screen.getByTestId("usuario")).toHaveTextContent("Camila Reyes"),
    );

    fireEvent.click(screen.getByRole("button", { name: "eliminar candidato" }));
    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent("falló la red"),
    );
    fireEvent.click(screen.getByRole("button", { name: "limpiar error" }));
    expect(screen.getByTestId("error")).toHaveTextContent("");
  });

  it("publica postulaciones, analiza IA, revisa y descarga CV", async () => {
    const servicio = crearServicioFalso();
    pintar(servicio);
    await waitFor(() =>
      expect(screen.getByTestId("usuario")).toHaveTextContent("Camila Reyes"),
    );

    fireEvent.click(screen.getByRole("button", { name: "postular" }));
    await waitFor(() =>
      expect(servicio.postularPublico).toHaveBeenCalledWith(
        expect.objectContaining({
          ofertaId: 1,
          nombre: "Nueva Persona",
          consentimiento: true,
        }),
      ),
    );
    expect(await screen.findByText(/aq-2026-abc123/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "analizar ia" }));
    await waitFor(() => expect(servicio.analizarIa).toHaveBeenCalledWith(1));
    expect(screen.getByTestId("notificacion")).toHaveTextContent(
      /análisis generado/i,
    );

    fireEvent.click(screen.getByRole("button", { name: "revisar ia" }));
    await waitFor(() => expect(servicio.revisarIa).toHaveBeenCalledWith(1));
    expect(screen.getByTestId("notificacion")).toHaveTextContent(
      /revisado por una persona/i,
    );

    fireEvent.click(screen.getByRole("button", { name: "limpiar notificacion" }));
    expect(screen.getByTestId("notificacion")).toHaveTextContent("");

    fireEvent.click(screen.getByRole("button", { name: "descargar cv" }));
    await waitFor(() => expect(servicio.descargarCv).toHaveBeenCalledWith(5));
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });

  it("permite recargar, iniciar y cerrar sesión", async () => {
    const servicio = crearServicioFalso();
    pintar(servicio);
    await waitFor(() =>
      expect(screen.getByTestId("usuario")).toHaveTextContent("Camila Reyes"),
    );

    const antes = servicio.cargarTodo.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "recargar" }));
    await waitFor(() =>
      expect(servicio.cargarTodo.mock.calls.length).toBe(antes + 1),
    );

    fireEvent.click(screen.getByRole("button", { name: "logout" }));
    await waitFor(() =>
      expect(screen.getByTestId("usuario")).toHaveTextContent("sin usuario"),
    );
    expect(servicio.cerrarSesion).toHaveBeenCalled();
    expect(servicio.cargarOfertasPublicas).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "login" }));
    await waitFor(() =>
      expect(screen.getByTestId("usuario")).toHaveTextContent("Camila Reyes"),
    );
    expect(servicio.iniciarSesion).toHaveBeenCalledWith("a@a.cl", "clave");
  });
});

describe("AppContext en modo local", () => {
  it("mantiene los datos demo y rechaza las funciones que requieren API", async () => {
    pintarLocal();
    expect(screen.getByTestId("usa-api")).toHaveTextContent("false");
    expect(screen.getByTestId("autenticado")).toHaveTextContent("true");
    expect(screen.getByTestId("solicitudes")).toHaveTextContent("8");

    fireEvent.click(screen.getByRole("button", { name: "analizar ia" }));
    await waitFor(() =>
      expect(screen.getByTestId("mensaje")).toHaveTextContent(/modo api/i),
    );

    fireEvent.click(screen.getByRole("button", { name: "revisar ia" }));
    await waitFor(() =>
      expect(screen.getByTestId("mensaje")).toHaveTextContent(
        /requiere el backend/i,
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "descargar cv" }));
    await waitFor(() =>
      expect(screen.getByTestId("mensaje")).toHaveTextContent(
        /requiere el backend/i,
      ),
    );
  });
});

describe("AppContext — perfiles conectados", () => {
  it("filtra las solicitudes del evaluador y adapta la etiqueta del rol", async () => {
    const servicio = crearServicioFalso({
      refrescarSesion: async () => ({
        id: 2,
        nombre: "Valeria Ospina",
        email: "evaluador@aquachile.cl",
        rol: "EVALUADOR",
      }),
    });
    pintar(servicio);

    await waitFor(() =>
      expect(screen.getByTestId("usuario")).toHaveTextContent("Valeria Ospina"),
    );
    expect(screen.getByTestId("perfil")).toHaveTextContent("Valeria Ospina");
    expect(screen.getByTestId("rol")).toHaveTextContent("Profesional Evaluador");
    expect(screen.getByTestId("solicitudes")).toHaveTextContent("1");
    expect(screen.getByTestId("solicitudes-visibles")).toHaveTextContent("0");
    expect(screen.getByTestId("autenticado")).toHaveTextContent("true");
  });

  it("usa el perfil de jefatura si el rol no está reconocido", async () => {
    const servicio = crearServicioFalso({
      refrescarSesion: async () => ({
        id: 9,
        nombre: "Usuario Externo",
        email: "externo@aquachile.cl",
        rol: "SOPORTE",
      }),
    });
    pintar(servicio);

    await waitFor(() =>
      expect(screen.getByTestId("usuario")).toHaveTextContent("Usuario Externo"),
    );
    expect(screen.getByTestId("rol")).toHaveTextContent("Jefatura (solo consulta)");
  });
});

describe("AppContext — tolerancia a fallos", () => {
  it("cierra la sesión local aunque falle el logout remoto", async () => {
    const servicio = crearServicioFalso({
      cerrarSesion: vi.fn().mockRejectedValue(new Error("sin red")),
    });
    pintar(servicio);
    await waitFor(() =>
      expect(screen.getByTestId("usuario")).toHaveTextContent("Camila Reyes"),
    );

    fireEvent.click(screen.getByRole("button", { name: "logout" }));
    await waitFor(() =>
      expect(screen.getByTestId("usuario")).toHaveTextContent("sin usuario"),
    );
  });
});
