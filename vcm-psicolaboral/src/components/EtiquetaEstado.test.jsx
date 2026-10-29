import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import EtiquetaEstado from "./EtiquetaEstado.jsx";
import { renderConContexto } from "../test/helpers.jsx";

describe("EtiquetaEstado", () => {
  it("muestra el estado con su estilo", () => {
    renderConContexto(<EtiquetaEstado estado="Pendiente" />);
    expect(screen.getByText("Pendiente")).toHaveClass("text-bg-secondary");
  });

  it("aplica estilo de advertencia para En proceso", () => {
    renderConContexto(<EtiquetaEstado estado="En proceso" />);
    expect(screen.getByText("En proceso")).toHaveClass("text-bg-warning");
  });

  it("aplica estilo de éxito para Finalizada", () => {
    renderConContexto(<EtiquetaEstado estado="Finalizada" />);
    expect(screen.getByText("Finalizada")).toHaveClass("text-bg-success");
  });
});
