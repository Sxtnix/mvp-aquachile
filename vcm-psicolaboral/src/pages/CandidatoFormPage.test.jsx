import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import App from "../App.jsx";
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
  fireEvent.change(screen.getByLabelText(/departamento/i), {
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

describe("CandidatoFormPage — estados y permisos", () => {
  it("muestra la ficha en solo lectura para jefatura", async () => {
    renderConContexto(<App />, { ruta: "/candidatos/1" });
    fireEvent.click(screen.getByRole("button", { name: "Jefatura" }));

    expect(
      screen.getByText(/tu perfil no puede crear ni editar candidatos/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre completo/i)).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: /guardar cambios/i }),
    ).not.toBeInTheDocument();
  });

  it("avisa cuando el candidato no existe", () => {
    renderConContexto(<App />, { ruta: "/candidatos/999" });
    expect(
      screen.getByText(/el candidato solicitado no existe/i),
    ).toBeInTheDocument();
  });

  it("registra un candidato nuevo y vuelve al listado", () => {
    renderConContexto(<App />, { ruta: "/candidatos/nuevo" });
    completarFormulario("persona.nueva@correo.cl");
    fireEvent.click(screen.getByLabelText(/requiere contacto de referencia/i));
    fireEvent.click(screen.getByRole("button", { name: /registrar candidato/i }));

    expect(
      screen.getByRole("heading", { name: /^candidatos$/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Persona Nueva")).toBeInTheDocument();
    expect(screen.getByText(/11 de 11 registros/i)).toBeInTheDocument();
  });

  it("guarda los cambios de un candidato existente", () => {
    renderConContexto(<App />, { ruta: "/candidatos/1" });
    fireEvent.change(screen.getByLabelText(/teléfono/i), {
      target: { value: "+56 9 0000 1111" },
    });
    fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    expect(
      screen.getByRole("heading", { name: /^candidatos$/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Valentina Rojas").length).toBeGreaterThan(0);
  });

  it("valida nombre corto, teléfono y fecha futura", () => {
    renderConContexto(<App />, { ruta: "/candidatos/nuevo" });
    fireEvent.change(screen.getByLabelText(/nombre completo/i), {
      target: { value: "Al" },
    });
    fireEvent.change(screen.getByLabelText(/teléfono/i), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText(/fecha de postulación/i), {
      target: { value: "2099-01-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: /registrar candidato/i }));

    expect(
      screen.getByText(/al menos 3 caracteres/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/usa solo números, espacios o el signo/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no puede ser futura/i),
    ).toBeInTheDocument();
  });
});
