import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./LoginPage.jsx";
import { crearServicioFalso } from "../test/servicioFalso.js";
import { renderConApi } from "../test/helpers.jsx";

function servicioAnonimo(overrides = {}) {
  return crearServicioFalso({
    refrescarSesion: vi.fn().mockResolvedValue(null),
    cargarOfertasPublicas: vi.fn().mockResolvedValue([]),
    ...overrides,
  });
}

function pintar(servicio = servicioAnonimo()) {
  const resultado = renderConApi(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<div>Panel interno</div>} />
      <Route path="/postular" element={<div>Portal público</div>} />
    </Routes>,
    { ruta: "/login", servicio },
  );
  return { ...resultado, servicio };
}

describe("LoginPage", () => {
  it("muestra el formulario y las cuentas demo", async () => {
    pintar();
    expect(
      await screen.findByRole("heading", { name: /inicia sesión/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByText(/analista@aquachile\.cl/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /ir al portal de postulaciones/i }),
    ).toHaveAttribute("href", "/postular");
  });

  it("inicia sesión y navega al panel interno", async () => {
    const { servicio } = pintar();

    fireEvent.change(await screen.findByLabelText(/correo electrónico/i), {
      target: { value: "  analista@aquachile.cl  " },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "AquaChile2026!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(await screen.findByText("Panel interno")).toBeInTheDocument();
    expect(servicio.iniciarSesion).toHaveBeenCalledWith(
      "analista@aquachile.cl",
      "AquaChile2026!",
    );
    expect(servicio.cargarTodo).toHaveBeenCalled();
  });

  it("muestra el error cuando las credenciales son incorrectas", async () => {
    const servicio = servicioAnonimo({
      iniciarSesion: vi
        .fn()
        .mockRejectedValue(new Error("Credenciales incorrectas.")),
    });
    pintar(servicio);

    fireEvent.change(await screen.findByLabelText(/correo electrónico/i), {
      target: { value: "analista@aquachile.cl" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "mala" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /credenciales incorrectas/i,
    );
    expect(screen.getByLabelText(/correo electrónico/i)).toBeEnabled();
  });

  it("redirige al panel si la sesión ya está activa", async () => {
    pintar(crearServicioFalso());
    expect(await screen.findByText("Panel interno")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /inicia sesión/i }),
    ).not.toBeInTheDocument();
  });
});
