import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import App from "./App.jsx";
import { renderConContexto } from "./test/helpers.jsx";

describe("flujo completo de evaluación", () => {
  it("permite al evaluador guardar y finalizar una solicitud asignada", () => {
    renderConContexto(<App />, { ruta: "/solicitudes/2" });

    fireEvent.click(screen.getByRole("button", { name: "Evaluador" }));

    expect(screen.getByLabelText(/resultado/i)).toBeEnabled();

    fireEvent.change(screen.getByLabelText(/observaciones/i), {
      target: { value: "Evaluación completa y detallada del postulante." },
    });
    fireEvent.click(screen.getByRole("button", { name: /guardar y finalizar/i }));

    expect(
      screen.getByText(/evaluación guardada correctamente/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText("Finalizada").length).toBeGreaterThan(0);
    expect(screen.getByText(/bitácora de estados/i)).toBeInTheDocument();
  });

  it("muestra una ruta inexistente con la página 404", () => {
    renderConContexto(<App />, { ruta: "/ruta-que-no-existe" });
    expect(screen.getByText(/página no encontrada/i)).toBeInTheDocument();
  });
});
