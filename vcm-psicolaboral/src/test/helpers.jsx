import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "../context/AppContext.jsx";

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
