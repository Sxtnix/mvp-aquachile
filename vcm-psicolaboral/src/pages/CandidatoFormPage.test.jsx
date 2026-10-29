import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import CandidatoFormPage from "./CandidatoFormPage.jsx";
import { renderConContexto } from "../test/helpers.jsx";

function completarFormulario(correo) {
  fireEvent.change(screen.getByLabelText(/nombre completo/i), {
    target: { value: "Persona Nueva" },
  });
  fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
    target: { value: correo },
  });
  fireEvent.change(screen.getByLabelText(/teléfono/i), {
    target: { value: "+56 9 1234 5678" },
  });
  fireEvent.change(screen.getByLabelText(/cargo al que postula/i), {
    target: { value: "Analista de Datos" },
  });
  fireEvent.change(screen.getByLabelText(/familia de cargo/i), {
    target: { value: "Profesional A" },
  });
  fireEvent.change(screen.getByLabelText(/origen del candidato/i), {
    target: { value: "Externo" },
  });
  fireEvent.change(screen.getByLabelText(/ubicación del cargo/i), {
    target: { value: "Oficina Central" },
  });
  fireEvent.change(screen.getByLabelText(/unidad contratante/i), {
    target: { value: "Calidad" },
  });
}

describe("CandidatoFormPage", () => {
  it("muestra errores al enviar el formulario vacío", () => {
    renderConContexto(<CandidatoFormPage />, { ruta: "/candidatos/nuevo" });
    fireEvent.click(screen.getByRole("button", { name: /registrar candidato/i }));
    expect(screen.getByText(/ingresa el nombre completo/i)).toBeInTheDocument();
    expect(screen.getByText(/ingresa el correo electrónico/i)).toBeInTheDocument();
  });

  it("marca un correo duplicado", () => {
    renderConContexto(<CandidatoFormPage />, { ruta: "/candidatos/nuevo" });
    completarFormulario("valentina.rojas@correo.cl");
    fireEvent.click(screen.getByRole("button", { name: /registrar candidato/i }));
    expect(screen.getByText(/ya existe un candidato con este correo/i)).toBeInTheDocument();
  });

  it("marca un correo con formato inválido", () => {
    renderConContexto(<CandidatoFormPage />, { ruta: "/candidatos/nuevo" });
    completarFormulario("no-es-correo");
    fireEvent.click(screen.getByRole("button", { name: /registrar candidato/i }));
    expect(screen.getByText(/el formato del correo no es válido/i)).toBeInTheDocument();
  });

  it("precarga la ficha del candidato en modo edición", () => {
    renderConContexto(<CandidatoFormPage />, {
      ruta: "/candidatos/1",
      rutaPattern: "/candidatos/:id",
    });
    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue(
      "Valentina Rojas"
    );
    expect(screen.getByLabelText(/nombre completo/i)).toBeEnabled();
  });
});
