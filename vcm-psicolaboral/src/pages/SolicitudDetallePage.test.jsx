import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import SolicitudDetallePage from "./SolicitudDetallePage.jsx";
import { crearServicioFalso, DATOS_DEMO } from "../test/servicioFalso.js";
import { renderConApi } from "../test/helpers.jsx";

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

function pintar(servicio = crearServicioFalso(), ruta = "/solicitudes/1") {
  return renderConApi(<SolicitudDetallePage />, {
    ruta,
    rutaPattern: "/solicitudes/:id",
    servicio,
  });
}

describe("SolicitudDetallePage con backend", () => {
  it("muestra la solicitud, el CV privado y el análisis de IA", async () => {
    pintar();

    expect(
      await screen.findByRole("heading", { name: "Valentina Rojas" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/cv-valentina\.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/folio aq-2026-abc123/i)).toBeInTheDocument();
    expect(
      screen.getByText("CV-2026-000005-VALENTINA-ROJAS"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /descargar cv/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/apoyo de ia sobre el currículum/i),
    ).toBeInTheDocument();
    expect(screen.getByText("88")).toBeInTheDocument();
  });

  it("descarga el CV autorizado y muestra errores de descarga", async () => {
    const { servicio } = pintar();
    await screen.findByRole("heading", { name: "Valentina Rojas" });

    fireEvent.click(screen.getByRole("button", { name: /descargar cv/i }));
    await waitFor(() => expect(servicio.descargarCv).toHaveBeenCalledWith(5));
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });

  it("informa si la descarga del CV falla", async () => {
    const servicio = crearServicioFalso({
      descargarCv: vi.fn().mockRejectedValue(new Error("archivo no disponible")),
    });
    pintar(servicio);
    await screen.findByRole("heading", { name: "Valentina Rojas" });

    fireEvent.click(screen.getByRole("button", { name: /descargar cv/i }));
    expect(
      await screen.findByText(/archivo no disponible/i),
    ).toBeInTheDocument();
  });

  it("muestra un aviso cuando la solicitud no existe", async () => {
    pintar(crearServicioFalso(), "/solicitudes/99");
    expect(
      await screen.findByText(/la solicitud solicitada no existe/i),
    ).toBeInTheDocument();
  });
});

describe("SolicitudDetallePage — permisos y estados", () => {
  it("avisa al evaluador cuando la solicitud no está asignada", async () => {
    const servicio = crearServicioFalso({
      refrescarSesion: async () => ({
        id: 2,
        nombre: "Otra Persona",
        email: "evaluador@aquachile.cl",
        rol: "EVALUADOR",
      }),
    });
    pintar(servicio);

    expect(
      await screen.findByText(/esta solicitud está asignada a/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no tienes permisos sobre esta evaluación/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /guardar y finalizar/i }),
    ).not.toBeInTheDocument();
  });

  it("permite al evaluador asignado cambiar el estado", async () => {
    const servicio = crearServicioFalso({
      refrescarSesion: async () => ({
        id: 2,
        nombre: "Camila Reyes",
        email: "evaluador@aquachile.cl",
        rol: "EVALUADOR",
      }),
    });
    pintar(servicio);
    await screen.findByRole("heading", { name: "Valentina Rojas" });

    fireEvent.click(screen.getByRole("button", { name: "Finalizada" }));
    await waitFor(() =>
      expect(servicio.peticion).toHaveBeenCalledWith(
        "/solicitudes/1/estado",
        expect.objectContaining({ method: "PATCH" }),
      ),
    );
  });

  it("muestra una solicitud sin evaluación, oferta ni currículum", async () => {
    const servicio = crearServicioFalso({
      cargarTodo: async () => ({
        candidatos: [DATOS_SIN_EXTRAS.candidatos[0]],
        ofertas: [],
        solicitudes: [
          {
            id: 1,
            candidatoId: 1,
            cargo: "Analista de Calidad",
            familia: "Profesional A",
            fechaSolicitud: "2026-09-14",
            estado: "Pendiente",
            responsable: "Camila Reyes",
            prioridad: "Media",
            evaluacion: null,
            bitacora: [],
            analisis: null,
            postulacion: null,
          },
        ],
        evaluaciones: [],
        bitacora: [],
        postulaciones: [],
        iaEstado: null,
      }),
    });
    pintar(servicio);

    await screen.findByRole("heading", { name: "Valentina Rojas" });
    expect(screen.getByText("Sin registrar")).toBeInTheDocument();
    expect(screen.queryByText(/descargar cv/i)).not.toBeInTheDocument();
    expect(screen.getByText(/sin agendar/i)).toBeInTheDocument();
    expect(screen.getAllByText(/pendiente/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/ver oferta/i)).not.toBeInTheDocument();
  });
});

const DATOS_SIN_EXTRAS = {
  candidatos: [
    {
      id: 1,
      nombre: "Valentina Rojas",
      correo: "valentina.rojas@correo.cl",
      telefono: "+56 9 8123 4455",
    },
  ],
};
