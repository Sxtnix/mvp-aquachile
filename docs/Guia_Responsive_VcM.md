# Clase 4 — Guía paso a paso: Responsive con Bootstrap 5

## Objetivo

En esta clase continuarás con el mismo proyecto React.

Aprenderás a:

- adaptar la interfaz a móvil, tablet y escritorio;
- usar Grid y breakpoints de Bootstrap;
- crear formularios y tablas responsive;
- aplicar estos cambios al proyecto VcM del equipo.

> No usaremos todavía `useState`, React Router ni formularios funcionales.

---

# 1. Abrir el proyecto

Abre:

```text
vcm-psicolaboral/
```

Ejecuta:

```bash
npm run dev
```

Trabajaremos con:

```text
src/components/CandidatoCard.jsx
src/pages/DashboardPage.jsx
```

y crearemos:

```text
src/components/SolicitudesPanel.jsx
```

---

# 2. Mobile First

Bootstrap trabaja primero pensando en móvil.

Ejemplo:

```jsx
<div className="col-12 col-md-6 col-xl-4">
```

Significa:

```text
Móvil       → 1 columna
Tablet      → 2 columnas
Escritorio  → 3 columnas
```

Breakpoints principales:

| Clase | Desde |
|---|---:|
| sin breakpoint | móvil |
| `md` | 768 px |
| `lg` | 992 px |
| `xl` | 1200 px |

---

# 3. Modificar `CandidatoCard.jsx`

Abre:

```text
src/components/CandidatoCard.jsx
```

Cambia:

```jsx
<div className="col-md-6 col-lg-4">
```

por:

```jsx
<div className="col-12 col-md-6 col-xl-4">
```

Archivo completo:

```jsx
function CandidatoCard({ nombre, cargo, estado }) {
  return (
    <div className="col-12 col-md-6 col-xl-4">
      <div className="card h-100">
        <div className="card-body">
          <h3 className="h5">{nombre}</h3>

          <p className="text-secondary mb-2">
            {cargo}
          </p>

          <span className="badge text-bg-secondary">
            {estado}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CandidatoCard;
```

---

# 4. Crear `SolicitudesPanel.jsx`

Crear:

```text
src/components/SolicitudesPanel.jsx
```

```jsx
function SolicitudesPanel({ solicitudes }) {
  return (
    <section className="mt-5">

      <div className="d-flex flex-column flex-md-row
                      justify-content-between gap-2 mb-3">

        <h2 className="h4 mb-0">
          Solicitudes recientes
        </h2>

        <button className="btn btn-primary">
          Nueva solicitud
        </button>
      </div>

      <div className="row g-2 mb-3">

        <div className="col-12 col-md-8">
          <input
            className="form-control"
            placeholder="Buscar candidato..."
          />
        </div>

        <div className="col-12 col-md-4">
          <select className="form-select">
            <option>Todos los estados</option>
            <option>Pendiente</option>
            <option>En proceso</option>
            <option>Finalizada</option>
          </select>
        </div>

      </div>

      <div className="table-responsive">

        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Candidato</th>
              <th>Cargo</th>
              <th>Estado</th>

              <th className="d-none d-lg-table-cell">
                Responsable
              </th>
            </tr>
          </thead>

          <tbody>
            {solicitudes.map((solicitud) => (
              <tr key={solicitud.id}>

                <td>{solicitud.candidato}</td>
                <td>{solicitud.cargo}</td>

                <td>
                  <span className="badge text-bg-secondary">
                    {solicitud.estado}
                  </span>
                </td>

                <td className="d-none d-lg-table-cell">
                  {solicitud.responsable}
                </td>

              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </section>
  );
}

export default SolicitudesPanel;
```

Conceptos importantes:

```text
flex-column flex-md-row
→ apila en móvil y ordena en fila desde tablet.

table-responsive
→ evita que la tabla rompa la pantalla.

d-none d-lg-table-cell
→ oculta información secundaria en móvil y tablet.
```

---

# 5. Importar el componente

Abre:

```text
src/pages/DashboardPage.jsx
```

Agrega:

```jsx
import SolicitudesPanel from "../components/SolicitudesPanel";
```

---

# 6. Agregar datos simulados

Dentro de `DashboardPage()` agrega:

```jsx
const solicitudes = [
  {
    id: 1,
    candidato: "Ana Torres",
    cargo: "Analista",
    estado: "Pendiente",
    responsable: "Laura Pérez"
  },
  {
    id: 2,
    candidato: "Diego Soto",
    cargo: "Supervisor",
    estado: "En proceso",
    responsable: "Carlos Díaz"
  },
  {
    id: 3,
    candidato: "Camila Rojas",
    cargo: "Operador",
    estado: "Finalizada",
    responsable: "Laura Pérez"
  }
];
```

Usa siempre datos ficticios.

---

# 7. Mostrar el panel

Después de la sección de candidatos agrega:

```jsx
<SolicitudesPanel solicitudes={solicitudes} />
```

Flujo de datos:

```text
solicitudes
    ↓
props
    ↓
SolicitudesPanel
    ↓
map()
    ↓
tabla
```

---

# 8. Probar Responsive

Abre las herramientas del navegador:

```text
F12
```

Activa modo dispositivo:

```text
Ctrl + Shift + M
```

Prueba:

```text
375 px   → móvil
768 px   → tablet
1200 px  → escritorio
```

Verifica que:

- las cards se reorganicen;
- el formulario se apile en móvil;
- la tabla no rompa la pantalla;
- Responsable aparezca solo en escritorio.

---

# 9. Trabajo del equipo

Ahora apliquen lo aprendido a su propio proyecto VcM.

## Deben realizar

1. Revisar sus interfaces en:

```text
375 px
768 px
1200 px
```

2. Aplicar Grid responsive en alguna sección:

```jsx
col-12 col-md-6 col-xl-4
```

3. Crear o mejorar un listado de:

```text
Candidatos
Solicitudes
Evaluaciones
```

4. Usar:

```jsx
<div className="table-responsive">
```

5. Agregar visualmente:

```text
campo de búsqueda
select de filtro
```

Todavía no deben funcionar.

6. Ocultar al menos una columna secundaria en móvil:

```jsx
className="d-none d-lg-table-cell"
```

---

# 10. Organización del equipo

Pueden repartirse así:

```text
Integrante 1 → Dashboard
Integrante 2 → Candidatos
Integrante 3 → Solicitudes
Integrante 4 → Formularios / tablas
Integrante 5 → pruebas responsive
```

Si son menos integrantes, agrupen tareas.

Todos deben trabajar sobre el mismo proyecto.

---

# 11. Guardar avance

```bash
git add .
git commit -m "Clase 4: interfaces responsive"
git push
```

---

# 12. Evidencia final

El equipo debe mostrar:

- vista móvil;
- vista tablet;
- vista escritorio;
- uso de Grid;
- tabla responsive;
- búsqueda y filtro visual;
- repositorio actualizado.

---

# Próxima clase

Continuaremos desde:

```text
SolicitudesPanel.jsx
```

Los controles:

```jsx
<input />
<select />
```

todavía no funcionan.

En la próxima clase aprenderemos:

```text
useState
onChange
filter()
inputs controlados
eventos
```

para convertir estos filtros visuales en filtros funcionales.
