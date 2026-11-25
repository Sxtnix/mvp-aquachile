# Informe de pruebas — MVP de Reclutamiento y Evaluación Psicolaboral AquaChile

## 1. Alcance

Se probaron por separado **frontend** y **backend**, con umbral mínimo de
**85%** en statements, branches, functions y lines.

| Suite | Herramientas | Pruebas | Enfoque |
|---|---|---|---|
| Frontend | Vitest + Testing Library + jsdom | **195** | Componentes, páginas, rutas protegidas, cliente REST, contexto API/local, IA y CV |
| Backend | Vitest + Supertest + PGlite en memoria | **79** | Auth, roles, CRUD, postulaciones multipart, CV privado, IA, dashboard y errores |

## 2. Cómo ejecutar

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

La cobertura HTML se genera en `coverage/` de cada proyecto.

## 3. Resultado frontend

```
Test Files  25 passed (25)
     Tests  195 passed (195)
```

```
File               | % Stmts | % Branch | % Funcs | % Lines
-------------------|---------|----------|---------|--------
All files          |   94.22 |    86.81 |   93.72 |   96.14
 src/api           |   98.26 |    93.75 |     100 |     100
 src/components    |   95.74 |    90.21 |   90.47 |   97.72
 src/context       |   95.6 |    82.74 |     100 |   98.26
 src/pages         |    90.9 |    82.46 |    87.5 |   93.25
 src/utils         |   94.88 |    92.44 |     100 |   95.43

Statements   : 94.22% (1044/1108)
Branches     : 86.81% (994/1145)
Functions    : 93.72% (284/303)
Lines        : 96.14% (973/1012)
```

Cumple el mínimo de 85% en las cuatro métricas.

### Escenarios frontend relevantes

**Cliente API (`src/api/cliente.test.js`)**
- Login, logout y propagación de errores de credenciales.
- Renovación automática ante `401`, con reintento y rotación de token.
- Fallo de refresh, errores de red y traducción de códigos HTTP.
- Respuestas JSON y texto plano; lectura de `detalles` de validación.
- Carga completa de candidatos, ofertas, solicitudes, evaluaciones,
  bitácora, postulaciones y estado de IA.
- Tolerancia a fallos parciales.
- Postulación `multipart/form-data` con un `File` real.
- Descarga de CV como `blob`, análisis y revisión de IA.

**Contexto (`src/context/AppContext.test.jsx`)**
- Hidratación de sesión y datos desde el servicio API.
- Persistencia de todas las mutaciones con verbo y ruta correctos.
- Manejo de error de persistencia y recarga.
- Postulación pública, análisis IA, revisión y descarga de CV.
- Login, logout y recarga.
- Modo local: datos demo y rechazo explícito de funciones que requieren API.
- Perfil evaluador (filtrado de solicitudes) y rol desconocido (jefatura).

**Rutas y sesión**
- `RutaProtegida`: estado de carga, redirección a login y contenido autorizado.
- `LoginPage`: formulario, cuentas demo, login exitoso, error y redirección si
  ya hay sesión.
- `App` en modo API: sesión real, enlace a postulaciones, cierre de sesión y
  portal público.

**Páginas y componentes**
- Candidatos: listado, filtros, creación, edición, solo lectura, borrado y
  validaciones.
- Ofertas: filtros en una fila, búsqueda expandible, cierre, publicación,
  edición, borrador sin fecha de publicación y permisos.
- Portal público: ofertas vigentes, filtros, cierre próximo, vacío y limpieza.
- Postulación: validaciones, archivo real, folio, carpeta y oferta no
  disponible.
- Postulaciones: tabla, carpeta, descarga, error de descarga y modo local.
- Solicitudes: creación, permisos, fechas, evaluación, bitácora, cambio de
  estado y detalle con CV/IA.
- IA: análisis completo, generación, revisión humana, errores, IA no
  configurada, sin currículum y casos límite.
- Componentes: `BuscadorExpandible`, `BarraFiltros`, `BandejaSolicitudes`,
  `AnalisisIa`, `EtiquetaEstado`, `AvisoSimulacion`.

**Utilidades**
- Fechas ISO, diferencias, formato y fechas futuras.
- Selectores de indicadores, filtros y resumen del portal.
- Validaciones de candidato, solicitud, evaluación, oferta y postulación
  pública, incluido el nuevo campo **Departamento**.

