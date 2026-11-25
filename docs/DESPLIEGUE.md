# Despliegue y justificación del entorno local

## Decisión

El MVP se despliega **localmente** en el computador que presenta la evaluación:
backend en `http://localhost:3001` y frontend en `http://localhost:5173`.
La decisión es deliberada y no una limitación técnica: el objetivo de la
entrega es demostrar el flujo completo, la persistencia, la seguridad y la
integración con IA sin depender de cuentas externas ni de un dominio público.

### Por qué local y no una nube pública

| Criterio | Despliegue local | Nube pública |
|---|---|---|
| Puesta en marcha | `npm run dev` en dos terminales | Cuenta, tarjeta, dominio, variables y esperas de build |
| Datos personales | Permanecen en el equipo | Requieren revisar región, cifrado y contratos de datos |
| Currículums privados | Archivos en la base local | Obliga a configurar almacenamiento y permisos en la nube |
| IA Groq | La key queda en `backend/.env` | La key debe cargarse como secreto del proveedor |
| Costo | $0 | Plan gratuito con suspensión o costo mensual |
| Reproducibilidad | Determinista para la defensa | Depende de red, cuotas y disponibilidad externa |
| Alcance académico | Demuestra integración real | Agrega complejidad operativa no evaluada |

El despliegue local cumple el requisito de **persistencia real** porque PGlite
guarda la base en `backend/data/aquachile`, sobrevive a recargas del navegador
y reinicios del backend, y mantiene los currículums en la tabla `archivos_cv`.

## Requisitos

- Node.js 20 o superior (probado con Node.js 22/26).
- npm.
- Navegador moderno.
- Conexión a internet **solo** para el análisis con Groq.
- No se requiere PostgreSQL, Docker ni servicios en la nube.

## Puesta en marcha

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edita .env y define GROQ_API_KEY (opcional para el resto del sistema)
npm run dev
```

Verifica:

```bash
curl http://localhost:3001/api/health
# {"estado":"ok","baseDatos":"pglite","iaConfigurada":true,...}
```

Swagger: `http://localhost:3001/api/docs`.

### 2. Frontend

En otra terminal:

```bash
cd vcm-psicolaboral
npm install
npm run dev
```

Abrir `http://localhost:5173`. El frontend apunta por defecto a
`http://localhost:3001/api`; se puede cambiar con `VITE_API_URL`.

### 3. Cuentas demo

| Rol | Correo | Contraseña |
|---|---|---|
| Analista | `analista@aquachile.cl` | `AquaChile2026!` |
| Evaluador | `evaluador@aquachile.cl` | `AquaChile2026!` |
| Jefatura | `jefatura@aquachile.cl` | `AquaChile2026!` |

## Datos y respaldo

- La base local vive en `backend/data/aquachile`. Para reiniciar los datos,
  detén el backend y elimina esa carpeta; al volver a iniciar se recrea el
  esquema y el seed demo.
- Los currículums se almacenan en `archivos_cv.contenido` (`BYTEA`) dentro de
  una carpeta lógica `CV-AÑO-NÚMERO-NOMBRE`. No hay URL pública.
- Para respaldar, copia la carpeta `backend/data/aquachile` con el backend
  detenido.

## Variables de entorno relevantes

```env
PORT=3001
PGLITE_DIR=./data/aquachile
JWT_SECRET=...
JWT_REFRESH_SECRET=...
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
GROQ_API_KEY=gsk_...
GROQ_MODEL=openai/gpt-oss-120b
```

`backend/.env` está excluido por `.gitignore`. La API key nunca debe
commitearse, mostrarse en capturas ni incluirse en el informe.

## Verificación de la entrega

```bash
# Backend
cd backend
npm test
npm run test:coverage

# Frontend
cd ../vcm-psicolaboral
npm test
npm run test:coverage
npm run lint
npm run build
```

Smoke test manual recomendado:

1. `GET /api/health` responde `ok` y `baseDatos: pglite`.
2. Login del analista y recarga de página: la sesión se recupera con la cookie
   de refresh.
3. Crear una oferta en borrador y publicarla.
4. Postular desde el portal público con un PDF real.
5. Ver la postulación en **Postulaciones**, descargar el CV y comprobar que la
   carpeta lógica aparece en la tabla.
6. Generar el análisis con IA y marcar la revisión humana.
7. Cerrar sesión y comprobar que el acceso interno vuelve al login.

## Alternativa en contenedor o nube

Aunque no es el despliegue elegido, se incluyen archivos listos:

- `Dockerfile` (contexto raíz, backend en el puerto 3001).
- `.dockerignore`.
- `render.yaml` con health check y variables de entorno.
- `backend/.env.example`.

```bash
docker build -t aquachile-api .
docker run --rm -p 3001:3001 --env-file backend/.env aquachile-api
```

Para Render es imprescindible definir `DATABASE_URL` con un PostgreSQL externo
(Neon, Supabase o Render PostgreSQL). Sin ella, PGlite usaría un disco efímero
y los datos se perderían en cada redeploy. Además hay que configurar
`CORS_ORIGIN` con el dominio del frontend, `COOKIE_SECURE=true` y cargar
`GROQ_API_KEY` como secreto.

## Limitaciones conocidas

- PGlite es mono-proceso; no está pensado para múltiples instancias.
- El envío de correos de confirmación es simulado en la interfaz.
- El análisis de IA requiere conexión y cuota de Groq; si falla, el flujo
  manual de evaluación sigue operativo.
- El frontend de producción (`dist/`) debe servirse con un servidor estático o
  integrarse al backend; para la entrega se usa Vite en desarrollo.
