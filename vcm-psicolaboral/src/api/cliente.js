const BASE =
  import.meta.env?.VITE_API_URL || "http://localhost:3001/api";

let accessToken = null;
let refrescando = null;

function url(ruta) {
  return `${BASE.replace(/\/$/, "")}${ruta}`;
}

function mensajeDeError(datos, status) {
  if (datos?.error) return datos.error;
  if (status === 401) return "Tu sesión expiró. Inicia sesión nuevamente.";
  if (status === 403) return "No tienes permisos para esta acción.";
  if (status === 404) return "El recurso solicitado no existe.";
  if (status >= 500) return "Ocurrió un error en el servidor.";
  return "No fue posible completar la solicitud.";
}

async function interpretar(respuesta) {
  const tipo = respuesta.headers.get("content-type") || "";
  if (tipo.includes("application/json")) return respuesta.json();
  return respuesta.text();
}

/**
 * La API responde con `{ datos, total }` o `{ datos }`. El cliente entrega
 * siempre el contenido útil para que las pantallas no repitan `body.datos`.
 */
function desenvolver(cuerpo) {
  if (
    cuerpo &&
    typeof cuerpo === "object" &&
    !Array.isArray(cuerpo) &&
    Object.prototype.hasOwnProperty.call(cuerpo, "datos")
  ) {
    return cuerpo.datos;
  }
  return cuerpo;
}

export async function peticion(ruta, opciones = {}) {
  const {
    method = "GET",
    body,
    auth = true,
    reintentar = true,
    signal,
    binario = false,
  } = opciones;

  const cabeceras = {};
  let contenido = body;
  if (body !== undefined && !(body instanceof FormData)) {
    cabeceras["Content-Type"] = "application/json";
    contenido = JSON.stringify(body);
  }
  if (auth && accessToken) {
    cabeceras.Authorization = `Bearer ${accessToken}`;
  }

  const respuesta = await fetch(url(ruta), {
    method,
    headers: cabeceras,
    body: contenido,
    credentials: "include",
    signal,
  });

  if (respuesta.status === 401 && auth && reintentar) {
    const sesion = await refrescarSesion();
    if (sesion) {
      return peticion(ruta, { ...opciones, reintentar: false });
    }
  }

  if (!respuesta.ok) {
    const datos = desenvolver(await interpretar(respuesta));
    const error = new Error(mensajeDeError(datos, respuesta.status));
    error.status = respuesta.status;
    error.detalles = datos?.detalles;
    throw error;
  }

  if (binario) {
    return { datos: await respuesta.blob(), respuesta };
  }

  return { datos: desenvolver(await interpretar(respuesta)), respuesta };
}

export async function refrescarSesion() {
  if (refrescando) return refrescando;
  refrescando = (async () => {
    try {
      const respuesta = await fetch(url("/auth/refresh"), {
        method: "POST",
        credentials: "include",
      });
      if (!respuesta.ok) {
        accessToken = null;
        return null;
      }
      const datos = await respuesta.json();
      accessToken = datos.accessToken;
      return datos.usuario;
    } catch {
      accessToken = null;
      return null;
    } finally {
      refrescando = null;
    }
  })();
  return refrescando;
}

export async function iniciarSesion(email, password) {
  const respuesta = await fetch(url("/auth/login"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const datos = await interpretar(respuesta);
  if (!respuesta.ok) {
    throw new Error(mensajeDeError(datos, respuesta.status));
  }
  accessToken = datos.accessToken;
  return datos.usuario;
}

export async function cerrarSesion() {
  try {
    await fetch(url("/auth/logout"), {
      method: "POST",
      credentials: "include",
    });
  } finally {
    accessToken = null;
  }
}

export function hayToken() {
  return Boolean(accessToken);
}

export async function cargarTodo() {
  const { datos: candidatos } = await peticion("/candidatos");
  const { datos: ofertas } = await peticion("/ofertas");
  const { datos: listaSolicitudes } = await peticion("/solicitudes");

  const detalles = await Promise.all(
    listaSolicitudes.map(async (solicitud) => {
      try {
        const { datos } = await peticion(`/solicitudes/${solicitud.id}`);
        return datos;
      } catch {
        return solicitud;
      }
    }),
  );

  const solicitudes = detalles.map((detalle) => ({
    ...detalle,
    evaluacion: detalle.evaluacion || null,
    bitacora: detalle.bitacora || [],
    analisis: detalle.analisis || null,
    postulacion: detalle.postulacion || null,
  }));

  const evaluaciones = solicitudes
    .filter((solicitud) => solicitud.evaluacion)
    .map((solicitud) => ({
      ...solicitud.evaluacion,
      solicitudId: solicitud.id,
    }));

  const bitacora = solicitudes.flatMap((solicitud) =>
    (solicitud.bitacora || []).map((registro) => ({
      ...registro,
      solicitudId: solicitud.id,
    })),
  );

  let postulaciones = [];
  try {
    const respuesta = await peticion("/postulaciones");
    postulaciones = respuesta.datos;
  } catch {
    // Sin permisos o sin postulaciones: se mantiene la lista vacía.
  }

  let iaEstado = null;
  try {
    const { datos } = await peticion("/ia/estado");
    iaEstado = datos;
  } catch {
    // La IA puede no estar disponible; la interfaz lo informa.
  }

  return { candidatos, ofertas, solicitudes, evaluaciones, bitacora, postulaciones, iaEstado };
}

export async function cargarOfertasPublicas() {
  const { datos } = await peticion("/publico/ofertas", { auth: false });
  return datos.map((oferta) => ({ ...oferta, estado: oferta.estado || "Publicada" }));
}

export async function obtenerOfertaPublica(id) {
  const { datos } = await peticion(`/publico/ofertas/${id}`, { auth: false });
  return datos;
}

export async function postularPublico({ ofertaId, nombre, correo, telefono, consentimiento, archivo }) {
  const formulario = new FormData();
  formulario.append("ofertaId", String(ofertaId));
  formulario.append("nombre", nombre);
  formulario.append("correo", correo);
  formulario.append("telefono", telefono);
  formulario.append("consentimiento", String(consentimiento));
  formulario.append("curriculum", archivo);
  const { datos } = await peticion("/publico/postulaciones", {
    method: "POST",
    auth: false,
    body: formulario,
  });
  return datos;
}

export async function descargarCv(postulacionId) {
  const { datos } = await peticion(`/postulaciones/${postulacionId}/cv`, {
    binario: true,
  });
  return datos;
}

export async function analizarIa(solicitudId) {
  const { datos } = await peticion(`/solicitudes/${solicitudId}/analisis`, {
    method: "POST",
  });
  return datos;
}

export async function revisarIa(solicitudId) {
  const { datos } = await peticion(
    `/solicitudes/${solicitudId}/analisis/revision`,
    { method: "PATCH", body: {} },
  );
  return datos;
}

export const servicioApi = {
  modo: "api",
  iniciarSesion,
  cerrarSesion,
  refrescarSesion,
  cargarTodo,
  cargarOfertasPublicas,
  obtenerOfertaPublica,
  postularPublico,
  descargarCv,
  analizarIa,
  revisarIa,
  peticion,
};

export default servicioApi;
