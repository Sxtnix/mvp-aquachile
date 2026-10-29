import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
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
