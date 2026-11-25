# Manual de usuario — MVP de Reclutamiento y Evaluación Psicolaboral AquaChile

## 1. Antes de comenzar

La aplicación tiene dos entradas:

- **Portal público:** `http://localhost:5173/postular` — cualquier persona puede
  revisar ofertas y postular con su currículum.
- **Acceso interno:** `http://localhost:5173/login` — solo personal autorizado.

El backend y la base local deben estar encendidos. Si la pantalla indica que no
hay conexión, revisa que `backend` esté ejecutándose en el puerto 3001.

### Cuentas demo

| Rol | Correo | Contraseña | Puede hacer |
|---|---|---|---|
| Analista de Reclutamiento | `analista@aquachile.cl` | `AquaChile2026!` | Candidatos, ofertas, solicitudes y revisión de IA |
| Profesional Evaluador | `evaluador@aquachile.cl` | `AquaChile2026!` | Ver sus solicitudes, evaluar y descargar CV asignados |
| Jefatura | `jefatura@aquachile.cl` | `AquaChile2026!` | Consultar dashboard, ofertas y solicitudes |

## 2. Iniciar y cerrar sesión

1. Abre `/login` o usa **Acceso equipo** desde el portal.
2. Ingresa tu correo institucional y contraseña.
3. Pulsa **Ingresar**.
4. La sesión se mantiene al recargar la página durante 7 días. El access token
   se renueva automáticamente.
5. Para salir, usa **Cerrar sesión** en la barra superior. La cookie de refresh
   se revoca en el servidor.

Si ves “Credenciales incorrectas”, revisa el correo y la contraseña. Tras varios
intentos fallidos el servidor aplica un límite temporal.

## 3. Dashboard

Muestra:

- cantidad de candidatos, solicitudes y ofertas;
- tiempo medio entre solicitud e informe;
- porcentaje de evaluaciones recomendadas;
- solicitudes por estado y ofertas por estado;
- últimas solicitudes y postulaciones del portal;
- un bloque de foco distinto según el rol.

El aviso superior indica si estás en **backend local conectado** o en **modo
demostración**. En modo conectado los cambios se guardan y persisten.

## 4. Candidatos

### Listar y buscar

- **Buscar candidato:** se expande al enfocar y filtra por nombre, cargo o
  correo.
- **Familia de cargo** y **Origen:** filtros en la misma fila.
- **Limpiar filtros** restablece la vista.

### Crear un candidato (Analista)

1. Pulsa **Registrar candidato**.
2. Completa nombre, correo, teléfono, fecha de postulación, cargo, familia,
   origen, ubicación y **Departamento**.
3. Marca **Requiere contacto de referencia** si corresponde.
4. Pulsa **Registrar candidato**.

El correo debe ser único y la fecha no puede ser futura.

### Editar o consultar

- Analista: puede editar y eliminar (con confirmación).
- Evaluador y Jefatura: ven la ficha en **solo lectura**.

## 5. Ofertas laborales

### Crear una oferta (Analista)

1. Entra a **Ofertas → Publicar oferta**.
2. Completa:
   - cargo, familia, **Departamento**, ubicación y modalidad;
   - cantidad de vacantes y profesional responsable;
   - descripción, funciones, requisitos, beneficios y sueldo o rango;
   - fechas de publicación y cierre;
   - estado: **Borrador**, **Publicada** o **Cerrada**.
3. Pulsa **Publicar oferta**.

Las ofertas **Publicadas** y vigentes aparecen automáticamente en el portal
público. Un **Borrador** no se muestra. Una oferta **Cerrada** deja de recibir
postulaciones, pero conserva su historial y postulaciones.

### Listar y filtrar

Los filtros de texto, familia y estado están en una sola fila. El buscador se
expande al enfocar. Desde cada tarjeta puedes editar, cerrar o volver a publicar
según el estado.

### Eliminar

Solo se puede eliminar una oferta **sin postulaciones**. Si ya tiene
postulaciones, ciérrala en lugar de eliminarla.

## 6. Portal público y postulación

1. Abre `/postular`.
2. Filtra por texto o familia.
3. Pulsa **Postular a esta oferta**.
4. Completa nombre, correo y teléfono.
5. Adjunta el currículum en **PDF, DOC o DOCX** (máximo 5 MB). El archivo se
   valida por contenido, no solo por extensión.
6. Autoriza el tratamiento de datos.
7. Pulsa **Enviar postulación**.

Al finalizar verás:

- **Número de folio** de la postulación (por ejemplo `AQ-2026-B8F186`).
- **Carpeta de currículum** asignada (por ejemplo
  `CV-2026-000001-PRUEBA-SMOKE-CV`).
