# MVP de Reclutamiento y Evaluación Psicolaboral — AquaChile

Proyecto de Vinculación con el Medio de **Desarrollo Full Stack II (DSY1104)**.
Aplicación web full stack que centraliza candidatos, ofertas, postulaciones,
currículums, solicitudes y evaluaciones psicolaborales de AquaChile, con
autenticación por roles y análisis de IA como apoyo.

> **Etapa actual:** MVP full stack terminado y desplegado localmente.
> Frontend React + Backend Node/Express + PGlite persistente + Groq.
> La sesión, los datos y los currículums sobreviven a recargas y reinicios.

---

## Contexto y problema

AquaChile es una empresa salmonera del sur de Chile. Su área de Reclutamiento y
Selección coordinaba el proceso con planillas, Planner, correos y chats, sin un
punto único de verdad. Eso generaba pérdida de visibilidad, seguimiento manual y
riesgo sobre datos personales y currículums.

## Solución

Un MVP que centraliza:

1. Registro y consulta de candidatos con departamento, familia y origen.
2. Ofertas laborales completas: modalidad, funciones, requisitos, beneficios,
   sueldo, vacantes y estados **Borrador / Publicada / Cerrada**.
3. Portal público de postulaciones con currículum real y folio de confirmación.
4. Carpetas de CV identificadas y descarga privada autorizada por rol.
5. Solicitudes de evaluación con estado **Pendiente / En proceso / Finalizada**
   y bitácora de trazabilidad.
6. Evaluaciones psicolaborales con resultado, categoría y observaciones.
7. Dashboard con indicadores del proceso.
8. Análisis de currículum con **Groq**, explicable y con **revisión humana
   obligatoria**.
9. API REST documentada con Swagger y pruebas automatizadas.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite 8, React Router 7, Bootstrap 5 |
| Estado | Context API + `useReducer` |
| Backend | Node.js, Express 5 |
| Base de datos | PGlite persistente (local) o PostgreSQL (`DATABASE_URL`) |
| Autenticación | JWT de acceso + refresh rotativo en cookie HttpOnly |
| IA | Groq `openai/gpt-oss-120b` |
| Pruebas | Vitest, Testing Library, Supertest |
| Documentación API | OpenAPI 3 + Swagger UI |
| Despliegue elegido | Local; Docker/Render como alternativa documentada |

## Inicio rápido

Requisitos: Node.js 20+ y npm. No hace falta instalar PostgreSQL.

### Backend

```bash
cd backend
npm install
cp .env.example .env          # define GROQ_API_KEY si usarás la IA
npm run dev                   # http://localhost:3001
```

Comprobar: `curl http://localhost:3001/api/health`.
Swagger: `http://localhost:3001/api/docs`.

### Frontend

```bash
cd vcm-psicolaboral
npm install
npm run dev                   # http://localhost:5173
```

### Cuentas demo

| Rol | Correo | Contraseña |
|---|---|---|
| Analista | `analista@aquachile.cl` | `AquaChile2026!` |
| Evaluador | `evaluador@aquachile.cl` | `AquaChile2026!` |
| Jefatura | `jefatura@aquachile.cl` | `AquaChile2026!` |

## Recorrido recomendado

1. Entra a `/login` con el analista.
2. Revisa el dashboard y crea o edita una oferta.
3. Abre `/postular` en otra pestaña y postula con un PDF real.
4. En **Postulaciones**, descarga el CV y revisa la carpeta asignada.
5. Abre la solicitud creada, genera el análisis de IA y marca la revisión
   humana.
6. Cambia a la cuenta evaluadora para registrar la evaluación.
7. Cierra sesión y comprueba que el portal público sigue disponible.

## Roles y permisos

| Perfil | Candidatos | Solicitudes | Evaluación | Estado | Ofertas | CV |
|---|---|---|---|---|---|---|
| Analista | Crear/editar/eliminar | Crear | Consulta | Consulta | Crear/editar/cerrar | Descargar |
| Evaluador | Consulta | Solo asignadas | Editar | Cambiar | Consulta | Descargar asignados |
| Jefatura | Consulta | Consulta | Consulta | Consulta | Consulta | No |

## API y seguridad