## 4. Resultado backend

```
Test Files  9 passed (9)
     Tests  79 passed (79)
```

```
File               | % Stmts | % Branch | % Funcs | % Lines
-------------------|---------|----------|---------|--------
All files          |   98.41 |    87.26 |   96.99 |   98.94

Statements   : 98.41%
Branches     : 87.26%
Functions    : 96.99%
Lines        : 98.94%
```

Cumple el mínimo de 85% en las cuatro métricas.

### Escenarios backend relevantes

- **Autenticación:** login válido, credenciales incorrectas, formato inválido,
  cuenta deshabilitada, refresh con rotación, logout, `/me`, token inválido y
  usuario deshabilitado después del login.
- **Roles:** analista administra; evaluador solo sus solicitudes; jefatura
  consulta sin modificar; `403` cuando corresponde.
- **Candidatos:** listado, filtros, CRUD, duplicados, validación, 404 y 400.
- **Ofertas:** CRUD, filtros, publicación con fecha automática, cierre,
  borradores, postulaciones asociadas y bloqueo de borrado con postulaciones.
- **Solicitudes:** filtros por rol, detalle con evaluación/bitácora/análisis,
  CRUD, cambios de estado, bitácora, evaluación upsert, finalización y
  permisos.
- **Postulaciones públicas:** solo ofertas publicadas, postulación multipart,
  carpeta lógica, hash SHA-256, reutilización de candidato, duplicados,
  formatos y firmas inválidas, tamaño, oferta vencida y consulta por folio.
- **CV privado:** descarga autorizada, `Content-Disposition`, `no-store`,
  restricciones para jefatura y evaluador no asignado.
- **IA:** estado de configuración, generación con Groq mockeado, consulta,
  revisión humana, falta de key (`503`), solicitud sin CV (`422`) y permisos.
- **Dashboard:** métricas globales, filtrado del evaluador, jefatura y salud.
- **Infraestructura:** migración y seed idempotente, PGlite en memoria y en
  disco, transacciones commit/rollback, serializadores y OpenAPI.
- **Errores:** ruta inexistente, JSON malformado, CORS permitido/rechazado y
  límites de archivo.

## 5. Prueba de humo con servicios reales

Se levantó el backend con PGlite persistente y se verificó:

1. `GET /api/health` → `estado: ok`, `baseDatos: pglite`,
   `iaConfigurada: true`.
2. Login del analista → access token y usuario correcto.
3. `GET /api/dashboard` → métricas y solicitudes.
4. Postulación pública con un **PDF real** de 204.820 bytes:
   folio `AQ-2026-B8F186`, carpeta
   `CV-2026-000001-PRUEBA-SMOKE-CV`, solicitud creada.
5. `POST /api/solicitudes/34/analisis` con Groq real
   (`openai/gpt-oss-120b`): análisis estructurado con 4 requisitos y 6
   preguntas.
6. `PATCH .../analisis/revision` → revisión humana registrada.
7. `GET /api/postulaciones/1/cv` → `application/pdf`, 204.820 bytes,
   `Content-Disposition: attachment` y `Cache-Control: private, no-store`.
8. Limpieza del candidato de prueba.

La prueba confirma el flujo completo frontend-backend-base-IA-CV sin exponer la
API key en el repositorio.

## 6. Decisiones de prueba

- Los tests automatizados de IA **mockean `fetch`**, por lo que no consumen
  tokens ni dependen de internet.
- El backend usa PGlite en memoria por archivo de prueba, garantizando
  aislamiento y velocidad.
- El frontend prueba el modo API con un servicio falso inyectado y conserva
  pruebas del modo local para no perder la lógica del reducer.
- Se prueba el comportamiento visible para el usuario (roles, textos, estados,
  errores) en lugar de detalles de implementación.
- El umbral de cobertura quedó configurado en el backend; el frontend se
  verificó contra el mismo mínimo exigido.

## 7. Riesgos residuales

- PGlite no soporta múltiples procesos; para producción se recomienda
  PostgreSQL.
- La calidad del análisis de IA depende del texto extraíble del CV; documentos
  escaneados como imagen pueden producir resultados limitados.
- No se automatizó un navegador real (E2E con Playwright); se cubrió con
  Testing Library y pruebas de humo manuales.
- El envío de correos es simulado.
