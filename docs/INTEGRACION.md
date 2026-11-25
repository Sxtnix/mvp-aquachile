# Documento de integración — Frontend, Backend, Base de Datos e IA

## 1. Arquitectura general

```
┌──────────────────────────────┐        HTTP/JSON + multipart        ┌──────────────────────────────┐
│ Frontend React 19 + Vite     │ ──────────────────────────────────▶ │ Backend Node.js + Express 5  │
│ http://localhost:5173        │ ◀────────────────────────────────── │ http://localhost:3001/api    │
│                              │        JWT + cookie HttpOnly        │                              │
│ AppContext (useReducer)      │                                     │ Rutas, validación Zod, roles │
│ cliente.js (fetch)           │                                     │ Servicios CV / IA / tokens  │
└──────────────────────────────┘                                     └──────────────┬───────────────┘
                                                                                    │
                                                                     ┌──────────────▼───────────────┐
                                                                     │ PGlite local (persistente)   │
                                                                     │ backend/data/aquachile       │
                                                                     │ o PostgreSQL vía DATABASE_URL│
                                                                     └──────────────┬───────────────┘
                                                                                    │ HTTPS
                                                                     ┌──────────────▼───────────────┐
                                                                     │ Groq API (apoyo, no decide)  │
                                                                     │ openai/gpt-oss-120b          │
                                                                     └──────────────────────────────┘
```

- **Frontend:** React 19, React Router 7, Bootstrap 5, Context API y
  `useReducer`. El estado local sigue funcionando sin backend para pruebas y
  demostraciones, pero en `main.jsx` se inyecta `servicioApi`.
- **Backend:** Node.js + Express 5, Zod para validar, JWT para sesión, PGlite
  o PostgreSQL como base, Groq para el análisis de currículum.
- **Comunicación:** REST en `/api`. El frontend usa `fetch` con
  `credentials: "include"` para enviar la cookie de refresh.

## 2. Flujo de sesión y seguridad

1. `POST /api/auth/login` valida correo y contraseña con bcrypt.
2. El backend devuelve un **access token JWT** (15 minutos) y crea un
   **refresh token aleatorio** de 7 días.
3. El refresh token se guarda **hasheado (SHA-256)** en `refresh_tokens` y se
   envía en una cookie `HttpOnly`, `SameSite=Lax`, con `path=/api/auth`.
4. En cada petición protegida el frontend envía
   `Authorization: Bearer <accessToken>`.
5. Si la API responde `401`, el cliente ejecuta **una sola vez**
   `POST /api/auth/refresh`. Si funciona, reintenta la petición original; si
   no, limpia el token y la interfaz redirige a `/login`.
6. `POST /api/auth/logout` revoca el refresh y borra la cookie.
7. Al recargar la página, el frontend intenta `refresh`; si la cookie sigue
   vigente recupera usuario y datos sin volver a pedir contraseña.
8. Los roles se aplican en el backend (`ANALISTA`, `EVALUADOR`, `JEFATURA`) y
   se reflejan en el frontend con `PERMISOS` y `puede(accion)`.

El evaluador solo puede listar y abrir solicitudes cuyo `responsable` coincide
con su nombre. La jefatura consulta pero no modifica. El analista administra
candidatos, ofertas y solicitudes; el evaluador registra evaluaciones.

## 3. Contrato del cliente API

`vcm-psicolaboral/src/api/cliente.js` centraliza:

- `iniciarSesion`, `cerrarSesion`, `refrescarSesion`.
- `peticion(ruta, opciones)` con método, cuerpo JSON o `FormData`, token y
  reintento automático tras refresh.
- `cargarTodo()` para candidatos, ofertas, solicitudes, evaluaciones,
  bitácora, postulaciones y estado de IA.
- `cargarOfertasPublicas`, `obtenerOfertaPublica`, `postularPublico`.
- `descargarCv`, `analizarIa`, `revisarIa`.

La API envuelve las respuestas como `{ datos, total }` o `{ datos }`. El
cliente **desenvuelve** ese campo una sola vez (`desenvolver`) para que las
pantallas reciban arreglos u objetos directos y no repitan `body.datos`.

