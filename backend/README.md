# AquaChile — Backend de Reclutamiento y Evaluación Psicolaboral

API REST en **Node.js + Express 5** para el MVP de AquaChile. Persiste en
**PGlite** (PostgreSQL embebido en un directorio local) y puede usar
**PostgreSQL** en la nube definiendo `DATABASE_URL`. Incluye autenticación
**JWT con refresh token**, roles, postulaciones con currículum privado,
evaluaciones, bitácora y análisis de CV con **Groq** como apoyo.

## Requisitos

- Node.js 20 o superior.
- No requiere instalar PostgreSQL: PGlite crea la base en `backend/data/aquachile`.

## Instalación

```bash
cd backend
npm install
cp .env.example .env
# Edita .env y agrega tu GROQ_API_KEY
npm run dev
```

La API queda en `http://localhost:3001` y la documentación Swagger en
`http://localhost:3001/api/docs`.

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto HTTP | `3001` |
| `PGLITE_DIR` | Directorio de la base local | `./data/aquachile` |
| `DATABASE_URL` | PostgreSQL externo (opcional) | vacío |
| `JWT_SECRET` | Secreto del access token | valor de desarrollo |
| `JWT_REFRESH_SECRET` | Secreto del refresh token | valor de desarrollo |
| `ACCESS_TOKEN_TTL` | Vigencia del access token | `15m` |
| `REFRESH_TOKEN_DAYS` | Días de sesión | `7` |
| `CORS_ORIGIN` | Orígenes permitidos, separados por coma | `http://localhost:5173,...` |
| `GROQ_API_KEY` | API key de Groq | vacío (IA deshabilitada) |
| `GROQ_MODEL` | Modelo de Groq | `openai/gpt-oss-120b` |
| `MAX_CV_BYTES` | Tamaño máximo del CV | `5242880` |
| `RATE_LIMIT_DISABLED` | Desactiva límites (solo pruebas) | `false` |

> `backend/.env` no se versiona. Nunca subas la API key al repositorio.

## Scripts

```bash
npm run dev             # Servidor con recarga automática
npm start               # Servidor de producción
npm test                # Pruebas (PGlite en memoria)
npm run test:coverage   # Cobertura con umbral mínimo de 85%
```

## Base de datos

El esquema se crea automáticamente al iniciar (`src/db/schema.sql`) y se
siembran datos demo idempotentes (`src/db/seed.js`). Para borrar los datos
locales, detén el servidor y elimina `backend/data/aquachile`.

Con PostgreSQL externo basta definir `DATABASE_URL`; el arranque crea las
tablas y los datos demo si la base está vacía.

## Usuarios demo

| Rol | Correo | Contraseña |
|---|---|---|
| ANALISTA | `analista@aquachile.cl` | `AquaChile2026!` |
| EVALUADOR | `evaluador@aquachile.cl` | `AquaChile2026!` |
| JEFATURA | `jefatura@aquachile.cl` | `AquaChile2026!` |

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Estado del servicio |
| `POST` | `/api/auth/login` | Login; devuelve access token y cookie de refresh |
| `POST` | `/api/auth/refresh` | Renueva el access token |
| `POST` | `/api/auth/logout` | Revoca el refresh token |
| `GET` | `/api/auth/me` | Usuario autenticado |
| `GET` | `/api/publico/ofertas` | Ofertas publicadas y vigentes |
| `GET` | `/api/publico/ofertas/:id` | Detalle público |
| `POST` | `/api/publico/postulaciones` | Postulación multipart con CV |
| `GET` | `/api/publico/postulaciones/:folio` | Consulta por folio y correo |
| `GET/POST` | `/api/candidatos` | Listado y alta de candidatos |
| `GET/POST` | `/api/ofertas` | Ofertas, incluidos borradores |
| `PATCH` | `/api/ofertas/:id/estado` | Borrador, Publicada o Cerrada |
| `GET/POST` | `/api/solicitudes` | Bandeja y solicitudes de evaluación |
| `PUT` | `/api/solicitudes/:id/evaluacion` | Evaluación psicolaboral |
| `GET` | `/api/solicitudes/:id/bitacora` | Historial de estados |
| `POST` | `/api/solicitudes/:id/analisis` | Análisis de CV con Groq |
| `PATCH` | `/api/solicitudes/:id/analisis/revision` | Revisión humana obligatoria |
| `GET` | `/api/postulaciones` | Postulaciones y carpetas CV |
| `GET` | `/api/postulaciones/:id/cv` | Descarga privada del currículum |
| `GET` | `/api/dashboard` | Métricas del proceso |
| `GET` | `/api/ia/estado` | Estado de la integración Groq |

La especificación completa está en [`src/docs/openapi.yaml`](src/docs/openapi.yaml)
y se publica en Swagger UI.

## Seguridad y datos personales

- Access token JWT de corta duración y refresh token rotativo en cookie
  `HttpOnly` (`SameSite=Lax`).
- Roles `ANALISTA`, `EVALUADOR` y `JEFATURA`; el evaluador solo ve sus
  solicitudes y los CV de candidatos asignados.
- Los currículums se guardan en `BYTEA` dentro de una carpeta lógica
  (`CV-AÑO-NÚMERO-NOMBRE`) y solo se descargan con autenticación.
- Validación de firma real del archivo (PDF/DOC/DOCX), hash SHA-256 y límite
  de 5 MB.
- `helmet`, CORS restringido, rate limit en login y postulaciones públicas.
- El análisis de IA queda marcado como pendiente hasta que una persona
  registra la revisión.

## IA con Groq

El análisis extrae texto del CV (PDF o DOCX), lo envía a Groq con un prompt
estructurado y guarda puntaje, requisitos, preguntas sugeridas, faltantes y
limitaciones. **No toma decisiones de contratación**. Si `GROQ_API_KEY` no
está configurada, la API responde `503` y la interfaz deshabilita el botón.

## Pruebas

La suite usa PGlite en memoria y mockea Groq, por lo que no consume tokens ni
modifica la base local. Al cierre de esta entrega:

- **79 pruebas backend**.
- Cobertura: **98.41% statements, 87.26% branches, 96.99% functions, 98.94% lines**.

## Despliegue

Consulta [`../docs/DESPLIEGUE.md`](../docs/DESPLIEGUE.md). El despliegue
elegido es local; también se incluyen `Dockerfile` y `render.yaml` como
alternativa documentada.
