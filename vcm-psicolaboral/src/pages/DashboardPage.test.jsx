import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import DashboardPage from "./DashboardPage.jsx";
import { renderConContexto } from "../test/helpers.jsx";

describe("DashboardPage", () => {
  it("muestra el título y el perfil activo", () => {
    renderConContexto(<DashboardPage />, { ruta: "/" });
    expect(screen.getByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/analista de reclutamiento/i)).toBeInTheDocument();
  });

  it("muestra los indicadores principales", () => {
    renderConContexto(<DashboardPage />);
    expect(screen.getByText("Tiempo medio")).toBeInTheDocument();
    expect(screen.getByText("Recomendados")).toBeInTheDocument();
  });

  it("muestra el aviso de datos simulados", () => {
    renderConContexto(<DashboardPage />);
    expect(screen.getByText(/datos son ficticios/i)).toBeInTheDocument();
  });

  it("resume las solicitudes por estado", () => {
    renderConContexto(<DashboardPage />);
    expect(screen.getByText(/solicitudes por estado/i)).toBeInTheDocument();
    expect(screen.getAllByText("Pendiente").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Finalizada").length).toBeGreaterThan(0);
  });
});

import App from "../App.jsx";
import { crearServicioFalso } from "../test/servicioFalso.js";
import { renderConApi } from "../test/helpers.jsx";

describe("DashboardPage — roles y estados vacíos", () => {
  it("adapta el foco y las métricas para evaluador y jefatura", () => {
    renderConContexto(<App />, { ruta: "/" });
    fireEvent.click(screen.getByRole("button", { name: "Evaluador" }));
    expect(
      screen.getByText(/evaluaciones asignadas/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/requieren seguimiento|requiere seguimiento/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Jefatura" }));
    expect(
      screen.getByText(/estado general del proceso/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/% de las solicitudes visibles/i)).toBeInTheDocument();
  });

  it("muestra guiones y estados vacíos cuando no hay datos", async () => {
    const servicio = crearServicioFalso({
      cargarTodo: async () => ({
        candidatos: [],
        ofertas: [],
        solicitudes: [],
        evaluaciones: [],
        bitacora: [],
        postulaciones: [],
        iaEstado: null,
      }),
    });
    renderConApi(<DashboardPage />, { servicio });

    expect(await screen.findByText(/0 candidatos no tienen/i)).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("muestra el avance en cero para jefatura sin datos", async () => {
    const servicio = crearServicioFalso({
      refrescarSesion: async () => ({
        id: 3,
        nombre: "Alejandro Vidal",
        email: "jefatura@aquachile.cl",
        rol: "JEFATURA",
      }),
      cargarTodo: async () => ({
        candidatos: [],
        ofertas: [],
        solicitudes: [],
        evaluaciones: [],
        bitacora: [],
        postulaciones: [],
        iaEstado: null,
      }),
    });
    renderConApi(<DashboardPage />, { servicio });
    expect(
      await screen.findByText(/0% de las solicitudes visibles/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /revisar procesos/i }),
    ).toBeInTheDocument();
  });

  it("adapta el mensaje del evaluador cuando no hay pendientes", async () => {
    const servicio = crearServicioFalso({
      refrescarSesion: async () => ({
        id: 2,
        nombre: "Valeria Ospina",
        email: "evaluador@aquachile.cl",
        rol: "EVALUADOR",
      }),
      cargarTodo: async () => ({
        candidatos: [],
        ofertas: [],
        solicitudes: [],
        evaluaciones: [],
        bitacora: [],
        postulaciones: [],
        iaEstado: null,
      }),
    });
    renderConApi(<DashboardPage />, { servicio });

    expect(
      await screen.findByText(/0 solicitudes requieren seguimiento/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /registrar candidato/i }),
    ).not.toBeInTheDocument();
  });
});
