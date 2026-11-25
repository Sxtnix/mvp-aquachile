import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import App from "../App.jsx";
import OfertasPage from "./OfertasPage.jsx";
import { renderConContexto } from "../test/helpers.jsx";

describe("OfertasPage", () => {
  it("lista las ofertas y permite publicar una nueva al analista", () => {
    renderConContexto(<OfertasPage />, { ruta: "/ofertas" });
    expect(
      screen.getByRole("heading", { name: /ofertas laborales/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /publicar oferta/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Técnico de Mantenimiento")).toBeInTheDocument();
    expect(screen.getByText("Jefe de Turno")).toBeInTheDocument();
  });

  it("cierra una oferta publicada", () => {
    renderConContexto(<OfertasPage />, { ruta: "/ofertas" });
    fireEvent.click(screen.getAllByRole("button", { name: /cerrar/i })[0]);
    expect(screen.getAllByText("Cerrada").length).toBeGreaterThan(0);
  });

  it("la jefatura solo puede consultar las ofertas", () => {
    renderConContexto(<App />, { ruta: "/ofertas" });
    fireEvent.click(screen.getByRole("button", { name: "Jefatura" }));

    expect(
      screen.queryByRole("link", { name: /publicar oferta/i })
    ).not.toBeInTheDocument();
    expect(screen.getAllByText(/solo consulta/i).length).toBeGreaterThan(0);
  });
});

describe("OfertasPage — filtros y estados", () => {
  it("filtra por texto, familia y estado, y limpia los filtros", () => {
    renderConContexto(<OfertasPage />, { ruta: "/ofertas" });

    fireEvent.change(screen.getByLabelText(/buscar oferta/i), {
      target: { value: "analista" },
    });
    expect(screen.getByText("Analista de Calidad")).toBeInTheDocument();
    expect(
      screen.queryByText("Técnico de Mantenimiento"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /limpiar filtros/i }));
    expect(screen.getByText("Técnico de Mantenimiento")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/familia de cargo/i), {
      target: { value: "Jefatura" },
    });
    expect(screen.getByText("Jefe de Turno")).toBeInTheDocument();
    expect(screen.queryByText("Analista de Calidad")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/estado de la oferta/i), {
      target: { value: "Borrador" },
    });
    expect(
      screen.getByText(/no hay ofertas que coincidan/i),
    ).toBeInTheDocument();
  });

  it("muestra solo las ofertas cerradas al filtrar ese estado", () => {
    renderConContexto(<OfertasPage />, { ruta: "/ofertas" });
    fireEvent.change(screen.getByLabelText(/estado de la oferta/i), {
      target: { value: "Cerrada" },
    });
    expect(screen.getByText("Jefe de Turno")).toBeInTheDocument();
    expect(
      screen.queryByText("Analista de Calidad"),
    ).not.toBeInTheDocument();
  });

  it("publica una oferta cerrada", () => {
    renderConContexto(<OfertasPage />, { ruta: "/ofertas" });
    fireEvent.click(screen.getAllByRole("button", { name: /^publicar$/i })[0]);
    expect(screen.getAllByText("Publicada").length).toBeGreaterThan(0);
  });
});
