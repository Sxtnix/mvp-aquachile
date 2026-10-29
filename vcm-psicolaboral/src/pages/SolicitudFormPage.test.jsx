import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import SolicitudFormPage from "./SolicitudFormPage.jsx";
import { renderConContexto } from "../test/helpers.jsx";

describe("SolicitudFormPage", () => {
  it("ofrece solo candidatos sin solicitud activa", () => {
    renderConContexto(<SolicitudFormPage />, { ruta: "/solicitudes/nueva" });
    const select = screen.getByLabelText(/^candidato/i);
    expect(select).toContainElement(screen.getByText(/constanza fuentes/i));
    expect(screen.queryByText(/mauricio alarcón/i)).not.toBeInTheDocument();
  });

  it("marca errores al enviar el formulario vacío", () => {
    renderConContexto(<SolicitudFormPage />, { ruta: "/solicitudes/nueva" });
    fireEvent.click(screen.getByRole("button", { name: /crear solicitud/i }));
    expect(screen.getByText(/selecciona un candidato válido/i)).toBeInTheDocument();
    expect(screen.getByText(/selecciona el profesional responsable/i)).toBeInTheDocument();
  });

  it("muestra el resumen del candidato seleccionado", () => {
    renderConContexto(<SolicitudFormPage />, { ruta: "/solicitudes/nueva" });
    fireEvent.change(screen.getByLabelText(/^candidato/i), {
      target: { value: "9" },
    });
    expect(screen.getByText(/estado inicial/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ingeniero de procesos/i).length).toBeGreaterThan(1);
  });
});
