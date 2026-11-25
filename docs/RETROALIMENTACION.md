# Retroalimentación de la evaluación y mejoras aplicadas

**Proyecto:** MVP Evaluación Psicolaboral — AquaChile  
**Asignatura:** Desarrollo Full Stack II (DSY1104)  
**Resultado:** 96/100 puntos — Nota 6,7

Este documento consolida la retroalimentación recibida, las mejoras implementadas en esta versión y las sugerencias que se incorporan a la hoja de ruta. El comentario final se presenta una sola vez, al cierre, para evitar repeticiones.

---

## 1. Aspectos destacados

- Cumple con la mayoría de los requerimientos y funcionalidades solicitadas.
- Proyecto funcional, completo y con una buena base de desarrollo.
- Autonomía, compromiso y capacidad de trabajo individual.
- Potencial para incorporar funcionalidades que optimicen el reclutamiento y la selección.

## 2. Criterio de priorización

Las oportunidades de mejora se ordenaron según impacto en la experiencia de usuario, esfuerzo de implementación y coherencia con el alcance actual del MVP (frontend con datos simulados).

| Prioridad | Mejora | Decisión |
|-----------|--------|----------|
| Alta | Diseño visual, etiquetas de estado, paleta corporativa e iconografía | Implementada en esta versión |
| Media | Consistencia de componentes, dashboard por rol y estados vacíos | Implementada en esta versión |
| Baja / futura | Portal público de postulaciones y ofertas laborales | Implementada en esta versión |
| Baja / futura | Perfil reutilizable del postulante y gráficos avanzados | Parcial: reutilización por correo; gráficos planificados para la etapa con backend |

---

## 3. Mejoras implementadas

### 3.1 Diseño visual e identidad de la aplicación

Se construyó un sistema visual propio sobre Bootstrap 5:

- Encabezados de página con contexto, migas de pan y acciones principales.
- Tarjetas con radio uniforme, bordes suaves, sombras y elevación al pasar el cursor.
- Avatares con iniciales para candidatos y jerarquía tipográfica más clara.
- Barra de navegación con identidad marina, íconos y estado activo visible.
- Filtros agrupados en tarjetas, tablas contenidas y mensajes de estado vacío ilustrados.
- Diseño responsivo revisado para móvil, tablet y escritorio.
- Estilos de foco visibles y soporte para `prefers-reduced-motion`.

**Archivos principales:** `src/index.css`, `src/components/Layout.jsx`, `src/components/FichaCandidato.jsx`, `src/components/BandejaSolicitudes.jsx`.

### 3.2 Etiquetas de estado diferenciadas

- Cada estado tiene color, borde, fondo e ícono propios: **Pendiente**, **En proceso**, **Finalizada**, **Aprobada**, **Rechazada** y **Sin solicitud**.
- Se corrigió la interpolación de clases del dashboard, que generaba etiquetas sin color.
- Se incorporó la prioridad con indicador visual (alta, media, baja).
- El color nunca es el único canal: cada etiqueta incluye texto e ícono, lo que mejora la accesibilidad.

**Archivos:** `src/components/EtiquetaEstado.jsx`, `src/index.css`, `src/pages/DashboardPage.jsx`.

### 3.3 Paleta de colores corporativa

- Se reemplazaron los colores predeterminados de Bootstrap por variables de marca: azul profundo, azul medio, aqua, verde, ámbar y rojo.
- Se ajustaron variables nativas de Bootstrap (`--bs-primary`, enlaces, bordes, radios y fondo) para que componentes como botones, formularios y paginación mantengan coherencia.
- La paleta se aplica en navegación, botones, tablas, indicadores y etiquetas.

**Archivo:** `src/index.css`.

### 3.4 Iconografía en tarjetas y secciones

- Se incorporó `bootstrap-icons` al punto de entrada de la aplicación.
- Los datos de las tarjetas de candidato ahora incluyen íconos de cargo, familia, ubicación, correo y teléfono.
- Los KPI del dashboard tienen ícono, color y detalle; se eliminó el pie genérico "Indicador clave" por no aportar información.
- Se agregaron íconos en navegación, formularios, bitácora, botones y estados.

**Archivos:** `src/main.jsx`, `src/components/TarjetaKpi.jsx`, `src/components/FichaCandidato.jsx`, `src/pages/*.jsx`.

### 3.5 Consistencia y experiencia de usuario

- Se restauró la vista de **detalle de solicitud**, que concentra la evaluación, el cambio de estado y la bitácora.
- El dashboard ahora muestra un bloque de enfoque según el rol activo (analista, evaluador o jefatura) y el avance del proceso.
- Se agregó el estado del candidato en las tarjetas y el conteo de resultados filtrados.
- Se incorporaron acciones para limpiar filtros y mensajes vacíos más claros.
- Se eliminaron archivos temporales, duplicados y restos de herramientas que no formaban parte del proyecto.