- `/api/auth` con login, refresh, logout y `/me`.
- `/api/publico` para ofertas y postulaciones con CV.
- `/api/candidatos`, `/api/ofertas`, `/api/solicitudes`,
  `/api/postulaciones`, `/api/dashboard`, `/api/ia`.
- Validación con Zod, roles en middleware, `helmet`, CORS restringido y rate
  limit en login/postulaciones.
- CV guardados como `BYTEA` con hash SHA-256, validación de firma real y
  descarga autenticada sin URL pública.
- La API key de Groq vive solo en `backend/.env` (ignorado por Git).

La especificación completa está en
[`backend/src/docs/openapi.yaml`](backend/src/docs/openapi.yaml).

## Ajustes de experiencia implementados

- Menos espacios vacíos y tarjetas con información útil.
- Filtros unidos en una sola fila con `BarraFiltros`.
- Buscadores que se expanden al enfocar (`BuscadorExpandible`).
- Renombre de “Unidad contratante” a **Departamento** en formularios y
  validaciones.
- Logo AquaChile en la marca y en el botón hamburguesa.
- Zonas vacías completadas con panel de IA, detalle de oferta, tabla de
  postulaciones y estados vacíos informativos.

## Pruebas y calidad

```bash
# Frontend
cd vcm-psicolaboral
npm test
npm run test:coverage
npm run lint
npm run build

# Backend
cd ../backend
npm test
npm run test:coverage
```

Resultados al cierre:

| Suite | Pruebas | Statements | Branches | Functions | Lines |
|---|---|---|---|---|---|
| Frontend | 195 | 94.22% | 86.81% | 93.72% | 96.14% |
| Backend | 79 | 98.41% | 87.26% | 96.99% | 98.94% |

Ambas suites superan el mínimo de **85%** en todas las métricas. El detalle está
en [`docs/PRUEBAS.md`](docs/PRUEBAS.md).

## Estructura del repositorio

```
mvp-aquachile-main/
├── backend/
│   ├── src/
│   │   ├── routes/          # auth, público, candidatos, ofertas, solicitudes...
│   │   ├── services/        # CV, IA Groq, tokens
│   │   ├── middleware/      # auth, validación, errores
│   │   ├── db/              # esquema, seed, PGlite/PostgreSQL
│   │   └── docs/openapi.yaml
│   ├── tests/               # 79 pruebas con PGlite en memoria
│   ├── .env.example
│   └── README.md
├── vcm-psicolaboral/
│   ├── src/
│   │   ├── api/cliente.js   # cliente REST con refresh automático
│   │   ├── components/      # BarraFiltros, BuscadorExpandible, AnalisisIa...
│   │   ├── context/         # AppContext + motorEstado
│   │   ├── pages/           # dashboard, candidatos, ofertas, postulaciones...
│   │   └── assets/          # logo AquaChile
│   └── ...
├── docs/
│   ├── MANUAL_USUARIO.md
│   ├── INTEGRACION.md
│   ├── PRUEBAS.md
│   ├── DESPLIEGUE.md
│   ├── ERS.md
│   └── RETROALIMENTACION.md
├── Dockerfile
├── render.yaml
└── readme.md
```

## Documentación

- [Manual de usuario](docs/MANUAL_USUARIO.md)
- [Documento de integración](docs/INTEGRACION.md)
- [Informe de pruebas](docs/PRUEBAS.md)
- [Despliegue y justificación local](docs/DESPLIEGUE.md)
- [Especificación de requisitos](docs/ERS.md)
- [Trazabilidad de retroalimentación](docs/RETROALIMENTACION.md)
- [Backend](backend/README.md)

## Despliegue

El despliegue oficial es **local** para evitar cuentas, costos y exposición de
datos personales durante la evaluación. La justificación completa está en
[`docs/DESPLIEGUE.md`](docs/DESPLIEGUE.md).

Como alternativa se incluyen `Dockerfile`, `.dockerignore` y `render.yaml`. Para
persistir en la nube se debe definir `DATABASE_URL` con un PostgreSQL externo;
sin ella, PGlite usaría un disco efímero.

## Privacidad

Los datos del repositorio son ficticios. No se deben subir currículums reales,
contraseñas ni claves de API. `backend/.env` y `backend/data/` están excluidos
del control de versiones.