### Modo API y modo local

`AppProvider` recibe `servicio`. Si existe:

- hidrata la sesión al montar;
- persiste cada mutación con el verbo REST correspondiente;
- recarga los datos después de escribir;
- expone `usaApi = true`.

Si no existe (pruebas de componentes o demo sin red), conserva el reducer
local y los datos ficticios. Así los tests de interfaz no dependen de un
servidor y la aplicación puede mostrarse aun sin backend.

Las mutaciones son **optimistas**: primero se actualiza el estado y luego se
envía la petición. Si la API falla, se registra `errorSync` y se recarga el
estado real para no dejar datos inconsistentes.

## 4. Rutas del frontend

| Ruta | Acceso | Contenido |
|---|---|---|
| `/login` | Público | Acceso del equipo interno |
| `/postular` | Público | Portal de ofertas publicadas |
| `/postular/:ofertaId` | Público | Formulario de postulación con CV |
| `/` | Protegido | Dashboard |
| `/candidatos` | Protegido | Listado y filtros |
| `/candidatos/nuevo` | Analista | Alta de candidato |
| `/candidatos/:id` | Protegido | Edición o solo lectura |
| `/solicitudes` | Protegido | Bandeja según rol |
| `/solicitudes/nueva` | Analista | Nueva solicitud |
| `/solicitudes/:id` | Protegido | Detalle, evaluación, IA, CV |
| `/ofertas` | Protegido | Gestión de ofertas |
| `/ofertas/nueva`, `/ofertas/:id` | Analista | Alta/edición |
| `/postulaciones` | Analista/Evaluador | Carpetas CV y descarga privada |

`RutaProtegida` muestra un estado de carga mientras se recupera la sesión y
redirige a `/login` si no hay usuario.

## 5. API REST

La especificación completa está en `backend/src/docs/openapi.yaml` y Swagger UI
en `/api/docs`. Resumen:

### Público
- `GET /api/health`
- `GET /api/publico/ofertas` (`q`, `familia`, `modalidad`, `departamento`)
- `GET /api/publico/ofertas/:id`
- `POST /api/publico/postulaciones` (`multipart/form-data`)
- `GET /api/publico/postulaciones/:folio?correo=...`

### Autenticación
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Interno
- `GET/POST /api/candidatos`, `GET/PUT/DELETE /api/candidatos/:id`
- `GET/POST /api/ofertas`, `GET/PUT/DELETE /api/ofertas/:id`
- `PATCH /api/ofertas/:id/estado`
- `GET /api/ofertas/:id/postulaciones`
- `GET/POST /api/solicitudes`, `GET/PUT/DELETE /api/solicitudes/:id`
- `PATCH /api/solicitudes/:id/estado`
- `GET /api/solicitudes/:id/bitacora`
- `GET/PUT /api/solicitudes/:id/evaluacion`
- `GET/POST /api/solicitudes/:id/analisis`
- `PATCH /api/solicitudes/:id/analisis/revision`
- `GET /api/postulaciones`, `GET /api/postulaciones/:id`
- `GET /api/postulaciones/:id/cv`
- `GET /api/dashboard`
- `GET /api/ia/estado`

Errores: `400` datos inválidos, `401` sin sesión, `403` sin permisos, `404`
no encontrado, `409` conflicto (duplicado u oferta con postulaciones), `413`
archivo demasiado grande, `422` archivo/formato no analizable, `429` rate
limit, `500` error interno, `502/503` fallo o ausencia de IA.

## 6. Modelo de datos

