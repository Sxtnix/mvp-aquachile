# ERS — Especificación de Requerimientos
## MVP Evaluación Psicolaboral — AquaChile

Documento de requisitos actualizado a la **entrega final (EA3)**. Describe el MVP full stack implementado: frontend React, API REST en Node/Express, base PGlite/PostgreSQL, autenticación JWT por roles, currículums privados, IA Groq como apoyo y despliegue local.

---

## 1. Alcance funcional implementado

Las 13 operaciones mínimas del anexo de requerimiento y su estado en esta entrega:

| # | Operación requerida | Estado | Ubicación |
|---|---------------------|--------|-----------|
| 1 | Registrar un candidato | ✅ Implementado | `pages/CandidatoFormPage.jsx` (modo nuevo) |
| 2 | Editar y consultar los datos de un candidato | ✅ Implementado | `pages/CandidatoFormPage.jsx` (modo edición) |
| 3 | Visualizar un listado de candidatos | ✅ Implementado | `pages/CandidatosPage.jsx` |
| 4 | Crear una solicitud de evaluación asociada a un candidato | ✅ Implementado | `pages/SolicitudFormPage.jsx` |
| 5 | Registrar el cargo y familia de cargo de la solicitud | ✅ Implementado | Se toma del candidato al crear la solicitud |
| 6 | Visualizar el listado de solicitudes | ✅ Implementado | `pages/SolicitudesPage.jsx` |
| 7 | Buscar o filtrar solicitudes con criterios básicos | ✅ Implementado | `components/BandejaSolicitudes.jsx` (texto, estado, familia, responsable, rango de fechas) |
| 8 | Consultar el detalle de una solicitud | ✅ Implementado | `pages/SolicitudDetallePage.jsx` |
| 9 | Asignar o registrar un profesional responsable | ✅ Implementado | `pages/SolicitudFormPage.jsx` |
| 10 | Actualizar el estado de la solicitud | ✅ Implementado | `pages/SolicitudDetallePage.jsx` (con bitácora) |
| 11 | Registrar la fecha de evaluación | ✅ Implementado | Sección de evaluación en `SolicitudDetallePage.jsx` |
| 12 | Registrar observaciones o resultados de la evaluación | ✅ Implementado | Sección de evaluación en `SolicitudDetallePage.jsx` |
| 13 | Visualizar un dashboard con indicadores | ✅ Implementado | `pages/DashboardPage.jsx` |
| 14 | Publicar y administrar ofertas laborales | ✅ Implementado | `pages/OfertasPage.jsx`, `pages/OfertaFormPage.jsx` |
| 15 | Recibir postulaciones públicas con currículum | ✅ Implementado | `pages/PortalOfertasPage.jsx`, `pages/PostulacionPage.jsx` |
| 16 | Generar candidato y solicitud desde una postulación | ✅ Implementado | Acción `postular-oferta` en `context/motorEstado.js` |

**Estados de solicitud:** Pendiente → En proceso → Finalizada (los tres implementados).

**Estados de oferta:** Borrador → Publicada → Cerrada. Solo las ofertas publicadas y vigentes se muestran en el portal público.

## 2. Vistas

Las 7 vistas de referencia del anexo y su estado:

| Vista | Estado |
|-------|--------|
| Inicio / Dashboard | ✅ Implementada |
| Listado de candidatos | ✅ Implementada |
| Formulario de registro y edición de candidato | ✅ Implementada |
| Listado de solicitudes | ✅ Implementada |
| Formulario de nueva solicitud | ✅ Implementada |
| Detalle de una solicitud | ✅ Implementada |
| Sección para registrar/actualizar la evaluación | ✅ Implementada (dentro del detalle) |
| Portal público de ofertas | ✅ Implementada (`/postular`) |
| Formulario público de postulación | ✅ Implementada (`/postular/:ofertaId`) |
| Gestión interna de ofertas | ✅ Implementada (`/ofertas`, `/ofertas/nueva`, `/ofertas/:id`) |

Se agregó además una vista de error **404** (`pages/NoEncontradaPage.jsx`) para no dejar enlaces sin destino.

## 3. Información mínima gestionada

### Candidato
Campos requeridos por el anexo (todos implementados) más campos complementarios tomados del proceso real de AquaChile:

| Campo | Requerido | Implementado |
|-------|-----------|--------------|
| Nombre | Sí | ✅ |
| Correo electrónico | Sí | ✅ (con validación de formato y unicidad) |
| Teléfono | Sí | ✅ (con validación de formato) |
| Cargo al que postula | Sí | ✅ |
| Familia de cargo | Sí | ✅ |
| Origen (externo/interno) | No | ✅ Complementario |
| Ubicación del cargo | No | ✅ Complementario |
| Departamento | No | ✅ Complementario |
| Fecha de postulación | No | ✅ Complementario |
| Requiere referencia | No | ✅ Complementario |
| Canal de origen (interno/portal público) | No | ✅ Complementario |

