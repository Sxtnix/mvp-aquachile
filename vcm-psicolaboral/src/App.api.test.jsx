import { describe, expect, it } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import App from "./App.jsx";
import { crearServicioFalso } from "./test/servicioFalso.js";
import { renderConApi } from "./test/helpers.jsx";

describe("App en modo API", () => {
  it("muestra la sesión real y navega a postulaciones", async () => {
    renderConApi(<App />, { ruta: "/" });

    expect(
      await screen.findByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/camila reyes/i).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /cerrar sesión/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Analista" })).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("link", { name: /^postulaciones$/i }),
    );
    expect(
      await screen.findByRole("heading", { name: /postulaciones y carpetas cv/i }),
    ).toBeInTheDocument();
  });

  it("cierra la sesión y vuelve al formulario de acceso", async () => {
    const servicio = crearServicioFalso();
    renderConApi(<App />, { ruta: "/", servicio });
    await screen.findByRole("heading", { name: "Dashboard" });

    fireEvent.click(screen.getByRole("button", { name: /cerrar sesión/i }));
    await waitFor(() => expect(servicio.cerrarSesion).toHaveBeenCalled());
    expect(
      await screen.findByRole("heading", { name: /inicia sesión/i }),
    ).toBeInTheDocument();
  });

  it("abre el portal público y el formulario de ofertas sin sesión interna", async () => {
    const servicio = crearServicioFalso({
      refrescarSesion: undefined,
      cargarOfertasPublicas: async () => [],
    });
    // Sin refrescarSesion el proveedor no puede recuperar sesión: se usa null.
    servicio.refrescarSesion = async () => null;

    renderConApi(<App />, { ruta: "/postular", servicio });
    expect(
      await screen.findByRole("heading", {
        name: /postula en línea, sin filas ni papeles/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /acceso equipo/i }),
    ).toHaveAttribute("href", "/login");
  });
});
