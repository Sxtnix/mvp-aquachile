import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import PostulacionPage from "./PostulacionPage.jsx";
import { renderConContexto } from "../test/helpers.jsx";

function pintar() {
  return renderConContexto(<PostulacionPage />, {
    ruta: "/postular/1",
    rutaPattern: "/postular/:ofertaId",
  });
}

function archivoPdf() {
  return new File(["contenido del curriculum"], "curriculum.pdf", {
    type: "application/pdf",
  });
}

describe("PostulacionPage", () => {
  it("muestra la oferta y exige los datos mínimos", () => {
    pintar();
    expect(
      screen.getByRole("heading", { name: /postula a técnico de mantenimiento/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /enviar postulación/i }));

    expect(screen.getByText(/ingresa tu nombre completo/i)).toBeInTheDocument();
    expect(screen.getByText(/adjunta tu currículum en formato/i)).toBeInTheDocument();
    expect(screen.getByText(/debes autorizar/i)).toBeInTheDocument();
  });

  it("registra la postulación y muestra el número de folio", async () => {
    pintar();

    fireEvent.change(screen.getByLabelText(/nombre completo/i), {
      target: { value: "Camila Postulante" },
    });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "camila.postulante@correo.cl" },
    });
    fireEvent.change(screen.getByLabelText(/teléfono/i), {
      target: { value: "+56 9 5555 4444" },
    });
    fireEvent.change(screen.getByLabelText(/^currículum/i), {
      target: { files: [archivoPdf()] },
    });
    fireEvent.click(screen.getByLabelText(/autorizo a aquachile/i));

    fireEvent.click(screen.getByRole("button", { name: /enviar postulación/i }));

    expect(
      await screen.findByRole("heading", { name: /postulación recibida/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/camila postulante/i)).toBeInTheDocument();
    expect(screen.getByText(/n.° de postulación/i)).toBeInTheDocument();
  });

  it("rechaza un archivo con formato no permitido", () => {
    pintar();

    fireEvent.change(screen.getByLabelText(/^currículum/i), {
      target: {
        files: [new File(["x"], "virus.exe", { type: "application/x-msdownload" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar postulación/i }));

    expect(screen.getByText(/debe ser PDF, DOC o DOCX/i)).toBeInTheDocument();
  });

  it("muestra un aviso cuando la oferta no está disponible", () => {
    renderConContexto(<PostulacionPage />, {
      ruta: "/postular/4",
      rutaPattern: "/postular/:ofertaId",
    });
    expect(
      screen.getByRole("heading", { name: /oferta no disponible/i })
    ).toBeInTheDocument();
  });
});
