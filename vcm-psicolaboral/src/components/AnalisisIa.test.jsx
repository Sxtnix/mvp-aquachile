import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import AnalisisIa from "./AnalisisIa.jsx";
import {
  ANALISIS_DEMO,
  crearServicioFalso,
  DATOS_DEMO,
} from "../test/servicioFalso.js";
import { renderConApi } from "../test/helpers.jsx";

const SOLICITUD = DATOS_DEMO.solicitudes[0];

describe("AnalisisIa", () => {
  it("muestra el análisis, el puntaje y el estado de revisión", async () => {
    renderConApi(<AnalisisIa solicitud={SOLICITUD} />);
    await screen.findByText(/openai\/gpt-oss-120b/i);

    expect(screen.getByText("88")).toBeInTheDocument();
    expect(screen.getByText(/buen ajuste al cargo/i)).toBeInTheDocument();
    expect(
      screen.getByText(/pendiente de revisión humana/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/ingeniería o carrera afín/i)).toBeInTheDocument();
    expect(screen.getByText(/licencia de conducir/i)).toBeInTheDocument();
    expect(
      screen.getByText(/limitaciones: información autoinformada/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /volver a analizar/i }),
    ).toBeEnabled();
  });

  it("genera y marca la revisión humana con avisos", async () => {
    const { servicio } = renderConApi(<AnalisisIa solicitud={SOLICITUD} />);
    await screen.findByText(/openai\/gpt-oss-120b/i);

    fireEvent.click(screen.getByRole("button", { name: /volver a analizar/i }));
    await waitFor(() => expect(servicio.analizarIa).toHaveBeenCalledWith(1));
    expect(
      await screen.findByText(/análisis generado/i),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /marcar revisión humana/i }),
    );
    await waitFor(() => expect(servicio.revisarIa).toHaveBeenCalledWith(1));
    expect(
      await screen.findByText(/marcado como revisado/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cerrar aviso/i }));
    expect(screen.queryByText(/marcado como revisado/i)).not.toBeInTheDocument();
  });

  it("informa errores al analizar o revisar", async () => {
    const servicio = crearServicioFalso({
      analizarIa: vi.fn().mockRejectedValue(new Error("Groq no disponible")),
      revisarIa: vi.fn().mockRejectedValue(new Error("No autorizado")),
    });
    renderConApi(<AnalisisIa solicitud={SOLICITUD} />, { servicio });
    await screen.findByText(/openai\/gpt-oss-120b/i);

    fireEvent.click(screen.getByRole("button", { name: /volver a analizar/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/groq no disponible/i);

    fireEvent.click(
      screen.getByRole("button", { name: /marcar revisión humana/i }),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/no autorizado/i),
    );
  });

  it("deshabilita el análisis cuando la IA no está configurada", async () => {
    const servicio = crearServicioFalso({
      cargarTodo: vi.fn().mockResolvedValue({
        ...DATOS_DEMO,
        iaEstado: { ...DATOS_DEMO.iaEstado, configurada: false },
      }),
    });
    renderConApi(<AnalisisIa solicitud={{ ...SOLICITUD, analisis: null }} />, {
      servicio,
    });

    expect(
      await screen.findByText(/la ia no está configurada/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /analizar cv con ia/i }),
    ).toBeDisabled();
  });

  it("explica cuándo no hay currículum o análisis disponible", async () => {
    const { unmount } = renderConApi(
      <AnalisisIa solicitud={{ ...SOLICITUD, analisis: null }} />,
    );
    expect(
      await screen.findByText(/sin análisis de ia todavía/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/puedes analizar el currículum cuando quieras/i),
    ).toBeInTheDocument();
    unmount();

    renderConApi(
      <AnalisisIa
        solicitud={{ ...SOLICITUD, analisis: null, postulacion: null }}
      />,
    );
    expect(
      screen.getByText(/no tiene un currículum adjunto/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /analizar cv con ia/i }),
    ).not.toBeInTheDocument();
  });

  it("distingue un análisis ya revisado", async () => {
    renderConApi(
      <AnalisisIa
        solicitud={{
          ...SOLICITUD,
          analisis: {
            ...ANALISIS_DEMO,
            pendienteRevision: false,
            revisadoPor: "Valeria Ospina",
          },
        }}
      />,
    );
    expect(await screen.findByText(/revisado por valeria ospina/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /marcar revisión humana/i }),
    ).not.toBeInTheDocument();
  });
});

describe("AnalisisIa — casos límite", () => {
  it("tolera requisitos con estado desconocido y listas vacías", async () => {
    renderConApi(
      <AnalisisIa
        solicitud={{
          ...SOLICITUD,
          analisis: {
            ...ANALISIS_DEMO,
            requisitos: [
              { requisito: "Requisito raro", estado: "otro", detalle: "—" },
            ],
            preguntas: [],
            faltantes: [],
            limitaciones: "",
            pendienteRevision: false,
            revisadoPor: null,
          },
        }}
      />,
    );

    expect(await screen.findByText(/requisito raro/i)).toBeInTheDocument();
    expect(screen.getByText(/sin evidencia/i)).toBeInTheDocument();
    expect(screen.getByText(/revisado por camila reyes/i)).toBeInTheDocument();
    expect(screen.queryByText(/datos faltantes/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/limitaciones:/i)).not.toBeInTheDocument();
  });
});
