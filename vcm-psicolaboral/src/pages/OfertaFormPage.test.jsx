import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import App from "../App.jsx";
import { renderConContexto } from "../test/helpers.jsx";

function pintar() {
  return renderConContexto(<App />, { ruta: "/ofertas/nueva" });
}

describe("OfertaFormPage", () => {
  it("muestra errores al publicar sin datos", () => {
    pintar();
    fireEvent.click(screen.getByRole("button", { name: /publicar oferta/i }));

    expect(screen.getByText(/indica el cargo/i)).toBeInTheDocument();
    expect(screen.getByText(/indica la fecha de cierre/i)).toBeInTheDocument();
    expect(screen.getByText(/describe brevemente la oferta/i)).toBeInTheDocument();
    expect(screen.getByText(/indica los requisitos/i)).toBeInTheDocument();
  });

  it("publica una oferta y la deja disponible en el listado", () => {
    pintar();

    fireEvent.change(screen.getByLabelText(/cargo de la oferta/i), {
      target: { value: "Analista de Datos" },
    });
    fireEvent.change(screen.getByLabelText(/familia de cargo/i), {
      target: { value: "Profesional A" },
    });
    fireEvent.change(screen.getByLabelText(/ubicación del cargo/i), {
      target: { value: "Oficina Central" },
    });
    fireEvent.change(screen.getByLabelText(/departamento/i), {
      target: { value: "Calidad" },
    });
    fireEvent.change(screen.getByLabelText(/modalidad de trabajo/i), {
      target: { value: "Híbrida" },
    });
    fireEvent.change(screen.getByLabelText(/profesional responsable/i), {
      target: { value: "Héctor Bustos" },
    });
    fireEvent.change(screen.getByLabelText(/fecha de cierre/i), {
      target: { value: "2026-12-31" },
    });
    fireEvent.change(screen.getByLabelText(/descripción de la oferta/i), {
      target: {
        value: "Análisis de datos para el seguimiento de indicadores de calidad.",
      },
    });
    fireEvent.change(screen.getByLabelText(/funciones del cargo/i), {
      target: {
        value: "Analizar datos de procesos y construir tableros de control.",
      },
    });
    fireEvent.change(screen.getByLabelText(/requisitos/i), {
      target: {
        value: "Experiencia en análisis de datos y manejo de herramientas BI.",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /publicar oferta/i }));

    expect(
      screen.getByRole("heading", { name: /ofertas laborales/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Analista de Datos")).toBeInTheDocument();
  });
});

function completarOferta({ fechaPublicacion } = {}) {
  fireEvent.change(screen.getByLabelText(/cargo de la oferta/i), {
    target: { value: "Analista de Datos" },
  });
  fireEvent.change(screen.getByLabelText(/familia de cargo/i), {
    target: { value: "Profesional A" },
  });
  fireEvent.change(screen.getByLabelText(/ubicación del cargo/i), {
    target: { value: "Oficina Central" },
  });
  fireEvent.change(screen.getByLabelText(/^departamento/i), {
    target: { value: "Calidad" },
  });
  fireEvent.change(screen.getByLabelText(/modalidad de trabajo/i), {
    target: { value: "Híbrida" },
  });
  fireEvent.change(screen.getByLabelText(/profesional responsable/i), {
    target: { value: "Héctor Bustos" },
  });
  fireEvent.change(screen.getByLabelText(/fecha de cierre/i), {
    target: { value: "2026-12-31" },
  });
  if (fechaPublicacion !== undefined) {
    fireEvent.change(screen.getByLabelText(/fecha de publicación/i), {
      target: { value: fechaPublicacion },
    });
  }
  fireEvent.change(screen.getByLabelText(/descripción de la oferta/i), {
    target: {
      value: "Análisis de datos para el seguimiento de indicadores de calidad.",
    },
  });
  fireEvent.change(screen.getByLabelText(/funciones del cargo/i), {
    target: {
      value: "Construir tableros y analizar indicadores de proceso.",
    },
  });
  fireEvent.change(screen.getByLabelText(/requisitos/i), {
    target: {
      value: "Experiencia en análisis de datos y manejo de herramientas BI.",
    },
  });
}

describe("OfertaFormPage — permisos y edición", () => {
  it("impide crear ofertas a jefatura", () => {
    renderConContexto(<App />, { ruta: "/ofertas/nueva" });
    fireEvent.click(screen.getByRole("button", { name: "Jefatura" }));
    expect(
      screen.getByText(/tu perfil no puede crear ni editar ofertas/i),
    ).toBeInTheDocument();
  });

  it("avisa cuando la oferta no existe", () => {
    renderConContexto(<App />, { ruta: "/ofertas/999" });
    expect(
      screen.getByText(/la oferta solicitada no existe/i),
    ).toBeInTheDocument();
  });

  it("edita una oferta existente y guarda los cambios", () => {
    renderConContexto(<App />, { ruta: "/ofertas/1" });
    fireEvent.change(screen.getByLabelText(/cantidad de vacantes/i), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText(/modalidad de trabajo/i), {
      target: { value: "Presencial" },
    });
    fireEvent.change(screen.getByLabelText(/funciones del cargo/i), {
      target: {
        value: "Ejecutar mantenciones preventivas y registrar órdenes de trabajo.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    expect(
      screen.getByRole("heading", { name: /ofertas laborales/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/3 vacantes/i).length).toBeGreaterThanOrEqual(2);
  });

  it("guarda un borrador sin fecha de publicación", () => {
    renderConContexto(<App />, { ruta: "/ofertas/nueva" });
    completarOferta({ fechaPublicacion: "" });
    fireEvent.change(screen.getByLabelText(/estado de la oferta/i), {
      target: { value: "Borrador" },
    });
    fireEvent.change(screen.getByLabelText(/beneficios/i), {
      target: { value: "Seguro complementario y formación continua." },
    });
    fireEvent.change(screen.getByLabelText(/sueldo o rango/i), {
      target: { value: "$1.100.000 bruto" },
    });
    fireEvent.click(screen.getByRole("button", { name: /publicar oferta/i }));

    expect(
      screen.getByRole("heading", { name: /ofertas laborales/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Analista de Datos")).toBeInTheDocument();
    expect(
      screen.queryByText(/indica la fecha de publicación/i),
    ).not.toBeInTheDocument();
  });

  it("valida funciones breves y fechas incoherentes", () => {
    renderConContexto(<App />, { ruta: "/ofertas/nueva" });
    completarOferta({ fechaPublicacion: "2026-12-31" });
    fireEvent.change(screen.getByLabelText(/fecha de publicación/i), {
      target: { value: "2026-12-31" },
    });
    fireEvent.change(screen.getByLabelText(/fecha de cierre/i), {
      target: { value: "2026-11-01" },
    });
    fireEvent.change(screen.getByLabelText(/funciones del cargo/i), {
      target: { value: "Corto" },
    });
    fireEvent.click(screen.getByRole("button", { name: /publicar oferta/i }));

    expect(screen.getByText(/al menos 10 caracteres/i)).toBeInTheDocument();
    expect(screen.getByText(/no puede ser anterior/i)).toBeInTheDocument();
  });
});
