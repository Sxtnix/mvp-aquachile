/* eslint-disable react-refresh/only-export-components -- El provider y su hook se exportan juntos por diseño. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { PERFILES } from "../data/catalogos.js";
import {
  PERMISOS,
  estadoInicial,
  reducer,
  siguienteId,
} from "./motorEstado.js";

const AppContext = createContext(null);

const PERFIL_POR_ROL = {
  ANALISTA: "analista",
  EVALUADOR: "evaluador",
  JEFATURA: "jefatura",
};

const ETIQUETA_ROL = {
  ANALISTA: "Analista de Reclutamiento",
  EVALUADOR: "Profesional Evaluador",
  JEFATURA: "Jefatura (solo consulta)",
};

function cuerpoCandidato(datos) {
  return {
    nombre: datos.nombre,
    correo: datos.correo,
    telefono: datos.telefono,
    cargo: datos.cargo,
    familia: datos.familia,
    origen: datos.origen,
    ubicacion: datos.ubicacion,
    departamento: datos.departamento || datos.unidad || "",
    requiereReferencia: Boolean(datos.requiereReferencia),
    fechaPostulacion: datos.fechaPostulacion,
  };
}

function cuerpoOferta(datos) {
  return {
    cargo: datos.cargo,
    familia: datos.familia,
    departamento: datos.departamento || datos.unidad || "",
    ubicacion: datos.ubicacion,
    modalidad: datos.modalidad || "Presencial",
    descripcion: datos.descripcion,
    funciones: datos.funciones || datos.descripcion || "Funciones por definir.",
    requisitos: datos.requisitos,
    beneficios: datos.beneficios || "Beneficios por definir.",
    sueldo: datos.sueldo || "A convenir",
    vacantes: Number(datos.vacantes) || 1,
    fechaPublicacion: datos.fechaPublicacion || "",
    fechaCierre: datos.fechaCierre || "",
    estado: datos.estado || "Borrador",
    responsable: datos.responsable || "",
  };
}

export function AppProvider({ children, servicio = null }) {
  const [estado, dispatchLocal] = useReducer(reducer, estadoInicial);
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(Boolean(servicio));
  const [errorSync, setErrorSync] = useState("");
  const [notificacion, setNotificacion] = useState("");
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const perfilActivo = usoApi(servicio, usuario)
    ? PERFIL_POR_ROL[usuario?.rol] || estado.perfilActivo
    : estado.perfilActivo;

  const perfil = useMemo(() => {
    const base = PERFILES[perfilActivo] || PERFILES.analista;
    if (!servicio || !usuario) return base;
    return {
      ...base,
      nombre: usuario.nombre,
      rol: ETIQUETA_ROL[usuario.rol] || base.rol,
      email: usuario.email,
    };
  }, [perfilActivo, servicio, usuario]);

  const permisos = PERMISOS[perfilActivo] || PERMISOS.jefatura;
  const puede = useCallback(
    (accion) => Boolean(permisos[accion]),
    [permisos],
  );

  const veTodas =
    perfilActivo === "analista" || perfilActivo === "jefatura";

  const solicitudesVisibles = useMemo(() => {
    if (veTodas) return estado.solicitudes;
    return estado.solicitudes.filter(
      (solicitud) => solicitud.responsable === perfil.nombre,
    );
  }, [estado.solicitudes, veTodas, perfil.nombre]);

  const recargar = useCallback(async () => {
    if (!servicio) return;
    const datos = await servicio.cargarTodo();
    if (!montado.current) return;
    dispatchLocal({
      type: "hidratar",
      datos: { ...datos, perfilActivo },
    });
  }, [servicio, perfilActivo]);

  // Sesión inicial: recupera el refresh cookie y carga los datos de la API.
  useEffect(() => {
    if (!servicio) return;
    let activo = true;
    (async () => {
      setCargandoSesion(true);
      try {
        const sesion = await servicio.refrescarSesion();
        if (!activo) return;
        if (sesion) {
          setUsuario(sesion);
          const datos = await servicio.cargarTodo();
          if (!activo) return;
          dispatchLocal({
            type: "hidratar",
            datos: {
              ...datos,
              perfilActivo: PERFIL_POR_ROL[sesion.rol] || "jefatura",
            },
          });
        } else {
          const ofertas = await servicio.cargarOfertasPublicas();
          if (!activo) return;
          dispatchLocal({ type: "hidratar", datos: { ofertas } });
        }
      } catch (error) {
        if (activo) setErrorSync(error.message);
      } finally {
        if (activo) setCargandoSesion(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [servicio]);

  const login = useCallback(
    async (email, password) => {
      const sesion = await servicio.iniciarSesion(email, password);
      setUsuario(sesion);
      const datos = await servicio.cargarTodo();
      dispatchLocal({
        type: "hidratar",
        datos: { ...datos, perfilActivo: PERFIL_POR_ROL[sesion.rol] || "jefatura" },
      });
      return sesion;
    },
    [servicio],
  );

  const logout = useCallback(async () => {
    if (servicio) {
      try {
        await servicio.cerrarSesion();
      } catch {
        // Aunque falle la red, la sesión local se cierra igual.
      }
      setUsuario(null);
      setErrorSync("");
      setNotificacion("");
      dispatchLocal({ type: "cerrar-sesion" });
      try {
        const ofertas = await servicio.cargarOfertasPublicas();
        dispatchLocal({ type: "hidratar", datos: { ofertas } });
      } catch {
        // Sin conexión: se mantiene la pantalla de login.
      }
    } else {
      dispatchLocal({ type: "cerrar-sesion" });
    }
  }, [servicio]);

  const persistir = useCallback(
    async (accion) => {
      if (!servicio) return;
      const p = servicio.peticion;
      switch (accion.type) {
        case "agregar-candidato":
          await p("/candidatos", {
            method: "POST",
            body: cuerpoCandidato(accion.datos),
          });
          break;
        case "actualizar-candidato":
          await p(`/candidatos/${accion.id}`, {
            method: "PUT",
            body: cuerpoCandidato(accion.datos),
          });
          break;
        case "eliminar-candidato":
          await p(`/candidatos/${accion.id}`, { method: "DELETE" });
          break;
        case "crear-solicitud":
          await p("/solicitudes", {
            method: "POST",
            body: {
              candidatoId: Number(accion.datos.candidatoId),
              responsable: accion.datos.responsable || "",
              prioridad: accion.datos.prioridad,
              observaciones: accion.datos.observaciones || "",
              fechaEntrevista: accion.datos.fechaEntrevista || "",
              fechaSolicitud: accion.datos.fechaSolicitud,
            },
          });
          break;
        case "actualizar-solicitud":
          if (accion.datos.fechaSolicitud) {
            await p(`/solicitudes/${accion.id}`, {
              method: "PUT",
              body: {
                candidatoId: Number(accion.datos.candidatoId),
                responsable: accion.datos.responsable || "",
                prioridad: accion.datos.prioridad,
                observaciones: accion.datos.observaciones || "",
                fechaEntrevista: accion.datos.fechaEntrevista || "",
                fechaSolicitud: accion.datos.fechaSolicitud,
              },
            });
          }
          break;
        case "cambiar-estado":
          await p(`/solicitudes/${accion.id}/estado`, {
            method: "PATCH",
            body: { estado: accion.estado },
          });
          break;
        case "guardar-evaluacion":
          await p(`/solicitudes/${accion.solicitudId}/evaluacion`, {
            method: "PUT",
            body: {
              ...accion.datos,
              finalizar: Boolean(accion.finalizar),
            },
          });
          break;
        case "crear-oferta":
          await p("/ofertas", {
            method: "POST",
            body: cuerpoOferta(accion.datos),
          });
          break;
        case "actualizar-oferta":
          await p(`/ofertas/${accion.id}`, {
            method: "PUT",
            body: cuerpoOferta(accion.datos),
          });
          break;
        case "cambiar-estado-oferta":
          await p(`/ofertas/${accion.id}/estado`, {
            method: "PATCH",
            body: { estado: accion.estado },
          });
          break;
        case "eliminar-oferta":
          await p(`/ofertas/${accion.id}`, { method: "DELETE" });
          break;
        default:
          return;
      }
      await recargar();
    },
    [servicio, recargar],
  );

  const dispatch = useCallback(
    (accion) => {
      dispatchLocal(accion);
      if (!servicio) return undefined;
      return persistir(accion).catch(async (error) => {
        setErrorSync(error.message);
        try {
          await recargar();
        } catch {
          // Se conserva el mensaje de error original.
        }
      });
    },
    [servicio, persistir, recargar],
  );

  const postularPublico = useCallback(
    async ({ oferta, datos, archivo }) => {
      if (!servicio) {
        const folio = siguienteId(estado.solicitudes);
        dispatchLocal({
          type: "postular-oferta",
          ofertaId: oferta.id,
          solicitudId: folio,
          datos,
          curriculum: datos.curriculum,
        });
        return {
          folio,
          nombre: datos.nombre,
          correo: datos.correo,
          carpeta: `CV-LOCAL-${String(folio).padStart(6, "0")}`,
          oferta: { id: oferta.id, cargo: oferta.cargo },
        };
      }
      const resultado = await servicio.postularPublico({
        ofertaId: oferta.id,
        nombre: datos.nombre,
        correo: datos.correo,
        telefono: datos.telefono,
        consentimiento: datos.consentimiento,
        archivo,
      });
      try {
        const ofertas = await servicio.cargarOfertasPublicas();
        dispatchLocal({ type: "hidratar", datos: { ofertas } });
      } catch {
        // La postulación ya quedó registrada.
      }
      return resultado;
    },
    [servicio, estado.solicitudes],
  );

  const analizarIaSolicitud = useCallback(
    async (solicitudId) => {
      if (!servicio) {
        throw new Error(
          "El análisis con IA requiere el backend conectado (modo API).",
        );
      }
      const analisis = await servicio.analizarIa(solicitudId);
      dispatchLocal({ type: "guardar-analisis", solicitudId, analisis });
      setNotificacion("Análisis generado. Recuerda revisarlo antes de decidir.");
      return analisis;
    },
    [servicio],
  );

  const revisarIaSolicitud = useCallback(
    async (solicitudId) => {
      if (!servicio) {
        throw new Error("La revisión de IA requiere el backend conectado.");
      }
      const analisis = await servicio.revisarIa(solicitudId);
      dispatchLocal({ type: "guardar-analisis", solicitudId, analisis });
      setNotificacion("Análisis marcado como revisado por una persona.");
      return analisis;
    },
    [servicio],
  );

  const descargarCv = useCallback(
    async (postulacionId, nombreArchivo = "curriculum") => {
      if (!servicio) {
        throw new Error("La descarga del CV requiere el backend conectado.");
      }
      const blob = await servicio.descargarCv(postulacionId);
      const enlace = document.createElement("a");
      const url = URL.createObjectURL(blob);
      enlace.href = url;
      enlace.download = nombreArchivo;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
      return true;
    },
    [servicio],
  );

  const valor = useMemo(
    () => ({
      candidatos: estado.candidatos,
      solicitudes: estado.solicitudes,
      solicitudesVisibles,
      evaluaciones: estado.evaluaciones,
      bitacora: estado.bitacora,
      ofertas: estado.ofertas,
      postulaciones: estado.postulaciones,
      iaEstado: estado.iaEstado,
      perfil,
      perfilActivo,
      usuario,
      usaApi: Boolean(servicio),
      autenticado: servicio ? Boolean(usuario) : true,
      cargandoSesion,
      errorSync,
      notificacion,
      limpiarError: () => setErrorSync(""),
      limpiarNotificacion: () => setNotificacion(""),
      veTodasLasSolicitudes: veTodas,
      puede,
      dispatch,
      login,
      logout,
      postularPublico,
      analizarIa: analizarIaSolicitud,
      revisarIa: revisarIaSolicitud,
      descargarCv,
      recargar,
      obtenerCandidato: (id) =>
        estado.candidatos.find((candidato) => candidato.id === Number(id)),
      obtenerSolicitud: (id) =>
        estado.solicitudes.find((solicitud) => solicitud.id === Number(id)),
      obtenerOferta: (id) =>
        estado.ofertas.find((oferta) => oferta.id === Number(id)),
      postulacionesDeOferta: (ofertaId) =>
        estado.solicitudes.filter(
          (solicitud) => solicitud.ofertaId === Number(ofertaId),
        ),
      evaluacionDe: (solicitudId) =>
        estado.evaluaciones.find(
          (evaluacion) => evaluacion.solicitudId === Number(solicitudId),
        ),
      bitacoraDe: (solicitudId) =>
        estado.bitacora
          .filter((registro) => registro.solicitudId === Number(solicitudId))
          .sort((a, b) => a.fecha.localeCompare(b.fecha)),
    }),
    [
      estado,
      solicitudesVisibles,
      perfil,
      perfilActivo,
      usuario,
      servicio,
      cargandoSesion,
      errorSync,
      notificacion,
      veTodas,
      puede,
      dispatch,
      login,
      logout,
      postularPublico,
      analizarIaSolicitud,
      revisarIaSolicitud,
      descargarCv,
      recargar,
    ],
  );

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

function usoApi(servicio, usuario) {
  return Boolean(servicio && usuario);
}

export function useApp() {
  const contexto = useContext(AppContext);
  if (!contexto) {
    throw new Error("useApp debe usarse dentro de AppProvider");
  }
  return contexto;
}
