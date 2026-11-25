import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import EtiquetaEstado from "./EtiquetaEstado.jsx";
import { renderConContexto } from "../test/helpers.jsx";

describe("EtiquetaEstado", () => {
  it("muestra el estado con su estilo", () => {
    renderConContexto(<EtiquetaEstado estado="Pendiente" />);
    expect(screen.getByText("Pendiente")).toHaveClass("badge-vc estado-pendiente");
  });

  it("applica estilo de advertencia para En proceso", () => {
    renderConContexto(<EtiquetaEstado estado="En proceso" />);
    expect(screen.getByText("En proceso")).toHaveClass("badge-vc estado-en-proceso");
  });

  it("applica estilo de éxito para Finalizada", () => {
    renderConContexto(<EtiquetaEstado estado="Finalizada" />);
    expect(screen.getByText("Finalizada")).toHaveClass("badge-vc estado-finalizada");
  });
});
