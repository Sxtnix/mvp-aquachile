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

describe("BandejaSolicitudes — columna de responsable", () => {
  it("muestra el responsable y el mensaje vacío personalizado", () => {
    renderConContexto(
      <BandejaSolicitudes
        solicitudes={solicitudesIniciales}
        titulo="Todas"
        filaVacia="Sin coincidencias personalizadas"
      />,
    );
    expect(screen.getByText("Todas")).toBeInTheDocument();
    expect(screen.getAllByText("Valeria Ospina").length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText(/buscar candidato o cargo/i), {
      target: { value: "no-existe" },
    });
    expect(screen.getByText(/sin coincidencias personalizadas/i)).toBeInTheDocument();
  });

  it("filtra por rango de fechas y familia", () => {
    renderConContexto(
      <BandejaSolicitudes solicitudes={solicitudesIniciales} mostrarResponsable={false} />,
    );
    fireEvent.change(screen.getByLabelText(/familia/i), {
      target: { value: "Jefatura" },
    });
    expect(screen.getByText("Francisca Leiva")).toBeInTheDocument();
    expect(screen.queryByText("Valentina Rojas")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /limpiar filtros/i }));
    fireEvent.change(screen.getByLabelText(/fecha de solicitud desde/i), {
      target: { value: "2026-10-01" },
    });
    expect(screen.queryByText("Valentina Rojas")).not.toBeInTheDocument();
  });
});
