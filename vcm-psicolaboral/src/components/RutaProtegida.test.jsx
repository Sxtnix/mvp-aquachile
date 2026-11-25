import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import RutaProtegida from "./RutaProtegida.jsx";
import { crearServicioFalso, USUARIO_DEMO } from "../test/servicioFalso.js";
import { renderConApi } from "../test/helpers.jsx";

function pintar(servicio) {
  return renderConApi(
    <Routes>
      <Route
        path="/"
        element={
          <RutaProtegida>
            <div>Contenido protegido</div>
          </RutaProtegida>
        }
      />
      <Route path="/login" element={<div>Pantalla de login</div>} />
    </Routes>,
    { ruta: "/", servicio },
  );
}

describe("RutaProtegida", () => {
  it("muestra el cargando mientras se recupera la sesión", async () => {
    pintar(
      crearServicioFalso({
        refrescarSesion: vi.fn(() => new Promise(() => {})),
      }),
    );
    expect(
      screen.getByRole("status", { name: /cargando sesión/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/recuperando tu sesión/i)).toBeInTheDocument();
  });

  it("redirige al login cuando no hay sesión", async () => {
    pintar(
      crearServicioFalso({
        refrescarSesion: vi.fn().mockResolvedValue(null),
        cargarOfertasPublicas: vi.fn().mockResolvedValue([]),
      }),
    );
    expect(await screen.findByText("Pantalla de login")).toBeInTheDocument();
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });

  it("muestra el contenido cuando la sesión es válida", async () => {
    pintar(
      crearServicioFalso({
        refrescarSesion: vi.fn().mockResolvedValue(USUARIO_DEMO),
      }),
    );
    expect(await screen.findByText("Contenido protegido")).toBeInTheDocument();
  });
});
