# Evidencia de pruebas — MVP Evaluación Psicolaboral

Pruebas automatizadas con **Vitest** y **Testing Library** para la lógica y los componentes relevantes del frontend.

## Cómo ejecutarlas

```bash
npm run test            # Ejecuta todas las pruebas una vez
npm run test:watch      # Modo watch (desarrollo)
npm run test:coverage   # Ejecuta y genera reporte de cobertura
```

## Resultado de la última ejecución

```
 Test Files  12 passed (12)
      Tests  85 passed (85)
   Duration  3.64s
```

### Cobertura

```
File               | % Stmts | % Branch | % Funcs | % Lines
-------------------|---------|----------|---------|--------
All files          |   91.52 |     81.1 |   94.36 |   92.03
 src/components    |    90.9 |    85.54 |   88.88 |    92.5
 src/context       |    95.45 |    87.09 |     100 |      95
 src/pages         |   85.33 |    62.29 |   89.79 |   85.71
 src/utils         |    95.3 |    91.92 |     100 |   95.71

Statements   : 91.52% ( 389/425 )
Branches     : 81.1%  ( 322/397 )
Functions    : 94.36% ( 134/142 )
Lines        : 92.03% ( 358/389 )
```

## Escenarios probados y su justificación

Se priorizó probar la **lógica de negocio** y los **flujos críticos** del usuario, porque son los que sostienen la utilidad del MVP ante AquaChile.

### 1. Validaciones de formularios (`utils/validaciones.test.js`)
Justificación: los formularios son la puerta de entrada de los datos. Un correo duplicado o una fecha incoherente corromperían el seguimiento.

- Formato de correo y teléfono.
- Candidato: campos obligatorios, correo duplicado (y que al editar se conserve el propio), fecha de postulación no futura, nombre mínimo.
- Solicitud: candidato inexistente, candidato con solicitud activa única, fecha no futura.
- Evaluación: campos obligatorios, fecha no anterior a la solicitud, resultado "Sin resultado" rechazado, fundamento obligatorio cuando el resultado es negativo.

### 2. Manejo de fechas (`utils/fechas.test.js`)
Justificación: los indicadores de tiempo y las reglas de coherencia dependen de fechas bien formadas.

- Formato ISO, fechas futuras, diferencia en días y formato de presentación.

### 3. Indicadores y filtros (`utils/selectores.test.js`)
Justificación: el dashboard y los listados son el valor central para la jefatura de AquaChile.

- Conteo por estado, promedio de días solicitud→informe, tasa de recomendación, distribución por familia.
- Filtros de candidatos (texto, familia, origen) y de solicitudes (estado, responsable, rango de fechas, texto).

### 4. Lógica de estado (`context/motorEstado.test.js`)
Justificación: la trazabilidad y los permisos son los que separan un CRUD genérico de una solución al problema real.

- CRUD de candidatos con **eliminación en cascada** (solicitudes, evaluaciones y bitácora).
- Creación de solicitud con registro automático en bitácora.
- Cambio de estado que agrega bitácora y **no** duplica registros si el estado no cambia.
- Guardado y actualización de evaluaciones (upsert).
- Permisos de los tres perfiles (analista, evaluador, jefatura de solo consulta).

### 5. Componentes (`components/*.test.jsx`)
Justificación: los componentes reutilizables sostienen varias vistas; un fallo se propaga.

- `EtiquetaEstado`: estilo correcto por estado.
- `BandejaSolicitudes`: renderizado, filtros por estado/texto y estado vacío.

### 6. Páginas y flujo de usuario (`pages/*.test.jsx`, `App.test.jsx`)
Justificación: se verifica el recorrido real del usuario, de registro a evaluación.

- `CandidatoFormPage`: errores al enviar vacío, correo duplicado, precarga en edición.
- `CandidatosPage`: listado, filtro por origen, **eliminación con diálogo de confirmación**.
- `SolicitudFormPage`: solo ofrece candidatos sin solicitud activa, validación y resumen.
- `SolicitudesPage` / `DashboardPage`: renderizado correcto e indicadores.
- **Integración (`App.test.jsx`)**: el Evaluador guarda y finaliza una solicitud asignada; la bitácora y el estado se actualizan. Ruta inexistente muestra la 404.

## Nota sobre la simulación

Las pruebas usan los mismos datos ficticios que la aplicación. No se conecta a backend ni base de datos; el estado vive en memoria (Context + `useReducer`), lo que permite probar la lógica de forma determinista.