| Tabla | Propósito |
|---|---|
| `usuarios` | Cuentas internas, hash de contraseña y rol |
| `refresh_tokens` | Refresh hasheado, expiración y revocación |
| `candidatos` | Datos de postulantes, departamento, canal y fecha |
| `ofertas` | Cargo, departamento, modalidad, funciones, requisitos, beneficios, sueldo, vacantes, fechas y estado |
| `carpetas_cv` | Carpeta lógica identificable por postulante |
| `archivos_cv` | Archivo real en `BYTEA`, MIME, tamaño, SHA-256 |
| `postulaciones` | Folio, oferta, candidato, carpeta, fecha y estado |
| `solicitudes` | Solicitud de evaluación, prioridad, responsable y estados |
| `evaluaciones` | Resultado, categoría, observaciones y evaluador |
| `bitacora` | Trazabilidad de cada cambio de estado |
| `analisis_ia` | Resultado estructurado de Groq y revisión humana |

Estados de oferta: **Borrador → Publicada → Cerrada**.
Estados de solicitud: **Pendiente → En proceso → Finalizada**.

## 7. Currículum real y privacidad

1. El portal envía `multipart/form-data` con `curriculum`, datos personales,
   oferta y consentimiento.
2. El backend valida tamaño (5 MB), extensión y **firma real** del archivo
   (`%PDF-`, ZIP de DOCX o firma OLE de DOC), y calcula SHA-256.
3. En una transacción crea candidato (o reutiliza por correo), carpeta
   `CV-AÑO-000000-NOMBRE`, archivo en `archivos_cv`, postulación con folio,
   solicitud pendiente y bitácora inicial.
4. La descarga `GET /api/postulaciones/:id/cv` exige JWT y rol autorizado.
   Responde con `Content-Disposition: attachment` y
   `Cache-Control: private, no-store`.
5. No existe una URL pública ni un directorio estático con los CV. El archivo
   nunca se escribe con un nombre controlado por el usuario.

## 8. Integración con Groq

- `GROQ_API_KEY` y `GROQ_MODEL` viven solo en `backend/.env`.
- `src/services/ia.js` extrae texto con `pdf-parse` (PDF) o `mammoth` (DOCX).
- El prompt incluye oferta, requisitos, candidato y currículum, y exige un
  JSON con puntaje, formación, experiencia, habilidades, cumplimiento de
  requisitos, preguntas, datos faltantes y limitaciones.
- La respuesta se normaliza (rangos, listas, estados permitidos) antes de
  guardarse en `analisis_ia`.
- La API responde con un aviso explícito: el análisis es **apoyo** y requiere
  revisión humana.
- `PATCH .../analisis/revision` registra `revisado_por` y `revisado_en`; la
  interfaz muestra “Pendiente de revisión humana” hasta ese momento.
- Si no hay key, el endpoint responde `503` y el botón de la interfaz queda
  deshabilitado con instrucciones.

## 9. Ajustes de experiencia solicitados

| Ajuste del TXT | Implementación |
|---|---|
| Eliminar espacios vacíos | Barras compactas, aviso de contexto de una línea, tarjetas con contenido útil y estados vacíos informativos |
| Menús y filtros más unidos y asimétricos | Componente `BarraFiltros` con campos alineados y resumen a la derecha |
| Buscadores que se expanden al enfocar | `BuscadorExpandible` con transición de ancho en `:focus-within` |
| Filtros en una sola fila | `barra-filtros-campos` con `flex-wrap` y anchos flexibles; en móvil se apilan |
| “Unidad contratante” → “Departamento” | Etiquetas en candidato, oferta, portal y mensajes de validación; el backend expone `departamento` y mantiene `unidad` como alias |
| Logo AquaChile en botón hamburguesa | `Layout` incluye el logo dentro de `navbar-toggler` y en la marca; `PortalLayout` también usa el logo |
| Rellenar zonas vacías | Panel de IA, detalle de oferta con funciones/beneficios/sueldo, tabla de postulaciones con carpeta y CV, resumen y ayudas contextuales |

## 10. Configuración y operación

- CORS restringido por `CORS_ORIGIN` y `credentials: true`.
- `helmet` para cabeceras, `express.json` con límite de 12 MB.
- Rate limit en login (20/15 min) y postulaciones públicas (30/hora).
- PGlite se crea y migra al iniciar; el seed es idempotente.
- Con `DATABASE_URL` se usa PostgreSQL y el mismo esquema.
- Logs de arranque indican puerto, motor de base y estado de Groq.
