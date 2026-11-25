import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import BarraFiltros from "./BarraFiltros.jsx";
import BuscadorExpandible from "./BuscadorExpandible.jsx";

describe("BuscadorExpandible", () => {
  it("asocia la etiqueta y permite limpiar el texto", () => {
    const alCambiar = vi.fn();
    const alLimpiar = vi.fn();
    const { rerender } = render(
      <BuscadorExpandible
        id="buscar"
        etiqueta="Buscar oferta"
        placeholder="Cargo o planta"
        valor=""
        alCambiar={alCambiar}
        alLimpiar={alLimpiar}
      />,
    );

    const input = screen.getByLabelText(/buscar oferta/i);
    expect(input).toHaveAttribute("placeholder", "Cargo o planta");
    fireEvent.change(input, { target: { value: "calidad" } });
    expect(alCambiar).toHaveBeenCalled();

    rerender(
      <BuscadorExpandible
        id="buscar"
        etiqueta="Buscar oferta"
        placeholder="Cargo o planta"
        valor="calidad"
        alCambiar={alCambiar}
        alLimpiar={alLimpiar}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /limpiar buscar oferta/i }));
    expect(alLimpiar).toHaveBeenCalled();
  });

  it("no muestra el botón de limpiar sin texto", () => {
    render(
      <BuscadorExpandible
        id="buscar"
        etiqueta="Buscar"
        placeholder="Texto"
        valor=""
        alCambiar={vi.fn()}
        alLimpiar={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", { name: /limpiar/i }),
    ).not.toBeInTheDocument();
  });
});

describe("BarraFiltros", () => {
  it("muestra el resumen y limpia los filtros activos", () => {
    const alLimpiar = vi.fn();
    render(
      <BarraFiltros
        resumen={<span>3 de 8 registros</span>}
        hayFiltros
        alLimpiar={alLimpiar}
        etiqueta="Filtros de prueba"
      >
        <div>Campo</div>
      </BarraFiltros>,
    );
    expect(
      screen.getByRole("region", { name: "Filtros de prueba" }),
    ).toBeInTheDocument();
    expect(screen.getByText("3 de 8 registros")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /limpiar filtros/i }));
    expect(alLimpiar).toHaveBeenCalled();
  });

  it("omite la acción de limpieza cuando no hay filtros", () => {
    render(
      <BarraFiltros resumen={<span>Sin filtros</span>}>
        <div>Campo</div>
      </BarraFiltros>,
    );
    expect(screen.getByText("Sin filtros")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /limpiar/i }),
    ).not.toBeInTheDocument();
  });
});

describe("BarraFiltros — combinaciones", () => {
  it("muestra la limpieza aunque no exista resumen", () => {
    const alLimpiar = vi.fn();
    render(
      <BarraFiltros hayFiltros alLimpiar={alLimpiar}>
        <div>Campo</div>
      </BarraFiltros>,
    );
    fireEvent.click(screen.getByRole("button", { name: /limpiar filtros/i }));
    expect(alLimpiar).toHaveBeenCalled();
  });
});