### Oferta laboral
| Campo | Implementado |
|-------|--------------|
| Cargo | ✅ |
| Familia de cargo | ✅ |
| Ubicación | ✅ |
| Departamento | ✅ |
| Modalidad (Presencial/Híbrida/Remota) | ✅ |
| Funciones | ✅ |
| Beneficios | ✅ (opcional) |
| Sueldo o rango | ✅ (opcional) |
| Cantidad de vacantes | ✅ (entero ≥ 1) |
| Fecha de publicación | ✅ (no futura) |
| Fecha de cierre | ✅ (≥ publicación) |
| Descripción | ✅ (mínimo 20 caracteres) |
| Requisitos | ✅ (mínimo 15 caracteres) |
| Estado | ✅ (Borrador / Publicada / Cerrada) |
| Profesional responsable | ✅ |

### Solicitud de evaluación
| Campo | Implementado |
|-------|--------------|
| Candidato asociado | ✅ |
| Cargo | ✅ |
| Familia de cargo | ✅ |
| Fecha de solicitud | ✅ |
| Estado | ✅ |
| Profesional responsable | ✅ |
| Observaciones | ✅ |
| Prioridad | ✅ Complementario |
| Fecha de entrevista | ✅ Complementario |
| Fecha de informe | ✅ Complementario (se registra al finalizar) |
| Oferta de origen | ✅ Complementario (postulaciones del portal) |
| Canal | ✅ Complementario (Portal público) |
| Currículum adjunto | ✅ Complementario (archivo real persistido en `archivos_cv` con carpeta lógica, hash SHA-256 y descarga privada) |

### Evaluación
| Campo | Implementado |
|-------|--------------|
| Solicitud asociada | ✅ |
| Fecha de evaluación | ✅ (validada ≥ fecha de solicitud) |
| Resultado | ✅ (Apto / Apto con observaciones / No apto) |
| Categoría del evaluador | ✅ (Recomendado / Recomendado con observaciones / No recomendado) |
| Observaciones | ✅ (detalle obligatorio; se exige fundamento si el resultado es negativo) |

## 4. Requerimientos no funcionales

| Requisito | Estado | Detalle |
|-----------|--------|---------|
| Usabilidad | ✅ | Navegación con barra superior, migas de pan y estados vacíos con mensajes claros. |
| Identidad visual | ✅ | Paleta corporativa marina, etiquetas de estado con color e ícono, e iconografía coherente en tarjetas y secciones. |
| Accesibilidad | ✅ | Foco visible, contraste de texto, estados que no dependen solo del color y soporte para movimiento reducido. |
| Responsividad | ✅ | Maquetación Bootstrap 5 verificada en móvil, tablet y escritorio. |
| Validaciones | ✅ | Formularios con validación de campos, formato y reglas de negocio (correo único, fechas coherentes, solicitud activa única). |
| Trazabilidad | ✅ | Bitácora de cambios de estado por solicitud (quién, cuándo, anterior → nuevo). |
| Seguridad básica / privacidad | ✅ | JWT de acceso y refresh rotativo, roles aplicados en backend, contraseñas con bcrypt, CORS restringido, rate limit, CV privados y consentimiento explícito. |
| Confiabilidad | ✅ | Persistencia real en PGlite/PostgreSQL, manejo de errores, estados vacíos, transacciones para postulación y 79 pruebas backend. |
| Mantenibilidad | ✅ | Código modular (contexto, utilidades, componentes), sin comentarios y con pruebas automatizadas. |
| Despliegue | ✅ | Local documentado y verificado; Dockerfile y render.yaml como alternativa. |

## 5. Integración implementada en la etapa final

- API REST en Node.js + Express para candidatos, ofertas, postulaciones, solicitudes, evaluaciones, bitácora y dashboard.
- Base persistente PGlite (local) o PostgreSQL (`DATABASE_URL`) con relación oferta → postulación → candidato → solicitud → evaluación y carpeta CV.
- Almacenamiento real del currículum en `BYTEA`, validación de firma, hash SHA-256 y descarga privada autorizada.
- Autenticación JWT con refresh token rotativo, logout y roles ANALISTA/EVALUADOR/JEFATURA.
- Análisis de currículum con Groq como apoyo, con revisión humana registrada.
- Documentación OpenAPI/Swagger, 195 pruebas frontend, 79 pruebas backend y despliegue local.
- La notificación por correo permanece simulada en la interfaz.

## 6. Correspondencia con la problemática

| Problema de AquaChile | Cómo lo resuelve el MVP |
|-----------------------|-------------------------|
| Información dispersa (Excel, Planner, correo, chat) | Punto único de registro y consulta de candidatos y solicitudes. |
| Sin estado claro de cada candidato | Estados Pendiente/En proceso/Finalizada con bitácora de trazabilidad. |
| Seguimiento manual y tiempo perdido | Listados con filtros y búsqueda; dashboard con indicadores. |
| Falta de indicadores | Tiempo medio solicitud→informe, tasa de recomendación y distribución por familia de cargo. |
| Dificultad para distinguir quién registra vs. quién evalúa | Tres perfiles con permisos diferenciados. |
| Postulaciones recibidas por canales dispersos | Portal público de ofertas con postulación en línea y currículum. |
| Registro manual de cada postulante | La postulación crea o reutiliza el candidato, genera la solicitud pendiente y registra la bitácora automáticamente. |
