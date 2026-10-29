import { describe, expect, it } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import CandidatosPage from "./CandidatosPage.jsx";
import { renderConContexto } from "../test/helpers.jsx";

describe("CandidatosPage", () => {
  it("lista los candidatos registrados", () => {
    renderConContexto(<CandidatosPage />, { ruta: "/candidatos" });
    expect(screen.getByText(/10 de 10 registros/i)).toBeInTheDocument();
    expect(screen.getByText("Valentina Rojas")).toBeInTheDocument();
  });

  it("filtra por origen", () => {
    renderConContexto(<CandidatosPage />, { ruta: "/candidatos" });
    fireEvent.change(screen.getByLabelText(/origen/i), {
      target: { value: "Interno" },
    });
    expect(screen.getByText("Francisca Leiva")).toBeInTheDocument();
    expect(screen.queryByText("Valentina Rojas")).not.toBeInTheDocument();
  });

  it("elimina un candidato tras confirmar en el diálogo", () => {
    renderConContexto(<CandidatosPage />, { ruta: "/candidatos" });
    fireEvent.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);
    const dialogo = screen.getByRole("dialog");
    expect(within(dialogo).getByText(/valentina rojas/i)).toBeInTheDocument();
    fireEvent.click(within(dialogo).getByRole("button", { name: "Eliminar" }));
    expect(screen.queryByText("Valentina Rojas")).not.toBeInTheDocument();
    expect(screen.getByText(/9 de 9 registros/i)).toBeInTheDocument();
  });

  it("cancela la eliminación desde el diálogo", () => {
    renderConContexto(<CandidatosPage />, { ruta: "/candidatos" });
    fireEvent.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: /cancelar/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Valentina Rojas")).toBeInTheDocument();
  });
});
