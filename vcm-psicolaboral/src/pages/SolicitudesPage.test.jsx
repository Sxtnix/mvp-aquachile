import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import SolicitudesPage from "./SolicitudesPage.jsx";
import { renderConContexto } from "../test/helpers.jsx";

describe("SolicitudesPage", () => {
  it("muestra el listado de solicitudes visibles para el analista", () => {
    renderConContexto(<SolicitudesPage />, { ruta: "/solicitudes" });
    expect(
      screen.getByRole("heading", { name: /solicitudes de evaluación/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Valentina Rojas")).toBeInTheDocument();
    expect(screen.getByText("Javiera Morales")).toBeInTheDocument();
  });

  it("muestra el aviso de datos simulados", () => {
    renderConContexto(<SolicitudesPage />, { ruta: "/solicitudes" });
    expect(screen.getByText(/datos son ficticios/i)).toBeInTheDocument();
  });
});
