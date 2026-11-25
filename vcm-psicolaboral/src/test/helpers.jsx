import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "../context/AppContext.jsx";
import { crearServicioFalso } from "./servicioFalso.js";

export function renderConContexto(ui, { ruta = "/", rutaPattern } = {}) {
  const contenido = rutaPattern ? (
    <Routes>
      <Route path={rutaPattern} element={ui} />
    </Routes>
  ) : (
    ui
  );
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AppProvider>{contenido}</AppProvider>
    </MemoryRouter>
  );
}

/** Renderiza con un servicio API falso para probar el modo conectado. */
export function renderConApi(
  ui,
  { ruta = "/", rutaPattern, servicio = crearServicioFalso() } = {},
) {
  const contenido = rutaPattern ? (
    <Routes>
      <Route path={rutaPattern} element={ui} />
    </Routes>
  ) : (
    ui
  );
  const resultado = render(
    <MemoryRouter initialEntries={[ruta]}>
      <AppProvider servicio={servicio}>{contenido}</AppProvider>
    </MemoryRouter>,
  );
  return { ...resultado, servicio };
}
