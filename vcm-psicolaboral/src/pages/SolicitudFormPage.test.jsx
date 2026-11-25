import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import App from "../App.jsx";
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

describe("SolicitudFormPage — creación y permisos", () => {
  it("crea una solicitud y vuelve a la bandeja", () => {
    renderConContexto(<App />, { ruta: "/solicitudes/nueva" });

    fireEvent.change(screen.getByLabelText(/^candidato/i), {
      target: { value: "9" },
    });
    fireEvent.change(screen.getByLabelText(/profesional responsable/i), {
      target: { value: "Valeria Ospina" },
    });
    fireEvent.change(screen.getByLabelText(/prioridad/i), {
      target: { value: "Alta" },
    });
    fireEvent.change(screen.getByLabelText(/observaciones/i), {
      target: { value: "Solicitud creada desde la prueba de interfaz." },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear solicitud/i }));

    expect(
      screen.getByRole("heading", { name: /solicitudes de evaluación/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/constanza fuentes/i).length).toBeGreaterThan(0);
  });

  it("bloquea la creación para evaluador y jefatura", () => {
    renderConContexto(<App />, { ruta: "/solicitudes/nueva" });
    fireEvent.click(screen.getByRole("button", { name: "Evaluador" }));
    expect(
      screen.getByText(/tu perfil no puede crear solicitudes/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Jefatura" }));
    expect(
      screen.getByText(/tu perfil no puede crear solicitudes/i),
    ).toBeInTheDocument();
  });

  it("rechaza una fecha de solicitud futura", () => {
    renderConContexto(<SolicitudFormPage />, { ruta: "/solicitudes/nueva" });
    fireEvent.change(screen.getByLabelText(/fecha de solicitud/i), {
      target: { value: "2099-01-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear solicitud/i }));
    expect(screen.getByText(/no puede ser futura/i)).toBeInTheDocument();
  });
});
