import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import PostulacionesPage from "./PostulacionesPage.jsx";
import { crearServicioFalso } from "../test/servicioFalso.js";
import { renderConApi, renderConContexto } from "../test/helpers.jsx";

let clickOriginal;

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:curriculum");
  URL.revokeObjectURL = vi.fn();
  clickOriginal = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = vi.fn();
});

afterEach(() => {
  HTMLAnchorElement.prototype.click = clickOriginal;
});

describe("PostulacionesPage", () => {
  it("lista las postulaciones con su carpeta y candidato", async () => {
    renderConApi(<PostulacionesPage />, { ruta: "/postulaciones" });

    expect(await screen.findByText("AQ-2026-ABC123")).toBeInTheDocument();
    expect(screen.getByText("Valentina Rojas")).toBeInTheDocument();
    expect(screen.getByText("Analista de Calidad")).toBeInTheDocument();
    expect(
      screen.getByText("CV-2026-000005-VALENTINA-ROJAS"),
    ).toBeInTheDocument();
    expect(screen.getByText(/acceso restringido/i)).toBeInTheDocument();
  });

  it("filtra por folio o candidato y limpia la búsqueda", async () => {
    renderConApi(<PostulacionesPage />, { ruta: "/postulaciones" });
    await screen.findByText("AQ-2026-ABC123");

    const buscador = screen.getByRole("searchbox", {
      name: /buscar postulación/i,
    });
    fireEvent.change(buscador, {
      target: { value: "valentina" },
    });
    expect(screen.getByText("AQ-2026-ABC123")).toBeInTheDocument();

    fireEvent.change(buscador, {
      target: { value: "no-existe" },
    });
    expect(
      screen.getByText(/aún no hay postulaciones para mostrar/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /limpiar filtros/i }));
    expect(screen.getByText("AQ-2026-ABC123")).toBeInTheDocument();
  });

  it("descarga el currículum privado con el nombre original", async () => {
    const { servicio } = renderConApi(<PostulacionesPage />, {
      ruta: "/postulaciones",
    });
    await screen.findByText("AQ-2026-ABC123");

    fireEvent.click(
      screen.getByRole("button", { name: /cv-valentina\.pdf/i }),
    );

    await waitFor(() =>
      expect(servicio.descargarCv).toHaveBeenCalledWith(5),
    );
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });

  it("informa cuando la descarga falla", async () => {
    const servicio = crearServicioFalso({
      descargarCv: vi.fn().mockRejectedValue(new Error("sin permisos")),
    });
    renderConApi(<PostulacionesPage />, { ruta: "/postulaciones", servicio });
    await screen.findByText("AQ-2026-ABC123");

    fireEvent.click(
      screen.getByRole("button", { name: /cv-valentina\.pdf/i }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(/sin permisos/i);
  });

  it("avisa cuando se usa el modo demostración sin backend", () => {
    renderConContexto(<PostulacionesPage />, { ruta: "/postulaciones" });
    expect(screen.getByText(/conecta el backend/i)).toBeInTheDocument();
    expect(
      screen.getByText(/aún no hay postulaciones para mostrar/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/acceso restringido/i)).toBeInTheDocument();
  });
});