### 3.6 Portal público de postulaciones y gestión de ofertas

Se incorporó el módulo que reduce la carga manual del analista:

- **Portal público sin login** (`/postular`): lista solo ofertas publicadas y vigentes, con búsqueda por cargo, planta o unidad y filtro por familia de cargo.
- **Postulación en línea** (`/postular/:ofertaId`): formulario con nombre, correo, teléfono, currículum (PDF/DOC/DOCX, máximo 5 MB) y consentimiento de datos.
- **Automatización del registro**: cada postulación crea o reutiliza el candidato por correo, genera una solicitud **Pendiente** asignada al responsable de la oferta y agrega el ingreso a la **bitácora**.
- **Prevención de duplicados**: un mismo correo no puede postular dos veces a la misma oferta.
- **Gestión interna de ofertas** (`/ofertas`): el analista publica, edita y cierra vacantes con familia, ubicación, unidad, requisitos, fecha de cierre y responsable.
- **Visibilidad**: el dashboard muestra un panel de reclutamiento en línea con ofertas, vacantes y últimas postulaciones del portal.
- En la entrega EA3 el currículum se persiste como archivo real en el backend (`BYTEA`), con carpeta lógica, hash SHA-256 y descarga privada autorizada.

**Archivos principales:** `src/pages/PortalOfertasPage.jsx`, `src/pages/PostulacionPage.jsx`, `src/pages/OfertasPage.jsx`, `src/pages/OfertaFormPage.jsx`, `src/components/PortalLayout.jsx`, `src/context/motorEstado.js`, `src/utils/validaciones.js`, `src/utils/selectores.js`.

---

## 4. Sugerencias opcionales para la siguiente etapa

Estas iniciativas aportan valor, pero requieren backend, persistencia y autenticación; por eso se planifican después de la entrega actual.

| Sugerencia | Valor para AquaChile | Dependencia | Estado |
|------------|----------------------|-------------|--------|
| Portal público de postulaciones | Recepción automática de antecedentes y currículum, menor carga administrativa | API, carga de archivos y validación de identidad | ✅ Implementado full stack |
| Publicación de ofertas laborales | Los analistas publican cargos, vacantes y requisitos; los postulantes se inscriben en línea | Modelo de ofertas y backend | ✅ Implementado full stack |
| Perfil reutilizable del postulante | Postular a varias ofertas sin repetir formularios | Autenticación, perfil persistente y consentimiento de datos | ⚠️ Parcial: reutilización por correo |
| Dashboard con gráficos (Chart.js u otro) | Indicadores por rol, tendencias y comparación entre periodos | Datos persistidos y definición de métricas con AquaChile | ⏳ Pendiente |
| Funcionalidades diferenciadoras | Mayor valor frente a otras propuestas | Levantamiento de necesidades reales con la contraparte | ⏳ Pendiente |

**Decisión:** el portal público y la gestión de ofertas se adelantaron porque reducen directamente el trabajo manual del analista. En la EA3 se agregó persistencia real, autenticación interna por roles y almacenamiento privado del currículum. Los gráficos avanzados y la autenticación de postulantes públicos quedan como hoja de ruta.

---

## 5. Comentario final

El proyecto cumple satisfactoriamente los objetivos y obtiene una evaluación destacada (96/100). Esta versión refuerza la presentación visual, la consistencia de los componentes y la claridad de los estados, y suma el portal público de postulaciones con gestión de ofertas, que automatiza el alta de candidatos y solicitudes. El siguiente paso es persistir esa información en backend, almacenar el currículum real y validar con AquaChile los indicadores de gestión para priorizar la etapa final.


---

## 6. Cierre de la entrega EA3

Además de las mejoras anteriores, la entrega final incorpora:

- **Backend Node.js + Express** con API REST, Swagger y validación Zod.
- **Persistencia** en PGlite local o PostgreSQL mediante `DATABASE_URL`.
- **JWT con refresh rotativo**, logout, sesión persistente y roles
  ANALISTA/EVALUADOR/JEFATURA.
- **Currículums reales** en carpetas lógicas, con descarga privada y hash
  SHA-256.
- **IA Groq** (`openai/gpt-oss-120b`) como apoyo, con revisión humana
  registrada.
- **195 pruebas frontend** y **79 pruebas backend**, ambas con cobertura
  superior al 85%.
- **7 ajustes de experiencia:** menos espacios vacíos, filtros unidos en una
  fila, buscadores expandibles, renombre a “Departamento”, logo en el botón
  hamburguesa, zonas vacías completadas y menús más consistentes.
- **Despliegue local** documentado, con `Dockerfile` y `render.yaml` como
  alternativas.
