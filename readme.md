# MVP Evaluacion Psicolaboral - AquaChile

Proyecto academico de la Asignatura Fullstack II Seccion 002D

# Contexto del Caso

AquaChile es una empresa salmonera del sur de Chile. Su area de Reclutamiento y Seleccion coordina evaluaciones psicolaborales para cnadidatos que postulan a distintos cargos dentro de la organizacion.

Actualmente este proceso se gestiona de forma dispersa: se utilizan planillas Excel , un tablero Planner y otras herramientas sin un punto central que permita ver el estado real de cada candidato. Esto genera perdida de visibilidad, seguimiento manual y tiempo perdido.

# Problema

No existe un sistema centralizado que permita registrar candidatos, crear solicitudes de evaluacion, hacer seguimiento de su estado y consultar la informacion de forma simple y ordenada.

# Solucion Propuesta

Un MVP de aplicacion Web Fullstack que centralice:

1° Registro y consultas de candidatos
2° Creacion y seguimiento de solicitudes de evaluacion psicolaboral
3° Registro de evaluaciones (fecha,observaciones, resultado)
4° Actualizacion de estado: Pendiente -> En Proceso -> Finalizada.
5° Dashboard simple con indicaciones generales del proceso

# Usuarios del sistema

Analista de Reclutamiento: Registra candidatos y genera solicitudes de evaluacion

Profesional Evaluador: Consulta solicitudes asignadas, registra la evaluacion y actualiza el estado.


# Arquitectura 

React (Bootstrap 5 / Tailwind CSS)  →  Backend monolítico  →  Base de datos

Fronted: React
Backend: monolitico (Spring Boot / PHP / Node.js - a definir)
Base de datos: a definir , compatible con herramientas gratuitas


# Restricciones del Proyecto

Todos los datos utilizados son ficticios o simulados. No se usan antecedentes reales de candidatos ni informacion sensible de AquaChile.
No se entregan herramientas corporativas de pago (Copilot, Power Automate, Planner, SharePoint) - quedan como oportunidades de evolucion futura.
Desarrollo con tecnologias y servicios gratuitos

# Integrantes
Diego Andrés Díaz Hernández