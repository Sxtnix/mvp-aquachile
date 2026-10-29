import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { PERFILES } from "../data/catalogos.js";
import { PERMISOS, estadoInicial, reducer } from "./motorEstado.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [estado, dispatch] = useReducer(reducer, estadoInicial);

  const perfil = PERFILES[estado.perfilActivo];
  const permisos = PERMISOS[estado.perfilActivo];
  const puede = useCallback(
    (accion) => Boolean(permisos[accion]),
    [permisos]
  );

  const veTodas =
    estado.perfilActivo === "analista" || estado.perfilActivo === "jefatura";

  const solicitudesVisibles = useMemo(() => {
    if (veTodas) return estado.solicitudes;
    return estado.solicitudes.filter(
      (solicitud) => solicitud.responsable === perfil.nombre
    );
  }, [estado.solicitudes, veTodas, perfil.nombre]);

  const valor = useMemo(
    () => ({
      candidatos: estado.candidatos,
      solicitudes: estado.solicitudes,
      solicitudesVisibles,
      evaluaciones: estado.evaluaciones,
      bitacora: estado.bitacora,
      perfil,
      perfilActivo: estado.perfilActivo,
      veTodasLasSolicitudes: veTodas,
      puede,
      dispatch,
      obtenerCandidato: (id) =>
        estado.candidatos.find((candidato) => candidato.id === Number(id)),
      obtenerSolicitud: (id) =>
        estado.solicitudes.find((solicitud) => solicitud.id === Number(id)),
      evaluacionDe: (solicitudId) =>
        estado.evaluaciones.find(
          (evaluacion) => evaluacion.solicitudId === Number(solicitudId)
        ),
      bitacoraDe: (solicitudId) =>
        estado.bitacora
          .filter((registro) => registro.solicitudId === Number(solicitudId))
          .sort((a, b) => a.fecha.localeCompare(b.fecha)),
    }),
    [estado, perfil, veTodas, solicitudesVisibles, puede]
  );

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp() {
  const contexto = useContext(AppContext);
  if (!contexto) {
    throw new Error("useApp debe usarse dentro de AppProvider");
  }
  return contexto;
}
