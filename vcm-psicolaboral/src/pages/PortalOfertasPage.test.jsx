import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import App from "../App.jsx";
import PortalOfertasPage from "./PortalOfertasPage.jsx";
import { renderConContexto } from "../test/helpers.jsx";

describe("PortalOfertasPage", () => {
  it("muestra solo las ofertas publicadas y vigentes", () => {
    renderConContexto(<PortalOfertasPage />, { ruta: "/postular" });
    expect(
      screen.getByRole("heading", { name: /ofertas disponibles/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Técnico de Mantenimiento")).toBeInTheDocument();
    expect(screen.queryByText("Jefe de Turno")).not.toBeInTheDocument();
  });

  it("filtra las ofertas por texto", () => {
    renderConContexto(<PortalOfertasPage />, { ruta: "/postular" });
    fireEvent.change(screen.getByLabelText(/buscar oferta/i), {
      target: { value: "analista" },
    });
    expect(screen.getByText("Analista de Calidad")).toBeInTheDocument();
    expect(
      screen.queryByText("Técnico de Mantenimiento")
    ).not.toBeInTheDocument();
  });

  it("se muestra como portal público sin selector de perfil", () => {
    renderConContexto(<App />, { ruta: "/postular" });
    expect(
      screen.getByRole("heading", {
        name: /postula en línea, sin filas ni papeles/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Analista" })
    ).not.toBeInTheDocument();
  });
});

describe("PortalOfertasPage — filtros y estados", () => {
  it("filtra por familia y limpia los filtros", () => {
    renderConContexto(<PortalOfertasPage />, { ruta: "/postular" });
    fireEvent.change(screen.getByLabelText(/familia de cargo/i), {
      target: { value: "Profesional A" },
    });
    expect(screen.getByText("Analista de Calidad")).toBeInTheDocument();
    expect(
      screen.queryByText("Técnico de Mantenimiento"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /limpiar filtros/i }));
    expect(screen.getByText("Técnico de Mantenimiento")).toBeInTheDocument();
  });

  it("ofrece limpiar la búsqueda cuando no hay resultados", () => {
    renderConContexto(<PortalOfertasPage />, { ruta: "/postular" });
    fireEvent.change(screen.getByLabelText(/buscar oferta/i), {
      target: { value: "no-existe" },
    });
    expect(screen.getByText(/no hay ofertas que coincidan/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /ver todas las ofertas/i }));
    expect(screen.getByText("Técnico de Mantenimiento")).toBeInTheDocument();
  });

  it("destaca las ofertas con cierre próximo", () => {
    renderConContexto(<PortalOfertasPage />, { ruta: "/postular" });
    expect(screen.getAllByText(/cierre próximo/i).length).toBeGreaterThan(0);
  });
});