- Confirmación de que el equipo revisará los antecedentes.

Si el correo ya postuló a la misma oferta, el sistema lo informa y evita
duplicados. Si la oferta cerró, no permite postular.

## 7. Postulaciones y currículums

La sección **Postulaciones** (Analista y Evaluador) muestra:

- folio, postulante, oferta y departamento;
- carpeta CV y fecha;
- estado de la postulación;
- botón para **descargar el currículum**.

La descarga exige sesión y permisos. El evaluador solo puede descargar CV de
candidatos con una solicitud asignada a su nombre. El archivo se entrega como
adjunto y no tiene URL pública.

## 8. Solicitudes de evaluación

### Crear (Analista)

1. **Solicitudes → Nueva solicitud**.
2. Elige un candidato sin solicitud activa.
3. Selecciona responsable, prioridad, fecha de solicitud, fecha de entrevista
   opcional y observaciones.
4. Pulsa **Crear solicitud**.

La solicitud nace en estado **Pendiente** y registra la primera entrada de la
bitácora.

### Bandeja

- El analista y la jefatura ven todas las solicitudes.
- El evaluador ve solo las asignadas a su nombre.
- Filtros: texto, estado, familia, responsable y rango de fechas.
- El contador indica cuántas solicitudes coinciden.

### Detalle

Incluye datos del candidato, oferta asociada, prioridad, fechas, evaluación,
currículum, bitácora y el panel de IA. El analista puede cambiar el estado; el
evaluador asignado puede evaluar.

## 9. Evaluación psicolaboral

1. Abre una solicitud asignada.
2. Completa fecha de evaluación, resultado y categoría.
3. Escribe observaciones (mínimo 10 caracteres; mínimo 20 si el resultado es
   negativo).
4. Usa **Guardar borrador** para mantener la solicitud en proceso o
   **Guardar y finalizar** para cerrarla.

La bitácora registra cada cambio con fecha y responsable. Una evaluación
guardada puede corregirse mientras la solicitud siga abierta.

## 10. Apoyo de IA sobre el currículum

El panel **Apoyo de IA sobre el currículum** aparece en el detalle de la
solicitud cuando existe un CV asociado.

1. Pulsa **Analizar CV con IA**.
2. Espera el resultado. Verás puntaje orientativo, resumen, formación,
   experiencia, cumplimiento de requisitos, preguntas sugeridas, datos
   faltantes y limitaciones.
3. Revisa críticamente el contenido.
4. Pulsa **Marcar revisión humana** cuando hayas validado el análisis.

Consideraciones:

- El análisis **no decide la contratación**.
- Puede equivocarse o no encontrar información.
- Si el proveedor no está configurado, el botón aparece deshabilitado y se
  indica cómo habilitarlo.
- La revisión humana queda registrada con nombre y fecha.

## 11. Estados y significados

| Estado | Significado |
|---|---|
| Borrador (oferta) | Visible solo para el equipo; no se publica |
| Publicada (oferta) | Visible en el portal mientras esté vigente |
| Cerrada (oferta) | No recibe nuevas postulaciones |
| Pendiente (solicitud) | Recibida, sin evaluación iniciada |
| En proceso (solicitud) | Evaluación en curso |
| Finalizada (solicitud) | Evaluación e informe cerrados |
| Recibida (postulación) | Postulación registrada desde el portal |

## 12. Privacidad y buenas prácticas

- Usa datos ficticios en demostraciones.
- No compartas tu contraseña ni la API key.
- Descarga currículums solo cuando sea necesario para el proceso.
- Cierra sesión al terminar en un equipo compartido.
- Recuerda que el análisis de IA es una ayuda, no un veredicto.

## 13. Problemas frecuentes

| Síntoma | Solución |
|---|---|
| “No hay conexión” o pantalla vacía | Verifica `backend`: `npm run dev` en el puerto 3001 |
| La sesión no se recupera | Revisa que el navegador acepte cookies de `localhost` |
| El botón de IA está deshabilitado | Configura `GROQ_API_KEY` en `backend/.env` y reinicia |
| “Sin permisos” | La cuenta no tiene el rol o la solicitud no está asignada |
| No puedo eliminar una oferta | Tiene postulaciones: ciérrala en su lugar |
| El CV no se adjunta | Usa PDF/DOC/DOCX real, menor a 5 MB |
| Los datos volvieron al inicio | Se eliminó `backend/data/aquachile` o se está en modo demo |

## 14. Detener la aplicación

En cada terminal, pulsa `Ctrl+C`. Los datos quedan en
`backend/data/aquachile`. Para reiniciar la demo desde cero, detén el backend y
elimina esa carpeta.
