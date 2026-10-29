# ERS — Especificación de Requerimientos
## MVP Evaluación Psicolaboral — AquaChile

Documento de requisitos actualizado correspondiente al avance de frontend (Evaluación Parcial 2). Describe el alcance implementado, las funcionalidades pendientes y la correspondencia con la problemática de AquaChile.

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

**Estados de solicitud:** Pendiente → En proceso → Finalizada (los tres implementados).

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
| Unidad contratante | No | ✅ Complementario |
| Fecha de postulación | No | ✅ Complementario |
| Requiere referencia | No | ✅ Complementario |

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
| Responsividad | ✅ | Maquetación Bootstrap 5 verificada en 375, 768 y 1200 px. |
| Validaciones | ✅ | Formularios con validación de campos, formato y reglas de negocio (correo único, fechas coherentes, solicitud activa única). |
| Trazabilidad | ✅ | Bitácora de cambios de estado por solicitud (quién, cuándo, anterior → nuevo). |
| Seguridad básica / privacidad | ⚠️ Parcial | Perfiles con permisos diferenciados; sin autenticación real en esta etapa. |
| Confiabilidad | ⚠️ Parcial | Manejo de errores y estados vacíos; persistencia real pendiente (etapa final). |
| Mantenibilidad | ✅ | Código modular (contexto, utilidades, componentes), sin comentarios y con pruebas automatizadas. |
| Despliegue | ⚠️ Pendiente | Correspondiente a la etapa final. |

## 5. Funcionalidades fuera de esta etapa

De acuerdo con el anexo, la integración con backend y base de datos **no es condición** de la Evaluación Parcial 2. Quedan para la etapa final:

- Backend monolítico (API REST) para gestionar candidatos, solicitudes y evaluaciones.
- Base de datos con persistencia y relación candidato → solicitud → evaluación.
- Autenticación y gestión de usuarios.
- Despliegue de frontend y backend en servicios gratuitos.

## 6. Correspondencia con la problemática

| Problema de AquaChile | Cómo lo resuelve el MVP |
|-----------------------|-------------------------|
| Información dispersa (Excel, Planner, correo, chat) | Punto único de registro y consulta de candidatos y solicitudes. |
| Sin estado claro de cada candidato | Estados Pendiente/En proceso/Finalizada con bitácora de trazabilidad. |
| Seguimiento manual y tiempo perdido | Listados con filtros y búsqueda; dashboard con indicadores. |
| Falta de indicadores | Tiempo medio solicitud→informe, tasa de recomendación y distribución por familia de cargo. |
| Dificultad para distinguir quién registra vs. quién evalúa | Tres perfiles con permisos diferenciados. |
