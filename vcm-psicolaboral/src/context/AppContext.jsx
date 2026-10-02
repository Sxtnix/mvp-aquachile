import { createContext, useContext, useMemo, useState } from "react";
import {
  candidatosIniciales,
  evaluacionesIniciales,
  PERFILES,
  solicitudesIniciales,
} from "../data/datosFicticios.js";

const AppContext = createContext(null);

const PERMISOS = {
  Analista: {
    crearCandidato: true,
    editarCandidato: true,
    eliminarCandidato: true,
    crearSolicitud: true,
    editarEvaluacion: false,
    cambiarEstado: false,
  },
  Evaluador: {
    crearCandidato: false,
    editarCandidato: false,
    eliminarCandidato: false,
    crearSolicitud: false,
    editarEvaluacion: true,
    cambiarEstado: true,
  },
};

function siguienteId(registros) {
  return registros.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

export function AppProvider({ children }) {
  const [candidatos, setCandidatos] = useState(candidatosIniciales);
  const [solicitudes, setSolicitudes] = useState(solicitudesIniciales);
  const [evaluaciones, setEvaluaciones] = useState(evaluacionesIniciales);
  const [perfilActivo, setPerfilActivo] = useState("analista");

  const perfil = PERFILES[perfilActivo];
  const permisos = PERMISOS[perfilActivo === "analista" ? "Analista" : "Evaluador"];

  const puede = (accion) => Boolean(permisos[accion]);

  const verTodasLasSolicitudes = perfilActivo === "analista";

  const solicitudesVisibles = useMemo(() => {
    if (verTodasLasSolicitudes) return solicitudes;
    return solicitudes.filter(
      (solicitud) => solicitud.responsable === perfil.nombre
    );
  }, [solicitudes, verTodasLasSolicitudes, perfil.nombre]);

  const obtenerCandidato = (id) =>
    candidatos.find((candidato) => candidato.id === Number(id));

  const agregarCandidato = (datos) => {
    const nuevo = { ...datos, id: siguienteId(candidatos) };
    setCandidatos((actual) => [...actual, nuevo]);
    return nuevo.id;
  };

  const actualizarCandidato = (id, datos) => {
    setCandidatos((actual) =>
      actual.map((candidato) =>
        candidato.id === Number(id) ? { ...candidato, ...datos } : candidato
      )
    );
  };

  const eliminarCandidato = (id) => {
    setCandidatos((actual) =>
      actual.filter((candidato) => candidato.id !== Number(id))
    );
    setSolicitudes((actual) =>
      actual.filter((solicitud) => solicitud.candidatoId !== Number(id))
    );
  };

  const crearSolicitud = (datos) => {
    const nueva = {
      ...datos,
      id: siguienteId(solicitudes),
      estado: "Pendiente",
    };
    setSolicitudes((actual) => [...actual, nueva]);
    return nueva.id;
  };

  const cambiarEstadoSolicitud = (id, estado) => {
    setSolicitudes((actual) =>
      actual.map((solicitud) =>
        solicitud.id === Number(id) ? { ...solicitud, estado } : solicitud
      )
    );
  };

  const guardarEvaluacion = (solicitudId, datos) => {
    const idSolicitud = Number(solicitudId);
    setEvaluaciones((actual) => {
      const existente = actual.find(
        (evaluacion) => evaluacion.solicitudId === idSolicitud
      );
      if (existente) {
        return actual.map((evaluacion) =>
          evaluacion.solicitudId === idSolicitud
            ? { ...evaluacion, ...datos }
            : evaluacion
        );
      }
      return [
        ...actual,
        {
          ...datos,
          id: siguienteId(actual),
          solicitudId: idSolicitud,
        },
      ];
    });
  };

  const evaluacionDe = (solicitudId) =>
    evaluaciones.find(
      (evaluacion) => evaluacion.solicitudId === Number(solicitudId)
    );

  const valor = {
    candidatos,
    solicitudes,
    evaluaciones,
    solicitudesVisibles,
    perfil,
    perfilActivo,
    setPerfilActivo,
    puede,
    verTodasLasSolicitudes,
    obtenerCandidato,
    agregarCandidato,
    actualizarCandidato,
    eliminarCandidato,
    crearSolicitud,
    cambiarEstadoSolicitud,
    guardarEvaluacion,
    evaluacionDe,
  };

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp() {
  const contexto = useContext(AppContext);
  if (!contexto) {
    throw new Error("useApp debe usarse dentro de AppProvider");
  }
  return contexto;
}
