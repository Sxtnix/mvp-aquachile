# MVP Evaluación Psicolaboral — AquaChile

Proyecto de Vinculación con el Medio (VcM) de la asignatura **Desarrollo Full Stack II (DSY1104)**. Aplicación web que centraliza la gestión de evaluaciones psicolaborales de los candidatos que postulan a cargos en AquaChile.

> **Etapa actual:** avance de frontend en React. Los datos son ficticios y se manejan en memoria. La integración con backend y base de datos corresponde a la etapa final del MVP.

---

## Contexto del caso

AquaChile es una empresa salmonera del sur de Chile. Su área de Reclutamiento y Selección coordina evaluaciones psicolaborales para candidatos que postulan a distintos cargos.

Hoy el proceso es **disperso**: planillas Excel, un tablero Planner, correos y chats, sin un punto central que muestre el estado real de cada candidato. Esto genera pérdida de visibilidad, seguimiento manual y tiempo perdido.

## Problema

No existe un sistema centralizado que permita registrar candidatos, crear solicitudes de evaluación, hacer seguimiento de su estado y consultar la información de forma simple y ordenada.

## Solución

Un MVP de aplicación web que centraliza:

1. Registro y consulta de candidatos.
2. Creación y seguimiento de solicitudes de evaluación psicolaboral.
3. Registro de evaluaciones (fecha, resultado, categoría y observaciones).
4. Actualización de estado: **Pendiente → En proceso → Finalizada**, con bitácora de trazabilidad.
5. Dashboard con indicadores del proceso (estados, tiempo medio de informe, tasa de recomendación, distribución por familia de cargo).

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | React 19 |
| Build | Vite 8 |
| Enrutamiento | React Router 7 |
| Estilos | Bootstrap 5 |
| Estado global | Context API + `useReducer` |
| Pruebas | Vitest + Testing Library |
| Lint | ESLint |

## Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el servidor de desarrollo
npm run dev
# La aplicación queda en http://localhost:5173

# 3. Compilar para producción
npm run build

# 4. Ejecutar pruebas
npm run test

# 5. Ejecutar pruebas con cobertura
npm run test:coverage

# 6. Analizar el código
npm run lint
```

## Estructura del proyecto

```
vcm-psicolaboral/
├── index.html
├── package.json
├── vite.config.js
├── vitest.config.js
├── eslint.config.js
└── src/
    ├── main.jsx                  # Punto de entrada
    ├── App.jsx                   # Rutas de la aplicación
    ├── index.css                 # Estilos personalizados (paleta de marca)
    ├── context/
    │   ├── AppContext.jsx        # Provider global (datos, perfil, permisos)
    │   └── motorEstado.js        # Reducer puro + permisos por perfil
    ├── data/
    │   ├── catalogos.js          # Catálogos (familias, ubicaciones, perfiles…)
    │   └── datosIniciales.js     # Datos ficticios de arranque
    ├── utils/
    │   ├── fechas.js             # Manejo y formato de fechas
    │   ├── validaciones.js       # Reglas de validación de formularios
    │   └── selectores.js         # Indicadores y filtros
    ├── components/               # Componentes reutilizables
    └── pages/                    # Vistas asociadas a cada ruta
```

## Roles y permisos

| Perfil | Candidatos | Solicitudes | Evaluación | Estado |
|--------|-----------|-------------|-----------|--------|
| **Analista de Reclutamiento** | Crear / editar / eliminar | Crear | Solo consulta | Solo consulta |
| **Profesional Evaluador** | Solo consulta | Solo las asignadas | Editar | Cambiar |
| **Jefatura** | Solo consulta | Solo consulta | Solo consulta | Solo consulta |

El perfil se simula con un selector en la barra superior (no hay autenticación en esta etapa). Cada rol ve y puede hacer solo lo que le corresponde.

## Flujo principal

1. El **Analista** registra un candidato (nombre, contacto, cargo, familia, ubicación, origen, etc.).
2. El Analista crea una **solicitud de evaluación** para ese candidato, asignando responsable y prioridad. La solicitud nace en estado **Pendiente**.
3. El **Evaluador** ve sus solicitudes asignadas, agenda la entrevista y avanza el estado a **En proceso**.
4. El Evaluador registra la **evaluación** (fecha, resultado, categoría y observaciones) y puede **Guardar y finalizar**, lo que cierra la solicitud en **Finalizada** y registra la fecha de informe.
5. Cada cambio de estado queda en la **bitácora** (quién, cuándo, estado anterior → nuevo).
6. El **Dashboard** resume todo con indicadores.

## Rutas

| Ruta | Vista |
|------|-------|
| `/` | Dashboard con indicadores |
| `/candidatos` | Listado de candidatos con filtros |
| `/candidatos/nuevo` | Registro de candidato |
| `/candidatos/:id` | Edición / ficha de candidato |
| `/solicitudes` | Bandeja de solicitudes con filtros |
| `/solicitudes/nueva` | Nueva solicitud de evaluación |
| `/solicitudes/:id` | Detalle, bitácora y evaluación |
| `*` | Página 404 |

## Alcance de la etapa

**Implementado en esta entrega (frontend):**
- React con componentes reutilizables, props, arreglos y `.map()`.
- `useState`, eventos, búsqueda, filtros, renderizado condicional.
- Formularios con validación de campos y navegación con React Router.
- Responsive con Bootstrap 5 (verificado en 375, 768 y 1200 px).
- Tres perfiles con permisos diferenciados.
- Bitácora de estados (trazabilidad).
- Indicadores y filtros por estado, familia, responsable y rango de fechas.
- Pruebas unitarias y de integración con Vitest.

**Pendiente (etapa final):**
- Backend monolítico (API REST).
- Base de datos y persistencia real.
- Autenticación y usuarios.
- Despliegue (por ejemplo, Vercel para el frontend).

## Datos

Todos los datos son **ficticios o anonimizados**. No se utiliza información personal real de candidatos ni datos sensibles de AquaChile.

## Integrante

- **Diego Andrés Díaz Hernández**
