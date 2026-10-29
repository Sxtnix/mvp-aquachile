import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import BandejaSolicitudes from "./BandejaSolicitudes.jsx";
import { solicitudesIniciales } from "../data/datosIniciales.js";
import { renderConContexto } from "../test/helpers.jsx";

function pintar() {
  return renderConContexto(
    <BandejaSolicitudes
      solicitudes={solicitudesIniciales}
      titulo="Listado"
      mostrarResponsable={false}
    />
  );
}

describe("BandejaSolicitudes", () => {
  it("renderiza las solicitudes con su candidato", () => {
    pintar();
    expect(screen.getByText("Listado")).toBeInTheDocument();
    expect(screen.getByText("Valentina Rojas")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /ver detalle/i }).length).toBeGreaterThan(0);
  });

  it("filtra por estado", () => {
    pintar();
    fireEvent.change(screen.getByLabelText(/estado/i), {
      target: { value: "Pendiente" },
    });
    expect(screen.getByText("Tomás Vargas")).toBeInTheDocument();
    expect(screen.queryByText("Valentina Rojas")).not.toBeInTheDocument();
  });

  it("filtra por texto de candidato o cargo", () => {
    pintar();
    fireEvent.change(screen.getByLabelText(/buscar candidato o cargo/i), {
      target: { value: "javiera" },
    });
    expect(screen.getByText("Javiera Morales")).toBeInTheDocument();
    expect(screen.queryByText("Tomás Vargas")).not.toBeInTheDocument();
  });

  it("muestra mensaje vacío cuando ningún registro coincide", () => {
    pintar();
    fireEvent.change(screen.getByLabelText(/buscar candidato o cargo/i), {
      target: { value: "no-existe-esteelemento" },
    });
    expect(screen.getByText(/no hay solicitudes/i)).toBeInTheDocument();
  });
});
